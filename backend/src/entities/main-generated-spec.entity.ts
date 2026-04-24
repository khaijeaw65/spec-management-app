import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import {
  LENGTH_255,
  NULLABLE,
  TEXT,
  VARCHAR,
} from '../constant/sql-column.constant';
import { BaseEntity } from './base.entity';
import { GeneratedSpecEntity } from './generated-spec.entity';
import { MainTemplateEntity } from './main-template.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'main_generated_spec' })
export class MainGeneratedSpecEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.mainGeneratedSpecs)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(
    () => MainTemplateEntity,
    (mainTemplate) => mainTemplate.mainGeneratedSpecs,
  )
  @JoinColumn({ name: 'template_id' })
  template: MainTemplateEntity;

  @Column({ type: VARCHAR, length: LENGTH_255 })
  name: string;

  @Column({ type: TEXT, nullable: NULLABLE })
  description?: string | null;

  @ManyToOne(
    () => GeneratedSpecEntity,
    (generatedSpec) => generatedSpec.mainGeneratedSpecsWhereCurrent,
    {
      nullable: true,
    },
  )
  @JoinColumn({ name: 'current_version' })
  currentVersion?: GeneratedSpecEntity | null;

  @ManyToOne(() => GeneratedSpecEntity, { nullable: true })
  @JoinColumn({ name: 'pending_version_id' })
  pendingVersion?: GeneratedSpecEntity | null;

  @OneToMany(
    () => GeneratedSpecEntity,
    (generatedSpec) => generatedSpec.mainSpec,
  )
  generatedSpecs: GeneratedSpecEntity[];
}
