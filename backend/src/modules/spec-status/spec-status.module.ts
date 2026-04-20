import { Module } from '@nestjs/common';
import { SpecStatusService } from './spec-status.service';
import { SpecStatusController } from './spec-status.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecStatusEntity } from 'src/entities/spec-status.entity';
import { SpecStatusRepository } from '../repositories/spec-status/spec-status.repository';
import { ISpecStatusRepository } from '../repositories/spec-status/spec-status.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([SpecStatusEntity])],
  controllers: [SpecStatusController],
  providers: [
    SpecStatusService,
    {
      provide: ISpecStatusRepository,
      useClass: SpecStatusRepository,
    },
  ],
})
export class SpecStatusModule {}
