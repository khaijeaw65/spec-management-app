import { Injectable } from '@nestjs/common';
import { IInternalJwtService } from './interface/jwt.interface';
import {
  JwtSignOptions,
  JwtVerifyOptions,
  JwtService as NestJwtService,
} from '@nestjs/jwt';

@Injectable()
export class InternalJwtService implements IInternalJwtService {
  constructor(private readonly nestJwtService: NestJwtService) {}

  sign(payload: Buffer | object, options?: JwtSignOptions): string {
    return this.nestJwtService.sign(payload, options);
  }

  verify<T extends object = object>(
    token: string,
    options?: JwtVerifyOptions,
  ): T {
    return this.nestJwtService.verify<T>(token, options);
  }
}
