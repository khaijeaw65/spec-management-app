import { Column, Entity, OneToMany } from 'typeorm';
import { LENGTH_10, LENGTH_50, VARCHAR } from '../constant/sql-column.constant';
import { BaseEntity } from './base.entity';
import { GeneratedSpecEntity } from './generated-spec.entity';
import { MainTemplateEntity } from './main-template.entity';

@Entity({ name: 'language' })
export class LanguageEntity extends BaseEntity {
  @Column({ type: VARCHAR, length: LENGTH_10, unique: true })
  code: string;

  @Column({ type: VARCHAR, length: LENGTH_50, unique: true })
  name: string;

  @OneToMany(
    () => GeneratedSpecEntity,
    (generatedSpec) => generatedSpec.language,
  )
  generatedSpecs: GeneratedSpecEntity[];

  @OneToMany(() => MainTemplateEntity, (mainTemplate) => mainTemplate.language)
  mainTemplates: MainTemplateEntity[];
}
