import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { INTEGER, LENGTH_255, VARCHAR } from '../constant/sql-column.constant';
import { BaseEntity } from './base.entity';
import { GeneratedSpecSectionEntity } from './generated-spec-section.entity';
import { SectionTypeEntity } from './section-type.entity';
import { TemplateEntity } from './template.entity';

@Entity({ name: 'template_section' })
@Unique(['template', 'sortOrder'])
@Unique(['template', 'name'])
export class TemplateSectionEntity extends BaseEntity {
  @ManyToOne(() => TemplateEntity, (template) => template.templateSections)
  @JoinColumn({ name: 'template_id' })
  template: TemplateEntity;

  @ManyToOne(
    () => SectionTypeEntity,
    (sectionType) => sectionType.templateSections,
  )
  @JoinColumn({ name: 'section_type_id' })
  sectionType: SectionTypeEntity;

  @Column({ type: VARCHAR, length: LENGTH_255 })
  name: string;

  @Column({ type: INTEGER, default: 0 })
  sortOrder: number;

  @OneToMany(
    () => GeneratedSpecSectionEntity,
    (section) => section.templateSection,
  )
  generatedSpecSections: GeneratedSpecSectionEntity[];
}
