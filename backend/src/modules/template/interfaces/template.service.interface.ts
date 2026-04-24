import {
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplateDetailDto,
  TemplateDto,
} from '@spec-app/schemas';

export abstract class ITemplateService {
  abstract getUserTemplates(userId: string): Promise<TemplateDto[]>;
  abstract getById(id: string): Promise<TemplateDetailDto>;
  abstract create(template: CreateTemplateDto): Promise<TemplateDetailDto>;
  abstract update(
    id: string,
    template: UpdateTemplateDto,
  ): Promise<TemplateDetailDto>;
  abstract delete(id: string): Promise<void>;
  abstract addNewVersion(id: string): Promise<TemplateDetailDto>;
}
