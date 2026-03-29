import { AuthUserDto } from '@spec-app/schemas';

declare namespace Express {
  interface Request {
    user?: AuthUserDto;
  }
}
