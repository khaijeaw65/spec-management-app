import { SpecListQuery } from '@spec-app/schemas';
import { GeneratedSpecEntity } from 'src/entities/generated-spec.entity';
import { DeepPartial, UpdateResult, DeleteResult } from 'typeorm';

export abstract class IGenerateSpecRepository {
  abstract findAll(query: SpecListQuery): Promise<GeneratedSpecEntity[]>;
  abstract findById(id: string): Promise<GeneratedSpecEntity | null>;
  abstract findByIdForExport(id: string): Promise<GeneratedSpecEntity | null>;
  abstract findByMainSpecId(mainSpecId: string): Promise<GeneratedSpecEntity[]>;
  abstract create(
    generateSpec: DeepPartial<GeneratedSpecEntity>,
  ): Promise<GeneratedSpecEntity>;
  abstract update(
    generateSpec: DeepPartial<GeneratedSpecEntity>,
  ): Promise<GeneratedSpecEntity>;
  abstract updateStatus(id: string, statusId: string): Promise<UpdateResult>;
  abstract delete(id: string): Promise<DeleteResult>;
  abstract softDelete(id: string): Promise<UpdateResult>;
}
