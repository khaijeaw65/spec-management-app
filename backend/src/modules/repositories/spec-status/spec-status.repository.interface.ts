import { SpecStatusEntity } from 'src/entities/spec-status.entity';
import { DeepPartial, DeleteResult, UpdateResult } from 'typeorm';

export abstract class ISpecStatusRepository {
  abstract findAll(): Promise<SpecStatusEntity[]>;
  abstract findById(id: string): Promise<SpecStatusEntity | null>;
  abstract findByCode(code: string): Promise<SpecStatusEntity | null>;
  abstract create(
    specStatus: DeepPartial<SpecStatusEntity>,
  ): Promise<SpecStatusEntity>;
  abstract update(
    specStatus: DeepPartial<SpecStatusEntity>,
  ): Promise<SpecStatusEntity>;
  abstract delete(id: string): Promise<DeleteResult>;
  abstract softDelete(id: string): Promise<UpdateResult>;
}
