import { SpecStatusDto } from '@spec-app/schemas';

export abstract class ISpecStatusService {
  abstract getStatuses(): Promise<SpecStatusDto[]>;
}
