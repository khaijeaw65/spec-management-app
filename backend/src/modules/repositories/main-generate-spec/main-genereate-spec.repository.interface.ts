import { MainGeneratedSpecEntity } from 'src/entities/main-generated-spec.entity';
import { DeepPartial, DeleteResult, UpdateResult } from 'typeorm';

export abstract class IMainGenerateSpecRepository {
  abstract findById(id: string): Promise<MainGeneratedSpecEntity | null>;
  abstract create(
    mainGeneratedSpec: DeepPartial<MainGeneratedSpecEntity>,
  ): Promise<MainGeneratedSpecEntity>;
  abstract update(
    mainGeneratedSpec: DeepPartial<MainGeneratedSpecEntity>,
  ): Promise<MainGeneratedSpecEntity>;
  abstract delete(id: string): Promise<DeleteResult>;
  abstract softDelete(id: string): Promise<UpdateResult>;
}
