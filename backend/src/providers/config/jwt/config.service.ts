import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';

@Injectable()
export class JwtConfigService {
  private readonly prefix = 'jwt';
  constructor(private readonly configService: ConfigService) {}

  get accessTokenSecret(): string {
    return this.configService.getOrThrow<string>(
      `${this.prefix}.accessTokenSecret`,
    );
  }

  get refreshTokenSecret(): string {
    return this.configService.getOrThrow<string>(
      `${this.prefix}.refreshTokenSecret`,
    );
  }

  get accessTokenExpiresIn(): StringValue {
    return this.configService.getOrThrow<string>(
      `${this.prefix}.accessTokenExpiresIn`,
    ) as StringValue;
  }

  get refreshTokenExpiresIn(): StringValue {
    return this.configService.getOrThrow<string>(
      `${this.prefix}.refreshTokenExpiresIn`,
    ) as StringValue;
  }
}
