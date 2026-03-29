import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfigService {
  private readonly prefix = 'database';

  constructor(private readonly configService: ConfigService) {}

  get host(): string {
    return this.configService.getOrThrow<string>(`${this.prefix}.host`);
  }

  get port(): number {
    return this.configService.getOrThrow<number>(`${this.prefix}.port`);
  }

  get username(): string {
    return this.configService.getOrThrow<string>(`${this.prefix}.username`);
  }

  get password(): string {
    return this.configService.getOrThrow<string>(`${this.prefix}.password`);
  }

  get database(): string {
    return this.configService.getOrThrow<string>(`${this.prefix}.database`);
  }
}
