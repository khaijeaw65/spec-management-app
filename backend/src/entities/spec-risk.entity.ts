import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { NULLABLE, TEXT } from '../constant/sql-column.constant';
import { BaseEntity } from './base.entity';
import { GeneratedSpecEntity } from './generated-spec.entity';
import { GeneratedSpecSectionEntity } from './generated-spec-section.entity';
import { RiskTypeEntity } from './risk-type.entity';

@Entity({ name: 'spec_risk' })
export class SpecRiskEntity extends BaseEntity {
  @ManyToOne(() => GeneratedSpecEntity, (spec) => spec.specRisks)
  @JoinColumn({ name: 'spec_id' })
  spec: GeneratedSpecEntity;

  @ManyToOne(() => GeneratedSpecSectionEntity, (section) => section.specRisks, {
    nullable: true,
  })
  @JoinColumn({ name: 'section_id' })
  section?: GeneratedSpecSectionEntity | null;

  @ManyToOne(() => RiskTypeEntity, (riskType) => riskType.specRisks)
  @JoinColumn({ name: 'risk_type_id' })
  riskType: RiskTypeEntity;

  @Column({ type: TEXT, nullable: NULLABLE })
  detail?: string | null;

  @Column({ type: TEXT, nullable: NULLABLE })
  referenceText?: string | null;
}
