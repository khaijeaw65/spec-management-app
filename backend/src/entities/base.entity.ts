import {
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeepPartial,
} from 'typeorm';
import {
  BOOLEAN,
  NULLABLE,
  TIMESTAMPTZ,
} from '../constant/sql-column.constant';
import type { UserEntity } from './user.entity';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: BOOLEAN, default: true })
  isActive: boolean;

  @ManyToOne('UserEntity', { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: DeepPartial<UserEntity> | null;

  @CreateDateColumn({ type: TIMESTAMPTZ })
  createdOn: Date;

  @ManyToOne('UserEntity', { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: DeepPartial<UserEntity> | null;

  @UpdateDateColumn({ type: TIMESTAMPTZ })
  updatedOn: Date;

  @ManyToOne('UserEntity', { nullable: true })
  @JoinColumn({ name: 'deleted_by' })
  deletedBy?: DeepPartial<UserEntity> | null;

  @Column({ type: TIMESTAMPTZ, nullable: NULLABLE })
  deletedOn?: Date | null;
}
