import {
  JSONB,
  LENGTH_100,
  LENGTH_20,
  NULLABLE,
  TIMESTAMPTZ,
  UUID,
  VARCHAR,
} from 'src/constant/sql-column.constant';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_log')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: VARCHAR, length: LENGTH_100 })
  entity: string;

  @Column({ type: UUID })
  entityId: string;

  @Column({ type: VARCHAR, length: LENGTH_20 })
  action: string;

  @Column({ type: JSONB, nullable: NULLABLE })
  changedFields: Record<string, any> | null;

  @Column({ type: UUID })
  changedBy: string;

  @Column({ type: TIMESTAMPTZ })
  changedAt: Date;
}
