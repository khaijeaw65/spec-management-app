import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { IRequestContextService } from '../../contexts/request/interfaces/request.context.interface';
import { createLogger, format, Logger, transports } from 'winston';

const { combine, timestamp, json, colorize, printf, errors } = format;

function logField(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (typeof value === 'bigint') return String(value);
  if (value instanceof Error) return value.stack ?? value.message;
  if (typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'symbol') return value.toString();
  return '';
}

const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf((info) => {
    const { level, message, context, timestamp: ts, stack, ...meta } = info;
    const contextStr = logField(context);
    const ctx = contextStr === '' ? '' : `[${contextStr}]`;
    const stackStr = logField(stack);
    const err = stackStr === '' ? '' : `\n${stackStr}`;
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${logField(ts)} ${logField(level)} ${ctx} ${logField(message)}${extra}${err}`;
  }),
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: Logger;

  constructor(private readonly requestContextService: IRequestContextService) {
    this.logger = createLogger({
      format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
      transports: [new transports.Console()],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context, ...this.getRequestContext() });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { context, trace, ...this.getRequestContext() });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context, ...this.getRequestContext() });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context, ...this.getRequestContext() });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context, ...this.getRequestContext() });
  }

  private getRequestContext() {
    return {
      requestId: this.safeGet(() => this.requestContextService.requestId),
      userId: this.safeGet(() => this.requestContextService.userId),
    };
  }

  private safeGet(fn: () => string): string | undefined {
    try {
      return fn();
    } catch {
      return undefined;
    }
  }
}
