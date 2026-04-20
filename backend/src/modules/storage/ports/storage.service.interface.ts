export interface IStorageFile {
  buffer: Buffer;
  contentType:
    | 'text/plain'
    | 'application/pdf'
    | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
}
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

  abstract getFile(key: string): Promise<IStorageFile>;

  /** Lightweight metadata (e.g. Content-Type) without downloading the body. */
  abstract headFile(key: string): Promise<{ contentType?: string }>;

  abstract listFiles(prefix?: string): Promise<string[]>;
}
