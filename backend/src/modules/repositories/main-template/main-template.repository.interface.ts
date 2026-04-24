import { MainTemplateEntity } from 'src/entities/main-template.entity';
import { DeleteResult, UpdateResult, type DeepPartial } from 'typeorm';

export abstract class IMainTemplateRepository {
  abstract findByUserId(userId: string): Promise<MainTemplateEntity[]>;
  abstract findById(id: string): Promise<MainTemplateEntity | null>;
  abstract create(
    mainTemplate: DeepPartial<MainTemplateEntity>,
  ): Promise<MainTemplateEntity>;
  abstract update(
    mainTemplate: DeepPartial<MainTemplateEntity>,
  ): Promise<MainTemplateEntity>;
  abstract delete(id: string): Promise<DeleteResult>;
  abstract softDelete(id: string): Promise<UpdateResult>;
}
