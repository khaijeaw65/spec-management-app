import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QueueConfigService {
  private readonly prefix = 'queue';

  constructor(private readonly configService: ConfigService) {}

  get url(): string {
    return this.configService.getOrThrow<string>(`${this.prefix}.url`);
  }

  get region(): string {
    return this.configService.getOrThrow<string>(`${this.prefix}.region`);
  }

  get accessKeyId(): string | undefined {
    return this.configService.get<string>(`${this.prefix}.accessKeyId`);
  }

  get secretAccessKey(): string | undefined {
    return this.configService.get<string>(`${this.prefix}.secretAccessKey`);
  }
}
