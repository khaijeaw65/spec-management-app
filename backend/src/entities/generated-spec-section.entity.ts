import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { INTEGER, NULLABLE, TEXT } from '../constant/sql-column.constant';
import { BaseEntity } from './base.entity';
import { GeneratedSpecEntity } from './generated-spec.entity';
import { SpecRiskEntity } from './spec-risk.entity';
import { TemplateSectionEntity } from './template-section.entity';

@Entity({ name: 'generated_spec_section' })
@Unique(['spec', 'sortOrder'])
export class GeneratedSpecSectionEntity extends BaseEntity {
  @ManyToOne(() => GeneratedSpecEntity, (spec) => spec.generatedSpecSections)
  @JoinColumn({ name: 'spec_id' })
  spec: GeneratedSpecEntity;

  @ManyToOne(
    () => TemplateSectionEntity,
    (templateSection) => templateSection.generatedSpecSections,
  )
  @JoinColumn({ name: 'template_section_id' })
  templateSection: TemplateSectionEntity;

  @Column({ type: INTEGER, default: 0 })
  sortOrder: number;

  @Column({ type: TEXT, nullable: NULLABLE })
  detail?: string | null;

  @OneToMany(() => SpecRiskEntity, (specRisk) => specRisk.section)
  specRisks: SpecRiskEntity[];
}
