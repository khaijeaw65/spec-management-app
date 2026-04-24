import { TemplateEntity } from 'src/entities/template.entity';
import { DeepPartial, UpdateResult } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';

export abstract class ITemplateRepository {
  abstract findByUserId(userId: string): Promise<TemplateEntity[]>;
  abstract findById(id: string): Promise<TemplateEntity | null>;
  abstract create(
    template: DeepPartial<TemplateEntity>,
  ): Promise<TemplateEntity>;
  abstract update(
    template: DeepPartial<TemplateEntity>,
  ): Promise<TemplateEntity>;
  abstract delete(id: string): Promise<DeleteResult>;
  abstract softDelete(id: string): Promise<UpdateResult>;
}
