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

  beforeInsert(event: InsertEvent<BaseEntity>) {
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

  private safeGetUserId(): string | undefined {
    try {
      return this.requestContextService.userId;
    } catch {
      return undefined;
    }
  }
}
