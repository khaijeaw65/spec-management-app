import { Module } from '@nestjs/common';
import { SpecService } from './spec.service';
import { SpecController } from './spec.controller';
import { GenAiModule } from '../gen-ai/gen-ai.module';

@Module({
  imports: [GenAiModule],
  controllers: [SpecController],
  providers: [SpecService],
})
export class SpecModule {}
