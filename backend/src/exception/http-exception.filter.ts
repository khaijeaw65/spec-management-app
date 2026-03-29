import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

function messageFromResponse(
  exceptionResponse: string | Record<string, unknown>,
): string | string[] {
  if (typeof exceptionResponse === 'string') {
    return exceptionResponse;
  }
  const raw = exceptionResponse['message'];
  if (typeof raw === 'string') {
    return raw;
  }
  if (Array.isArray(raw) && raw.every((m) => typeof m === 'string')) {
    return raw;
  }
  return 'Error';
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : messageFromResponse(exceptionResponse as Record<string, unknown>);

    res.status(status).json({
      status,
      message,
    });
  }
}
