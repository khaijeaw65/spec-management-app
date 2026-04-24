import { RiskTypeEntity } from 'src/entities/risk-type.entity';
import { DeepPartial, DeleteResult, UpdateResult } from 'typeorm';

export abstract class IRiskTypeRepository {
  abstract findById(id: string): Promise<RiskTypeEntity | null>;
  abstract findAll(): Promise<RiskTypeEntity[]>;
  abstract create(
    riskType: DeepPartial<RiskTypeEntity>,
  ): Promise<RiskTypeEntity>;
  abstract update(
    riskType: DeepPartial<RiskTypeEntity>,
  ): Promise<RiskTypeEntity>;
  abstract delete(id: string): Promise<DeleteResult>;
  abstract softDelete(id: string): Promise<UpdateResult>;
}
