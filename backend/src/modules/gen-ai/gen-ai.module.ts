import { Module } from '@nestjs/common';
import { GenAiService } from './gen-ai.service';
import { OpenaiLlmClientService } from 'src/providers/infrastructures/gen-ai/openai-llm-client.service';
import { GenAiConfigModule } from 'src/providers/config/gen-ai/config.module';
import { ILlmClient } from './ports/llm-client.interface';
import { StorageModule } from '../storage/storage.module';
import { IGenAiService } from './ports/gen-ai.interface';

@Module({
  imports: [GenAiConfigModule, StorageModule],
  providers: [
    {
      provide: IGenAiService,
      useClass: GenAiService,
    },
    {
      provide: ILlmClient,
      useClass: OpenaiLlmClientService,
    },
  ],
  exports: [IGenAiService],
})
export class GenAiModule {}
