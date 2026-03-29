import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import {
  INTEGER,
  LENGTH_100,
  LENGTH_255,
  LENGTH_500,
  NULLABLE,
  TIMESTAMPTZ,
  VARCHAR,
} from '../constant/sql-column.constant';
import { BaseEntity } from './base.entity';
import { GeneratedSpecSectionEntity } from './generated-spec-section.entity';
import { LanguageEntity } from './language.entity';
import { MainGeneratedSpecEntity } from './main-generated-spec.entity';
import { SpecRiskEntity } from './spec-risk.entity';
import { SpecStatusEntity } from './spec-status.entity';
import { TemplateEntity } from './template.entity';

@Entity({ name: 'generated_spec' })
@Unique(['mainSpec', 'version'])
export class GeneratedSpecEntity extends BaseEntity {
  @ManyToOne(
    () => MainGeneratedSpecEntity,
    (mainSpec) => mainSpec.generatedSpecs,
  )
  @JoinColumn({ name: 'main_spec_id' })
  mainSpec: MainGeneratedSpecEntity;

  @ManyToOne(() => LanguageEntity, (language) => language.generatedSpecs)
  @JoinColumn({ name: 'language_id' })
  language: LanguageEntity;

  @ManyToOne(() => SpecStatusEntity, (status) => status.generatedSpecs)
  @JoinColumn({ name: 'status_id' })
  status: SpecStatusEntity;

  @ManyToOne(() => TemplateEntity, (template) => template.generatedSpecs)
  @JoinColumn({ name: 'template_version_id' })
  templateVersion: TemplateEntity;

  @Column({ type: INTEGER, default: 1 })
  version: number;

  @Column({ type: VARCHAR, length: LENGTH_500, nullable: NULLABLE })
  momS3Key?: string | null;

  @Column({ type: VARCHAR, length: LENGTH_255, nullable: NULLABLE })
  momS3Bucket?: string | null;

  @Column({ type: VARCHAR, length: LENGTH_100, nullable: NULLABLE })
  aiModel?: string | null;

  @Column({ type: INTEGER, nullable: NULLABLE })
  promptTokens?: number | null;

  @Column({ type: INTEGER, nullable: NULLABLE })
  completionTokens?: number | null;

  @Column({ type: INTEGER, nullable: NULLABLE })
  totalTokens?: number | null;

  @Column({ type: INTEGER, nullable: NULLABLE })
  generationTimeMs?: number | null;

  @Column({ type: TIMESTAMPTZ, nullable: NULLABLE })
  exportedOn?: Date | null;

  @OneToMany(() => GeneratedSpecSectionEntity, (section) => section.spec)
  generatedSpecSections: GeneratedSpecSectionEntity[];

  @OneToMany(() => SpecRiskEntity, (specRisk) => specRisk.spec)
  specRisks: SpecRiskEntity[];

  @OneToMany(
    () => MainGeneratedSpecEntity,
    (mainGeneratedSpec) => mainGeneratedSpec.currentVersion,
  )
  mainGeneratedSpecsWhereCurrent: MainGeneratedSpecEntity[];
}
