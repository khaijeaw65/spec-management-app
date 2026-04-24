import { AuthUserDto } from '@spec-app/schemas';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUserDto;
  }
}
