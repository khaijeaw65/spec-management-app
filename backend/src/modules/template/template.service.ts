import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IMainTemplateRepository } from '../repositories/main-template/main-template.repository.interface';
import { ITemplateRepository } from '../repositories/template/template.repository.interface';
import {
  type CreateTemplateDto,
  LanguageCodeSchema,
  TemplateDetailDto,
  TemplateDto,
  UpdateTemplateDto,
} from '@spec-app/schemas';
import { ITemplateService } from './interfaces/template.service.interface';
import { IRequestContextService } from '../../contexts/request/interfaces/request.context.interface';
import { ILanguageRepository } from '../repositories/language/language.repository.interface';
import { Transactional } from '@nestjs-cls/transactional';
import { ITemplateSectionRepository } from '../template-section/template-section.repository.interface';

@Injectable()
export class TemplateService implements ITemplateService {
  constructor(
    private readonly mainTemplateRepository: IMainTemplateRepository,
    private readonly templateRepository: ITemplateRepository,
    private readonly templateSectionRepository: ITemplateSectionRepository,
    private readonly languageRepository: ILanguageRepository,
    private readonly requestContextService: IRequestContextService,
  ) {}

  async getUserTemplates(userId: string): Promise<TemplateDto[]> {
    const templates = await this.mainTemplateRepository.findByUserId(userId);

    return templates.map((template) => {
      const languageResult = LanguageCodeSchema.safeParse(
        template.language?.code ?? '',
      );

      if (!languageResult.success) {
        throw new InternalServerErrorException('Failed to parse language code');
      }

      return {
        id: template.id,
        versionId: template.currentVersion?.id ?? '',
        name: template.currentVersion?.name ?? '',
        description: template.currentVersion?.description ?? '',
        language: languageResult.data,
        createdOn: template.createdOn,
        sectionCount: template.currentVersion?.templateSectionsCount ?? 0,
      };
    });
  }

  async getById(id: string): Promise<TemplateDetailDto> {
    const template = await this.mainTemplateRepository.findById(id);

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const languageResult = LanguageCodeSchema.safeParse(template.language.code);

    if (!languageResult.success) {
      throw new InternalServerErrorException('Failed to parse language code');
    }

    return {
      id: template.id,
      versionId: template.currentVersion?.id ?? '',
      name: template.currentVersion?.name ?? '',
      description: template.currentVersion?.description ?? '',
      language: languageResult.data,
      sections:
        template.currentVersion?.templateSections.map((section) => ({
          id: section.id,
          title: section.title,
          description: section.description ?? '',
          order: section.sortOrder,
        })) ?? [],
    };
  }

  @Transactional()
  async create(template: CreateTemplateDto): Promise<TemplateDetailDto> {
    const language = await this.languageRepository.findByCode(
      template.language as string,
    );

    if (!language) {
      throw new BadRequestException('Language not found');
    }

    const createdMainTemplate = await this.mainTemplateRepository.create({
      user: {
        id: this.requestContextService.userId,
      },
      language: {
        id: language.id,
      },
    });

    const createdTemplate = await this.templateRepository.create({
      mainTemplate: {
        id: createdMainTemplate.id,
      },
      name: template.name,
      description: template.description,
      templateSections: template.sections.map((section) => ({
        name: section.title,
        description: section.description,
        sortOrder: section.order,
      })),
    });

    await this.templateSectionRepository.createMany(
      template.sections.map((section) => ({
        template: {
          id: createdTemplate.id,
        },
        title: section.title,
        description: section.description,
        sortOrder: section.order,
      })),
    );

    await this.mainTemplateRepository.update({
      id: createdMainTemplate.id,
      currentVersion: {
        id: createdTemplate.id,
      },
    });

    return {
      id: createdMainTemplate.id,
      versionId: createdTemplate.id,
      name: createdTemplate.name,
      description: createdTemplate.description ?? '',
      language: template.language,
      sections: createdTemplate.templateSections.map((section) => ({
        title: section.title,
        description: section.description ?? '',
        order: section.sortOrder,
      })),
    };
  }

  async update(mainTemplateId: string, template: UpdateTemplateDto) {
    const main = await this.mainTemplateRepository.findById(mainTemplateId);

    if (!main?.currentVersion) {
      throw new NotFoundException('Template not found');
    }

    if (template.id !== main.id) {
      throw new BadRequestException('Template id mismatch');
    }

    if (template.versionId !== main.currentVersion.id) {
      throw new BadRequestException(
        'This template was updated elsewhere. Refresh and try again.',
      );
    }

    const existingTemplate = await this.templateRepository.findById(
      main.currentVersion.id,
    );

    if (!existingTemplate) {
      throw new NotFoundException('Template version not found');
    }

    const updatedTemplate = {
      ...existingTemplate,
      name: template.name,
      description: template.description,
    };

    await this.templateSectionRepository.updateMany(
      template.sections.map((section) => ({
        id: section.id,
        title: section.title,
        template: {
          id: existingTemplate.id,
        },
        description: section.description,
        sortOrder: section.order,
      })),
    );

    return {
      id: main.id,
      versionId: existingTemplate.id,
      name: updatedTemplate.name,
      description: updatedTemplate.description ?? '',
      language: template.language,
      sections: updatedTemplate.templateSections.map((section) => ({
        title: section.title,
        description: section.description ?? '',
        order: section.sortOrder,
      })),
    };
  }

  async delete(id: string) {
    await this.mainTemplateRepository.softDelete(id);

    await this.templateRepository.softDelete(id);
  }

  async addNewVersion(id: string) {
    const existingTemplate = await this.mainTemplateRepository.findById(id);

    if (!existingTemplate) {
      throw new NotFoundException('Template not found');
    }

    const newVersion = await this.templateRepository.create({
      mainTemplate: {
        id: existingTemplate.id,
      },
      name: existingTemplate.currentVersion?.name ?? '',
      description: existingTemplate.currentVersion?.description ?? '',
      templateSections: existingTemplate.currentVersion?.templateSections.map(
        (section) => ({
          name: section.title,
          description: section.description ?? '',
          sortOrder: section.sortOrder,
        }),
      ),
    });

    await this.mainTemplateRepository.update({
      id: existingTemplate.id,
      currentVersion: {
        id: newVersion.id,
      },
    });

    await this.templateRepository.softDelete(
      existingTemplate.currentVersion?.id ?? '',
    );

    const languageResult = LanguageCodeSchema.safeParse(
      existingTemplate.language.code,
    );

    if (!languageResult.success) {
      throw new InternalServerErrorException('Failed to parse language code');
    }

    return {
      id: existingTemplate.id,
      versionId: newVersion.id,
      name: newVersion.name,
      description: newVersion.description ?? '',
      language: languageResult.data,
      sections: newVersion.templateSections.map((section) => ({
        title: section.title,
        description: section.description ?? '',
        order: section.sortOrder,
      })),
    };
  }
}
