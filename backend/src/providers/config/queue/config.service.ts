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

  get accessKeyId(): string {
    return this.configService.getOrThrow<string>(`${this.prefix}.accessKeyId`);
  }

  get secretAccessKey(): string {
    return this.configService.getOrThrow<string>(
      `${this.prefix}.secretAccessKey`,
    );
  }
}
