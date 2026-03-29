import { Column, Entity, OneToMany } from 'typeorm';
import { LENGTH_100, VARCHAR } from '../constant/sql-column.constant';
import { BaseEntity } from './base.entity';
import { SpecRiskEntity } from './spec-risk.entity';

@Entity({ name: 'risk_type' })
export class RiskTypeEntity extends BaseEntity {
  @Column({ type: VARCHAR, length: LENGTH_100, unique: true })
  name: string;

  @OneToMany(() => SpecRiskEntity, (specRisk) => specRisk.riskType)
  specRisks: SpecRiskEntity[];
}
