import { Module } from '@nestjs/common';
import { SpecService } from './spec.service';
import { SpecController } from './spec.controller';
import { SpecExportService } from './spec-export.service';
import { GenAiModule } from '../gen-ai/gen-ai.module';
import { StorageModule } from '../storage/storage.module';
import { QueueModule } from '../queue/queue.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratedSpecEntity } from 'src/entities/generated-spec.entity';
import { MainGeneratedSpecEntity } from 'src/entities/main-generated-spec.entity';
import { RiskTypeEntity } from 'src/entities/risk-type.entity';
import { SpecStatusEntity } from 'src/entities/spec-status.entity';
import { GeneratedSpecSectionEntity } from 'src/entities/generated-spec-section.entity';
import { SpecRiskEntity } from 'src/entities/spec-risk.entity';
import { IGenerateSpecRepository } from '../repositories/generate-spec/generate-spec.repository.interface';
import { GenerateSpecSectionRepository } from '../repositories/generate-spec-section/generate-spec-section.repository';
import { IGenerateSpecSectionRepository } from '../repositories/generate-spec-section/generate-spec-section.repository.interface';
import { GenerateSpecRepository } from '../repositories/generate-spec/generate-spec.repository';
import { RiskTypeRepository } from '../repositories/risk-type/risk-type.repository';
import { IRiskTypeRepository } from '../repositories/risk-type/risk-type.repository.interface';
import { GenerateSpecRiskRepository } from '../repositories/generate-spec-risk/generate-spec-risk.repository';
import { IGenerateSpecRiskRepository } from '../repositories/generate-spec-risk/generate-spec-risk.repository.interface';
import { MainGenerateSpecRepository } from '../repositories/main-generate-spec/main-genereate-spec.repository';
import { IMainGenerateSpecRepository } from '../repositories/main-generate-spec/main-genereate-spec.repository.interface';
import { ISpecStatusRepository } from '../repositories/spec-status/spec-status.repository.interface';
import { SpecStatusRepository } from '../repositories/spec-status/spec-status.repository';
import { LoggerModule } from '../../utils/logger/logger.module';
import { ISpecService } from './interfaces/spec.service.interface';
import { LanguageRepository } from '../repositories/language/language.repository';
import { ILanguageRepository } from '../repositories/language/language.repository.interface';
import { LanguageEntity } from '../../entities/language.entity';
import { MainTemplateEntity } from '../../entities/main-template.entity';
import { MainTemplateRepository } from '../repositories/main-template/main-template.repository';
import { IMainTemplateRepository } from '../repositories/main-template/main-template.repository.interface';

@Module({
  imports: [
    GenAiModule,
    StorageModule,
    QueueModule,
    LoggerModule,
    TypeOrmModule.forFeature([
      GeneratedSpecEntity,
      MainGeneratedSpecEntity,
      SpecStatusEntity,
      RiskTypeEntity,
      GeneratedSpecSectionEntity,
      SpecRiskEntity,
      LanguageEntity,
      MainTemplateEntity,
    ]),
  ],
  controllers: [SpecController],
  providers: [
    SpecService,
    SpecExportService,
    {
      provide: ISpecService,
      useExisting: SpecService,
    },
    {
      provide: IGenerateSpecRepository,
      useClass: GenerateSpecRepository,
    },
    {
      provide: IGenerateSpecSectionRepository,
      useClass: GenerateSpecSectionRepository,
    },
    {
      provide: IRiskTypeRepository,
      useClass: RiskTypeRepository,
    },
    {
      provide: IGenerateSpecRiskRepository,
      useClass: GenerateSpecRiskRepository,
    },
    {
      provide: IMainGenerateSpecRepository,
      useClass: MainGenerateSpecRepository,
    },
    {
      provide: ISpecStatusRepository,
      useClass: SpecStatusRepository,
    },
    {
      provide: ILanguageRepository,
      useClass: LanguageRepository,
    },
    {
      provide: IMainTemplateRepository,
      useClass: MainTemplateRepository,
    },
  ],
  exports: [ISpecService],
})
export class SpecModule {}
