import { Injectable } from '@nestjs/common';
import { IGenerateSpecSectionRepository } from './generate-spec-section.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { GeneratedSpecSectionEntity } from 'src/entities/generated-spec-section.entity';
import { DeepPartial, DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class GenerateSpecSectionRepository implements IGenerateSpecSectionRepository {
  constructor(
    @InjectRepository(GeneratedSpecSectionEntity)
    private readonly repo: Repository<GeneratedSpecSectionEntity>,
  ) {}

  findById(id: string): Promise<GeneratedSpecSectionEntity | null> {
    return this.repo.findOne({
      where: { id, isActive: true },
      relations: {
        spec: true,
        templateSection: true,
      },
    });
  }

  findBySpecId(specId: string): Promise<GeneratedSpecSectionEntity[]> {
    return this.repo.find({
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
    return this.repo.save(generateSpecSection);
  }

  createMany(
    generateSpecSections: DeepPartial<GeneratedSpecSectionEntity>[],
  ): Promise<GeneratedSpecSectionEntity[]> {
    return this.repo.save(generateSpecSections);
  }

  update(
    generateSpecSection: DeepPartial<GeneratedSpecSectionEntity>,
  ): Promise<GeneratedSpecSectionEntity> {
    return this.repo.save(generateSpecSection);
  }

  updateMany(
    generateSpecSections: DeepPartial<GeneratedSpecSectionEntity>[],
  ): Promise<GeneratedSpecSectionEntity[]> {
    return this.repo.save(generateSpecSections);
  }

  delete(id: string): Promise<DeleteResult> {
    return this.repo.delete(id);
  }

  softDelete(id: string): Promise<UpdateResult> {
    return this.repo.update(id, {
      isActive: false,
    });
  }
}
