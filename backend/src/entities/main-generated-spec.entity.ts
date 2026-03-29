import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BOOLEAN, LENGTH_255, VARCHAR } from '../constant/sql-column.constant';
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

  @ManyToOne(
    () => GeneratedSpecEntity,
    (generatedSpec) => generatedSpec.mainGeneratedSpecsWhereCurrent,
    {
      nullable: true,
    },
  )
  @JoinColumn({ name: 'current_version' })
  currentVersion?: GeneratedSpecEntity | null;

  @Column({ type: BOOLEAN, default: true })
  isActive: boolean;

  @OneToMany(
    () => GeneratedSpecEntity,
    (generatedSpec) => generatedSpec.mainSpec,
  )
  generatedSpecs: GeneratedSpecEntity[];
}
