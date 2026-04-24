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
  LENGTH_255,
  NULLABLE,
  TEXT,
  VARCHAR,
} from '../constant/sql-column.constant';
import { BaseEntity } from './base.entity';
import { GeneratedSpecSectionEntity } from './generated-spec-section.entity';
import { TemplateEntity } from './template.entity';

@Entity({ name: 'template_section' })
@Unique(['template', 'sortOrder'])
@Unique(['template', 'title'])
export class TemplateSectionEntity extends BaseEntity {
  @ManyToOne(() => TemplateEntity, (template) => template.templateSections)
  @JoinColumn({ name: 'template_id' })
  template: TemplateEntity;

  @Column({ type: VARCHAR, length: LENGTH_255 })
  title: string;

  @Column({ type: TEXT, nullable: NULLABLE })
  description?: string | null;

  @Column({ type: INTEGER, default: 0 })
  sortOrder: number;

  @OneToMany(
    () => GeneratedSpecSectionEntity,
    (section) => section.templateSection,
  )
  generatedSpecSections: GeneratedSpecSectionEntity[];
}
