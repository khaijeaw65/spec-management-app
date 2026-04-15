import { Module } from '@nestjs/common';
import { AwsS3StorageService } from '../../providers/infrastructures/storage/aws-s3-storage.service';
import { StorageConfigModule } from '../../providers/config/storage/config.module';
import { IStorageService } from './ports/storage-service.interface';

export type StorageProvider = 's3' | 'azure' | 'gcp';

@Module({
  imports: [StorageConfigModule],
  providers: [
    AwsS3StorageService,
    {
      provide: IStorageService,
      useExisting: AwsS3StorageService,
    },
  ],
  exports: [IStorageService],
})
export class StorageModule {}
