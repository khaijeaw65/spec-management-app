import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueConfigService } from './config.service';
import configuration from './configuration';

@Module({
  imports: [ConfigModule.forFeature(configuration)],
  providers: [QueueConfigService],
  exports: [QueueConfigService],
})
export class QueueConfigModule {}
