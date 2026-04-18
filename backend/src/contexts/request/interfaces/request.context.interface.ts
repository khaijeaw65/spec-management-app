export abstract class IRequestContextService {
  abstract get userId(): string;
  abstract set userId(userId: string);

  abstract get requestId(): string;
  abstract set requestId(requestId: string);
}
