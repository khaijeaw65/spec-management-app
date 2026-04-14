import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BOOLEAN } from '../constant/sql-column.constant';
import { BaseEntity } from './base.entity';
import { MainGeneratedSpecEntity } from './main-generated-spec.entity';
import { TemplateEntity } from './template.entity';
import { UserEntity } from './user.entity';
import { LanguageEntity } from './language.entity';

@Entity({ name: 'main_template' })
export class MainTemplateEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.mainTemplates)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(
    () => TemplateEntity,
    (template) => template.mainTemplatesWhereCurrent,
    {
      nullable: true,
    },
  )
  @JoinColumn({ name: 'current_version' })
  currentVersion?: TemplateEntity | null;

  @ManyToOne(() => LanguageEntity, (language) => language.mainTemplates)
  @JoinColumn({ name: 'language_id' })
  language: LanguageEntity;

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
