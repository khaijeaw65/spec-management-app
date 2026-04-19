import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SpecStatusEntity } from 'src/entities/spec-status.entity';
import { DeepPartial, DeleteResult, Repository, UpdateResult } from 'typeorm';
import { ISpecStatusRepository } from './spec-status.repository.interface';

@Injectable()
export class SpecStatusRepository implements ISpecStatusRepository {
  constructor(
    @InjectRepository(SpecStatusEntity)
    private readonly specStatusRepository: Repository<SpecStatusEntity>,
  ) {}

  findById(id: string): Promise<SpecStatusEntity | null> {
    return this.specStatusRepository.findOne({
      where: { id, isActive: true },
    });
  }

  findByCode(code: string): Promise<SpecStatusEntity | null> {
    return this.specStatusRepository.findOne({
      where: { code, isActive: true },
    });
  }

  create(specStatus: DeepPartial<SpecStatusEntity>): Promise<SpecStatusEntity> {
    return this.specStatusRepository.save(specStatus);
  }

  update(specStatus: DeepPartial<SpecStatusEntity>): Promise<SpecStatusEntity> {
    return this.specStatusRepository.save(specStatus);
  }

  delete(id: string): Promise<DeleteResult> {
    return this.specStatusRepository.delete(id);
  }

  softDelete(id: string): Promise<UpdateResult> {
    return this.specStatusRepository.update(id, { isActive: false });
  }
}
