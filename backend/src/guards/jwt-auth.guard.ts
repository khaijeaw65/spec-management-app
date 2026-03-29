import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AuthUserDto } from '@spec-app/schemas';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';
import { Request } from 'express';

function passportInfoMessage(info: unknown): string | undefined {
  if (typeof info === 'string') {
    return info;
  }
  if (
    info &&
    typeof info === 'object' &&
    'message' in info &&
    typeof (info as { message: unknown }).message === 'string'
  ) {
    return (info as { message: string }).message;
  }
  return undefined;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (this.isPublicRoute(context)) {
      return true;
    }
    this.checkTokenExistsInHeader(context);

    return super.canActivate(context);
  }

  private isPublicRoute(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    return isPublic;
  }

  private checkTokenExistsInHeader(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('token not found in header');
    }

    return token;
  }

  handleRequest<T extends AuthUserDto>(
    err: unknown,
    user: T | false,
    info: unknown,
  ): T {
    if (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Authentication failed';
      throw new UnauthorizedException(message);
    }

    if (!user) {
      const raw = passportInfoMessage(info);
      const message =
        raw === 'No auth token'
          ? 'token not found in header'
          : (raw ?? 'Authentication required');
      throw new UnauthorizedException(message);
    }

    return user;
  }
}
