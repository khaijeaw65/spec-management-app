import { Injectable } from '@nestjs/common';
import { ISpecStatusService } from './interfaces/spec-status.service.interface';
import { ISpecStatusRepository } from '../repositories/spec-status/spec-status.repository.interface';
import { SpecStatusDto } from '@spec-app/schemas';

@Injectable()
export class SpecStatusService implements ISpecStatusService {
  constructor(private readonly specStatusRepository: ISpecStatusRepository) {}

  async getStatuses(): Promise<SpecStatusDto[]> {
    const statuses = await this.specStatusRepository.findAll();
    return statuses.map((status) => ({
      id: status.id,
      code: status.code,
      name: status.name,
    }));
  }
}
