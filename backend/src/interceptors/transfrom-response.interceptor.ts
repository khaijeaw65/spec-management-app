import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, EMPTY, mergeMap, of } from 'rxjs';
import type { Response } from 'express';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      mergeMap((data: unknown) => {
        if (response.headersSent) {
          return EMPTY;
        }
        return of({
          status: response.statusCode,
          message: 'success',
          data,
        });
      }),
    );
  }
}
