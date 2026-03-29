import {
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NULLABLE, TIMESTAMPTZ } from '../constant/sql-column.constant';
import type { UserEntity } from './user.entity';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('UserEntity', { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: UserEntity | null;

  @CreateDateColumn({ type: TIMESTAMPTZ })
  createdOn: Date;

  @ManyToOne('UserEntity', { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: UserEntity | null;

  @UpdateDateColumn({ type: TIMESTAMPTZ })
  updatedOn: Date;

  @ManyToOne('UserEntity', { nullable: true })
  @JoinColumn({ name: 'deleted_by' })
  deletedBy?: UserEntity | null;

  @Column({ type: TIMESTAMPTZ, nullable: NULLABLE })
  deletedOn?: Date | null;
}
