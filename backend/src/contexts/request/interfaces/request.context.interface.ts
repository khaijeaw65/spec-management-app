export abstract class IRequestContextService {
  abstract get userId(): string;
  abstract set userId(userId: string);
}
