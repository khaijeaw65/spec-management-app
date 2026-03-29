import { Column, Entity, OneToMany } from 'typeorm';
import {
  BOOLEAN,
  LENGTH_100,
  LENGTH_255,
  VARCHAR,
} from '../constant/sql-column.constant';
import { BaseEntity } from './base.entity';
import { MainGeneratedSpecEntity } from './main-generated-spec.entity';
import { MainTemplateEntity } from './main-template.entity';

@Entity({ name: 'user' })
export class UserEntity extends BaseEntity {
  @Column({ type: VARCHAR, length: LENGTH_255, unique: true })
  email: string;

  @Column({ type: VARCHAR, length: LENGTH_100 })
  firstName: string;

  @Column({ type: VARCHAR, length: LENGTH_100 })
  lastName: string;

  @Column({ type: VARCHAR, length: LENGTH_255 })
  password: string;

  @Column({ type: BOOLEAN, default: true })
  isActive: boolean;

  @OneToMany(() => MainTemplateEntity, (mainTemplate) => mainTemplate.user)
  mainTemplates: MainTemplateEntity[];

  @OneToMany(
    () => MainGeneratedSpecEntity,
    (mainGeneratedSpec) => mainGeneratedSpec.user,
  )
  mainGeneratedSpecs: MainGeneratedSpecEntity[];
}
