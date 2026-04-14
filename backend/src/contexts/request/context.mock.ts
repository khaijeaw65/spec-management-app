import { IRequestContextService } from './interfaces/request.context.interface';

export class MockRequestContextService implements IRequestContextService {
  private _userId = 'mock-user-id';

  get userId(): string {
    return this._userId;
  }

  set userId(userId: string) {
    this._userId = userId;
  }
}
