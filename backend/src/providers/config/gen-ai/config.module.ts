import { Module } from '@nestjs/common';
import { GenAiConfigService } from './config.service';
import configuration from './configuration';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forFeature(configuration)],
  providers: [GenAiConfigService],
  exports: [GenAiConfigService],
})
export class GenAiConfigModule {}
