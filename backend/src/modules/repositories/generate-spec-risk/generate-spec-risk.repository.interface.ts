import { SpecRiskEntity } from 'src/entities/spec-risk.entity';
import { DeepPartial, DeleteResult, UpdateResult } from 'typeorm';

export abstract class IGenerateSpecRiskRepository {
  abstract findById(id: string): Promise<SpecRiskEntity | null>;
  abstract findBySpecId(specId: string): Promise<SpecRiskEntity[]>;
  abstract create(
    generateSpecRisk: DeepPartial<SpecRiskEntity>,
  ): Promise<SpecRiskEntity>;
  abstract createMany(
    generateSpecRisks: DeepPartial<SpecRiskEntity>[],
  ): Promise<SpecRiskEntity[]>;
  abstract update(
    generateSpecRisk: DeepPartial<SpecRiskEntity>,
  ): Promise<SpecRiskEntity>;
  abstract updateMany(
    generateSpecRisks: DeepPartial<SpecRiskEntity>[],
  ): Promise<SpecRiskEntity[]>;
  abstract delete(id: string): Promise<DeleteResult>;
  abstract softDelete(id: string): Promise<UpdateResult>;
}
