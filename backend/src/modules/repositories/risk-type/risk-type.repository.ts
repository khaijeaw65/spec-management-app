import { Injectable } from '@nestjs/common';
import { IRiskTypeRepository } from './risk-type.repository.interface';
import { RiskTypeEntity } from 'src/entities/risk-type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class RiskTypeRepository implements IRiskTypeRepository {
  constructor(
    @InjectRepository(RiskTypeEntity)
    private readonly riskTypeRepository: Repository<RiskTypeEntity>,
  ) {}

  findById(id: string): Promise<RiskTypeEntity | null> {
    return this.riskTypeRepository.findOne({
      where: { id, isActive: true },
    });
  }

  findAll(): Promise<RiskTypeEntity[]> {
    return this.riskTypeRepository.find({
      where: { isActive: true },
    });
  }

  create(riskType: DeepPartial<RiskTypeEntity>): Promise<RiskTypeEntity> {
    return this.riskTypeRepository.save(riskType);
  }

  update(riskType: DeepPartial<RiskTypeEntity>): Promise<RiskTypeEntity> {
    return this.riskTypeRepository.save(riskType);
  }

  delete(id: string): Promise<DeleteResult> {
    return this.riskTypeRepository.delete(id);
  }

  softDelete(id: string): Promise<UpdateResult> {
    return this.riskTypeRepository.update(id, { isActive: false });
  }
}
