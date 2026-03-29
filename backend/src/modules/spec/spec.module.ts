import { Module } from '@nestjs/common';
import { SpecService } from './spec.service';
import { SpecController } from './spec.controller';

@Module({
  controllers: [SpecController],
  providers: [SpecService],
})
export class SpecModule {}
