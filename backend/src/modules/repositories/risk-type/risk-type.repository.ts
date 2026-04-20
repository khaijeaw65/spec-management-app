import { Injectable } from '@nestjs/common';
import { IRiskTypeRepository } from './risk-type.repository.interface';
import { RiskTypeEntity } from 'src/entities/risk-type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class RiskTypeRepository implements IRiskTypeRepository {
  constructor(
    @InjectRepository(RiskTypeEntity)
    private readonly repo: Repository<RiskTypeEntity>,
  ) {}

  findById(id: string): Promise<RiskTypeEntity | null> {
    return this.repo.findOne({
      where: { id, isActive: true },
    });
  }

  findAll(): Promise<RiskTypeEntity[]> {
    return this.repo.find({
      where: { isActive: true },
    });
  }

  create(riskType: DeepPartial<RiskTypeEntity>): Promise<RiskTypeEntity> {
    return this.repo.save(riskType);
  }

  update(riskType: DeepPartial<RiskTypeEntity>): Promise<RiskTypeEntity> {
    return this.repo.save(riskType);
  }

  delete(id: string): Promise<DeleteResult> {
    return this.repo.delete(id);
  }

  softDelete(id: string): Promise<UpdateResult> {
    return this.repo.update(id, { isActive: false });
  }
}
