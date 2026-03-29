import { Column, Entity, OneToMany } from 'typeorm';
import {
  LENGTH_100,
  NULLABLE,
  TEXT,
  VARCHAR,
} from '../constant/sql-column.constant';
import { BaseEntity } from './base.entity';
import { TemplateSectionEntity } from './template-section.entity';

@Entity({ name: 'section_type' })
export class SectionTypeEntity extends BaseEntity {
  @Column({ type: VARCHAR, length: LENGTH_100 })
  name: string;

  @Column({ type: TEXT, nullable: NULLABLE })
  purpose?: string | null;

  @OneToMany(
    () => TemplateSectionEntity,
    (templateSection) => templateSection.sectionType,
  )
  templateSections: TemplateSectionEntity[];
}
