import { Injectable } from '@nestjs/common';
import { IGenerateSpecRiskRepository } from './generate-spec-risk.repository.interface';
import { SpecRiskEntity } from 'src/entities/spec-risk.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class GenerateSpecRiskRepository implements IGenerateSpecRiskRepository {
  constructor(
    @InjectRepository(SpecRiskEntity)
    private readonly generateSpecRiskRepository: Repository<SpecRiskEntity>,
  ) {}

  findById(id: string): Promise<SpecRiskEntity | null> {
    return this.generateSpecRiskRepository.findOne({
      where: { id, isActive: true },
    });
  }

  findBySpecId(specId: string): Promise<SpecRiskEntity[]> {
    return this.generateSpecRiskRepository.find({
      where: { spec: { id: specId }, isActive: true },
    });
  }

  create(
    generateSpecRisk: DeepPartial<SpecRiskEntity>,
  ): Promise<SpecRiskEntity> {
    return this.generateSpecRiskRepository.save(generateSpecRisk);
  }

  createMany(
    generateSpecRisks: DeepPartial<SpecRiskEntity>[],
  ): Promise<SpecRiskEntity[]> {
    return this.generateSpecRiskRepository.save(generateSpecRisks);
  }

  update(
    generateSpecRisk: DeepPartial<SpecRiskEntity>,
  ): Promise<SpecRiskEntity> {
    return this.generateSpecRiskRepository.save(generateSpecRisk);
  }

  updateMany(
    generateSpecRisks: DeepPartial<SpecRiskEntity>[],
  ): Promise<SpecRiskEntity[]> {
    return this.generateSpecRiskRepository.save(generateSpecRisks);
  }

  delete(id: string): Promise<DeleteResult> {
    return this.generateSpecRiskRepository.delete(id);
  }

  softDelete(id: string): Promise<UpdateResult> {
    return this.generateSpecRiskRepository.update(id, { isActive: false });
  }
}
