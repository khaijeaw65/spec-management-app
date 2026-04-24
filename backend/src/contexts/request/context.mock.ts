import { IRequestContextService } from './interfaces/request.context.interface';

export class MockRequestContextService implements IRequestContextService {
  private _userId = 'mock-user-id';
  private _requestId = 'mock-request-id';

  get userId(): string {
    return this._userId;
  }

  set userId(userId: string) {
    this._userId = userId;
  }

  get requestId() {
    return this._requestId;
  }
  set requestId(requestId: string) {
    this._requestId = requestId;
  }
}
