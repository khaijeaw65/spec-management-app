import { GeneratedSpecSectionEntity } from 'src/entities/generated-spec-section.entity';
import { DeepPartial, DeleteResult, UpdateResult } from 'typeorm';

export abstract class IGenerateSpecSectionRepository {
  abstract findById(id: string): Promise<GeneratedSpecSectionEntity | null>;
  abstract findBySpecId(specId: string): Promise<GeneratedSpecSectionEntity[]>;
  abstract create(
    generateSpecSection: DeepPartial<GeneratedSpecSectionEntity>,
  ): Promise<GeneratedSpecSectionEntity>;
  abstract createMany(
    generateSpecSections: DeepPartial<GeneratedSpecSectionEntity>[],
  ): Promise<GeneratedSpecSectionEntity[]>;
  abstract update(
    generateSpecSection: DeepPartial<GeneratedSpecSectionEntity>,
  ): Promise<GeneratedSpecSectionEntity>;
  abstract updateMany(
    generateSpecSections: DeepPartial<GeneratedSpecSectionEntity>[],
  ): Promise<GeneratedSpecSectionEntity[]>;
  abstract delete(id: string): Promise<DeleteResult>;
  abstract softDelete(id: string): Promise<UpdateResult>;
}
