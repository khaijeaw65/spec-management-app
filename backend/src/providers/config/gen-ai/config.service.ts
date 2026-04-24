import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GenAiConfigService {
  private readonly prefix = 'gen-ai';
  constructor(private readonly configService: ConfigService) {}

  get model(): string {
    return this.configService.getOrThrow<string>(`${this.prefix}.model`);
  }

  get apiKey(): string {
    return this.configService.getOrThrow<string>(`${this.prefix}.apiKey`);
  }
}
