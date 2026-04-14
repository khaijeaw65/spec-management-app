import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { RequestClsStore } from './context.type';
import { IRequestContextService } from './interfaces/request.context.interface';

@Injectable()
export class RequestContextService implements IRequestContextService {
  constructor(private readonly clsService: ClsService<RequestClsStore>) {}

  get userId(): string {
    const userId = this.clsService.get<string>('userId');

    if (!userId) {
      throw new InternalServerErrorException(
        'User ID not found in request context',
      );
    }

    return userId;
  }

  set userId(userId: string) {
    this.clsService.set<string>('userId', userId);
  }
}
