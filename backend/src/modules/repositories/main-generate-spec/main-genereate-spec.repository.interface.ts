import { SpecListQuery } from '@spec-app/schemas';
import { MainGeneratedSpecEntity } from 'src/entities/main-generated-spec.entity';
import { DeepPartial, DeleteResult, UpdateResult } from 'typeorm';

export type MainGeneratedSpecListResult = {
  items: MainGeneratedSpecEntity[];
  totalCount: number;
  page: number;
  limit: number;
};

export abstract class IMainGenerateSpecRepository {
  abstract findAll(query: SpecListQuery): Promise<MainGeneratedSpecListResult>;
  abstract findById(id: string): Promise<MainGeneratedSpecEntity | null>;
  abstract findByMainAndVersionId(
    mainSpecId: string,
    versionId: string,
  ): Promise<MainGeneratedSpecEntity | null>;
  abstract findVersions(mainSpecId: string): Promise<MainGeneratedSpecEntity[]>;
  abstract create(
    mainGeneratedSpec: DeepPartial<MainGeneratedSpecEntity>,
  ): Promise<MainGeneratedSpecEntity>;
  abstract update(
    mainGeneratedSpec: DeepPartial<MainGeneratedSpecEntity>,
  ): Promise<MainGeneratedSpecEntity>;
  abstract delete(id: string): Promise<DeleteResult>;
  abstract softDelete(id: string): Promise<UpdateResult>;
}
