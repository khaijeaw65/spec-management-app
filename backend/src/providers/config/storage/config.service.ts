import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageConfigService {
  private readonly prefix = 'storage';

  constructor(private readonly configService: ConfigService) {}

  get provider(): 's3' | 'azure' | 'gcp' {
    return this.configService.getOrThrow<string>(`${this.prefix}.provider`) as
      | 's3'
      | 'azure'
      | 'gcp';
  }

  get bucket(): string {
    return this.configService.getOrThrow<string>(`${this.prefix}.bucket`);
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
