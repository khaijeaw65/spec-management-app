import { Injectable } from '@nestjs/common';
import { IGenerateSpecSectionRepository } from './generate-spec-section.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { GeneratedSpecSectionEntity } from 'src/entities/generated-spec-section.entity';
import { DeepPartial, DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class GenerateSpecSectionRepository implements IGenerateSpecSectionRepository {
  constructor(
    @InjectRepository(GeneratedSpecSectionEntity)
    private readonly generateSpecSectionRepository: Repository<GeneratedSpecSectionEntity>,
  ) {}

  findById(id: string): Promise<GeneratedSpecSectionEntity | null> {
    return this.generateSpecSectionRepository.findOne({
      where: { id, isActive: true },
      relations: {
        spec: true,
        templateSection: true,
      },
    });
  }

  findBySpecId(specId: string): Promise<GeneratedSpecSectionEntity[]> {
    return this.generateSpecSectionRepository.find({
      where: { spec: { id: specId }, isActive: true },
      relations: {
        spec: true,
        templateSection: true,
      },
    });
  }

  create(
    generateSpecSection: DeepPartial<GeneratedSpecSectionEntity>,
  ): Promise<GeneratedSpecSectionEntity> {
    return this.generateSpecSectionRepository.save(generateSpecSection);
  }

  createMany(
    generateSpecSections: DeepPartial<GeneratedSpecSectionEntity>[],
  ): Promise<GeneratedSpecSectionEntity[]> {
    return this.generateSpecSectionRepository.save(generateSpecSections);
  }

  update(
    generateSpecSection: DeepPartial<GeneratedSpecSectionEntity>,
  ): Promise<GeneratedSpecSectionEntity> {
    return this.generateSpecSectionRepository.save(generateSpecSection);
  }

  updateMany(
    generateSpecSections: DeepPartial<GeneratedSpecSectionEntity>[],
  ): Promise<GeneratedSpecSectionEntity[]> {
    return this.generateSpecSectionRepository.save(generateSpecSections);
  }

  delete(id: string): Promise<DeleteResult> {
    return this.generateSpecSectionRepository.delete(id);
  }

  softDelete(id: string): Promise<UpdateResult> {
    return this.generateSpecSectionRepository.update(id, {
      isActive: false,
    });
  }
}
