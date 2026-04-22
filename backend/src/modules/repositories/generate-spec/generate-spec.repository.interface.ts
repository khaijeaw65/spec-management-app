import { GeneratedSpecEntity } from 'src/entities/generated-spec.entity';
import { DeepPartial, UpdateResult, DeleteResult } from 'typeorm';

export type GenerateSpecListResult = {
  items: GeneratedSpecEntity[];
  totalCount: number;
  page: number;
  limit: number;
};

export abstract class IGenerateSpecRepository {
  abstract findById(id: string): Promise<GeneratedSpecEntity | null>;
  /**
   * Detail view needs to load historical versions too (previous current versions
   * are soft-deactivated). This method must NOT filter by `isActive`.
   */
  abstract findByIdForDetail(id: string): Promise<GeneratedSpecEntity | null>;
  abstract findByIdWithMainSpec(
    id: string,
  ): Promise<GeneratedSpecEntity | null>;
  abstract findByIdForExport(id: string): Promise<GeneratedSpecEntity | null>;
  abstract findByMainSpecId(mainSpecId: string): Promise<GeneratedSpecEntity[]>;
  abstract findVersionsByMainSpecId(
    mainSpecId: string,
  ): Promise<GeneratedSpecEntity[]>;
  abstract findLatestVersionByMainSpecId(
    mainSpecId: string,
  ): Promise<{ id: string | null; version: number }>;
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
