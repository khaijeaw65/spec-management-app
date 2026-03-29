import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  type GetObjectCommandOutput,
  type ListObjectsV2CommandOutput,
} from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';
import { IStorageService } from 'src/modules/storage/ports/storage-service.interface';
import { StorageConfigService } from 'src/providers/config/storage/config.service';

@Injectable()
export class AwsS3StorageService implements IStorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly configService: StorageConfigService) {
    this.region = this.configService.region;
    this.bucket = this.configService.bucket;
    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.accessKeyId,
        secretAccessKey: this.configService.secretAccessKey,
      },
    });
  }

  async uploadFile(
    file: Buffer,
    key: string,
    contentType = 'application/octet-stream',
  ): Promise<string> {
    if (!this.bucket) {
      throw new Error('AWS_S3_BUCKET is not set');
    }

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
      }),
    );

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.bucket) {
      throw new Error('AWS_S3_BUCKET is not set');
    }

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async getFile(key: string): Promise<Buffer> {
    if (!this.bucket) {
      throw new Error('AWS_S3_BUCKET is not set');
    }

    const result: GetObjectCommandOutput = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const stream = result.Body as Readable;
      stream.on('data', (chunk: string | Buffer) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async listFiles(prefix = ''): Promise<string[]> {
    if (!this.bucket) {
      throw new Error('AWS_S3_BUCKET is not set');
    }

    const result: ListObjectsV2CommandOutput = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      }),
    );

    const contents = result.Contents ?? [];
    return contents
      .map((obj) => obj.Key)
      .filter((k): k is string => typeof k === 'string' && k.length > 0);
  }
}
