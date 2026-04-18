import { Injectable } from '@nestjs/common';
import { BaseEntity } from '../../../entities/base.entity';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  DataSource,
} from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { IRequestContextService } from '../../../contexts/request/interfaces/request.context.interface';
import { AuditLogEntity } from '../../../entities/audit-log.entity';

const AUDIT_EXCLUDED_KEYS = new Set([
  'createdBy',
  'updatedBy',
  'createdOn',
  'updatedOn',
  'deletedBy',
  'deletedOn',
]);

@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<BaseEntity> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    private readonly requestContextService: IRequestContextService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return BaseEntity;
  }

  // ─── Audit column hooks ──────────────────────────────────────────

  beforeInsert(event: InsertEvent<BaseEntity>) {
    console.log('before insert', event.entity);
    const userId = this.safeGetUserId();
    event.entity.createdBy = { id: userId };
    event.entity.updatedBy = { id: userId };
    event.entity.createdOn = new Date();
    event.entity.updatedOn = new Date();
  }

  beforeUpdate(event: UpdateEvent<BaseEntity>) {
    if (!event.entity) return;
    const userId = this.safeGetUserId();
    event.entity.updatedBy = { id: userId };
    event.entity.updatedOn = new Date();
  }

  // ─── Audit log hooks ─────────────────────────────────────────────

  async afterInsert(event: InsertEvent<BaseEntity>) {
    // skip AuditLogEntity itself — prevent infinite loop
    if (event.entity instanceof AuditLogEntity) return;

    console.log(event.entity);

    await event.manager.getRepository(AuditLogEntity).insert({
      entity: event.metadata.targetName,
      entityId: event.entity.id,
      action: 'CREATE',
      changedFields: null,
      changedBy: this.safeGetUserId(),
      changedAt: new Date(),
    });
  }

  async afterUpdate(event: UpdateEvent<BaseEntity>) {
    console.log(event.entity);
    if (!event.entity) return;
    if (event.entity instanceof AuditLogEntity) return;

    const changedFields = this.diffEntities(
      event.databaseEntity, // old values — TypeORM loads this automatically
      event.entity,
    );

    // nothing meaningful changed — skip
    if (Object.keys(changedFields).length === 0) return;

    await event.manager.getRepository(AuditLogEntity).insert({
      entity: event.metadata.targetName,
      entityId: event.entity.id as string,
      action: 'UPDATE',
      changedFields: changedFields as unknown as Record<string, any>,
      changedBy: this.safeGetUserId(),
      changedAt: new Date(),
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────

  private diffEntities(
    oldEntity: Record<string, any>,
    newEntity: Record<string, any>,
  ): Record<string, { from: unknown; to: unknown }> {
    if (!oldEntity || !newEntity) return {};

    const changed: Record<string, { from: unknown; to: unknown }> = {};

    for (const key of Object.keys(newEntity)) {
      if (AUDIT_EXCLUDED_KEYS.has(key)) continue;

      const oldVal = oldEntity[key] as unknown;
      const newVal = newEntity[key] as unknown;

      // skip if same value
      if (oldVal === newVal) continue;

      // skip if both are null/undefined
      if (oldVal == null && newVal == null) continue;

      // skip relation objects — only track scalar values
      if (
        typeof newVal === 'object' &&
        newVal !== null &&
        !Array.isArray(newVal)
      )
        continue;

      changed[key] = { from: oldVal, to: newVal };
    }

    return changed;
  }

  private safeGetUserId(): string | undefined {
    try {
      return this.requestContextService.userId;
    } catch {
      return undefined;
    }
  }
}
