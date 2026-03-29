/**
 * Port for object storage (S3, Azure Blob, GCS, etc.).
 * Inject IStorageService; bind a concrete adapter in StorageModule.
 */
export abstract class IStorageService {
  abstract uploadFile(
    file: Buffer,
    key: string,
    contentType?: string,
  ): Promise<string>;

  abstract deleteFile(key: string): Promise<void>;

  abstract getFile(key: string): Promise<Buffer>;

  abstract listFiles(prefix?: string): Promise<string[]>;
}
