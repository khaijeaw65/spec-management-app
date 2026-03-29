import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import {
  BOOLEAN,
  INTEGER,
  LENGTH_255,
  NULLABLE,
  TEXT,
  VARCHAR,
} from '../constant/sql-column.constant';
import { BaseEntity } from './base.entity';
import { GeneratedSpecEntity } from './generated-spec.entity';
import { MainTemplateEntity } from './main-template.entity';
import { TemplateSectionEntity } from './template-section.entity';

@Entity({ name: 'template' })
@Unique(['mainTemplate', 'version'])
export class TemplateEntity extends BaseEntity {
  @ManyToOne(() => MainTemplateEntity, (mainTemplate) => mainTemplate.templates)
  @JoinColumn({ name: 'main_template_id' })
  mainTemplate: MainTemplateEntity;

  @Column({ type: INTEGER, default: 1 })
  version: number;

  @Column({ type: VARCHAR, length: LENGTH_255 })
  name: string;

  @Column({ type: TEXT, nullable: NULLABLE })
  description?: string | null;

  @Column({ type: BOOLEAN, default: true })
  isActive: boolean;

  @OneToMany(
    () => TemplateSectionEntity,
    (templateSection) => templateSection.template,
  )
  templateSections: TemplateSectionEntity[];

  @OneToMany(
    () => GeneratedSpecEntity,
    (generatedSpec) => generatedSpec.templateVersion,
  )
  generatedSpecs: GeneratedSpecEntity[];
}
