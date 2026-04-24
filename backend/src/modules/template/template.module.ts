import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateEntity } from '../../entities/template.entity';
import { MainTemplateEntity } from '../../entities/main-template.entity';
import { MainTemplateRepository } from '../repositories/main-template/main-template.repository';
import { IMainTemplateRepository } from '../repositories/main-template/main-template.repository.interface';
import { TemplateRepository } from '../repositories/template/template.repository';
import { ITemplateRepository } from '../repositories/template/template.repository.interface';
import { LanguageRepository } from '../repositories/language/language.repository';
import { ILanguageRepository } from '../repositories/language/language.repository.interface';
import { LanguageEntity } from '../../entities/language.entity';
import { TemplateSectionEntity } from '../../entities/template-section.entity';
import { TemplateSectionRepository } from '../template-section/template-section.repository';
import { ITemplateSectionRepository } from '../template-section/template-section.repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TemplateEntity,
      MainTemplateEntity,
      LanguageEntity,
      TemplateSectionEntity,
    ]),
  ],
  controllers: [TemplateController],
  providers: [
    TemplateService,
    {
      provide: IMainTemplateRepository,
      useClass: MainTemplateRepository,
    },
    {
      provide: ITemplateRepository,
      useClass: TemplateRepository,
    },
    {
      provide: ILanguageRepository,
      useClass: LanguageRepository,
    },
    {
      provide: ITemplateSectionRepository,
      useClass: TemplateSectionRepository,
    },
  ],
})
export class TemplateModule {}
