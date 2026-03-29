import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BOOLEAN } from '../constant/sql-column.constant';
import { BaseEntity } from './base.entity';
import { MainGeneratedSpecEntity } from './main-generated-spec.entity';
import { TemplateEntity } from './template.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'main_template' })
export class MainTemplateEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.mainTemplates)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: BOOLEAN, default: true })
  isActive: boolean;

  @OneToMany(() => TemplateEntity, (template) => template.mainTemplate)
  templates: TemplateEntity[];

  @OneToMany(
    () => MainGeneratedSpecEntity,
    (mainGeneratedSpec) => mainGeneratedSpec.template,
  )
  mainGeneratedSpecs: MainGeneratedSpecEntity[];
}
