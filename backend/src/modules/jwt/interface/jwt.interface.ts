import { JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

export abstract class IInternalJwtService {
  abstract sign(payload: Buffer | object, options?: JwtSignOptions): string;
  abstract verify(token: string, options?: JwtVerifyOptions);
}
