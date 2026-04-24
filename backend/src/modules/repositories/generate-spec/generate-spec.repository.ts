import { Injectable } from '@nestjs/common';
import { IGenerateSpecRepository } from './generate-spec.repository.interface';
import { GeneratedSpecEntity } from '../../../entities/generated-spec.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class GenerateSpecRepository implements IGenerateSpecRepository {
  constructor(
    @InjectRepository(GeneratedSpecEntity)
    private readonly repo: Repository<GeneratedSpecEntity>,
  ) {}

  async findById(id: string): Promise<GeneratedSpecEntity | null> {
    return this.repo.findOne({
      where: {
        id,
        isActive: true,
      },
      relations: {
        mainSpec: true,
        language: true,
        status: true,
        templateVersion: {
          templateSections: true,
        },
      },
    });
  }

  async findByIdForDetail(id: string): Promise<GeneratedSpecEntity | null> {
    return this.repo.findOne({
      where: {
        id,
      },
      relations: {
        mainSpec: { user: true },
        language: true,
        status: true,
        templateVersion: true,
        generatedSpecSections: {
          templateSection: true,
        },
        specRisks: {
          riskType: true,
          section: { templateSection: true },
        },
      },
    });
  }

  async findByIdWithMainSpec(id: string): Promise<GeneratedSpecEntity | null> {
    return this.repo.findOne({
      where: {
        id,
        isActive: true,
      },
      relations: {
        mainSpec: { user: true },
      },
    });
  }

  async findLatestVersionByMainSpecId(
    mainSpecId: string,
  ): Promise<{ id: string | null; version: number }> {
    const result = await this.repo
      .createQueryBuilder('generatedSpec')
      .select('generatedSpec.id', 'id')
      .addSelect('generatedSpec.version', 'version')
      .where('generatedSpec.mainSpec = :mainSpecId', { mainSpecId })
      .andWhere('generatedSpec.isActive = TRUE')
      .orderBy('generatedSpec.version', 'DESC')
      .limit(1)
      .getRawOne<{ id: string; version: number | string }>();

    return {
      id: result?.id ?? null,
      version:
        typeof result?.version === 'string'
          ? Number.parseInt(result.version, 10) || 0
          : (result?.version ?? 0),
    };
  }

  async findByIdForExport(id: string): Promise<GeneratedSpecEntity | null> {
    return this.repo.findOne({
      where: {
        id,
        isActive: true,
      },
      relations: {
        mainSpec: true,
        language: true,
        status: true,
        templateVersion: true,
        generatedSpecSections: {
          templateSection: true,
        },
      },
    });
  }

  async findByMainSpecId(mainSpecId: string): Promise<GeneratedSpecEntity[]> {
    return this.repo.find({
      where: {
        mainSpec: { id: mainSpecId },
        isActive: true,
      },
    });
  }

  async findVersionsByMainSpecId(
    mainSpecId: string,
  ): Promise<GeneratedSpecEntity[]> {
    return this.repo.find({
      where: {
        mainSpec: { id: mainSpecId },
      },
      relations: {
        templateVersion: true,
      },
      order: {
        version: 'DESC',
      },
    });
  }

  async create(
    generateSpec: DeepPartial<GeneratedSpecEntity>,
  ): Promise<GeneratedSpecEntity> {
    return this.repo.save(generateSpec);
  }

  async update(
    generateSpec: DeepPartial<GeneratedSpecEntity>,
  ): Promise<GeneratedSpecEntity> {
    return this.repo.save(generateSpec);
  }

  async updateStatus(id: string, statusId: string): Promise<UpdateResult> {
    return this.repo.update(id, {
      status: { id: statusId },
    });
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.repo.delete(id);
  }

  async softDelete(id: string): Promise<UpdateResult> {
    return this.repo.update(id, { isActive: false });
  }
}
