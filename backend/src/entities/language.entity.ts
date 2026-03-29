import { Column, Entity, OneToMany } from 'typeorm';
import { LENGTH_50, VARCHAR } from '../constant/sql-column.constant';
import { BaseEntity } from './base.entity';
import { GeneratedSpecEntity } from './generated-spec.entity';

@Entity({ name: 'language' })
export class LanguageEntity extends BaseEntity {
  @Column({ type: VARCHAR, length: LENGTH_50, unique: true })
  name: string;

  @OneToMany(
    () => GeneratedSpecEntity,
    (generatedSpec) => generatedSpec.language,
  )
  generatedSpecs: GeneratedSpecEntity[];
}
