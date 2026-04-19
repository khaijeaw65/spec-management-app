import { Injectable } from '@nestjs/common';
import { IGenerateSpecRepository } from './generate-spec.repository.interface';
import { GeneratedSpecEntity } from '../../../entities/generated-spec.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, DeleteResult, Repository, UpdateResult } from 'typeorm';
import { SpecListQuery } from '@spec-app/schemas';

@Injectable()
export class GenerateSpecRepository implements IGenerateSpecRepository {
  constructor(
    @InjectRepository(GeneratedSpecEntity)
    private readonly generateSpecRepository: Repository<GeneratedSpecEntity>,
  ) {}

  async findAll(query: SpecListQuery) {
    const qb = this.generateSpecRepository
      .createQueryBuilder('spec')
      .leftJoinAndSelect('spec.currentVersion', 'currentVersion')
      .leftJoinAndSelect('currentVersion.status', 'status')
      .leftJoinAndSelect('currentVersion.language', 'language')
      .where('spec.deletedOn IS NULL');

    // search
    if (query?.search) {
      qb.andWhere('spec.name ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    // status filter
    if (query.status) {
      qb.andWhere('status.code = :status', { status: query.status });
    }

    // language filter
    if (query.language) {
      qb.andWhere('language.code = :language', { language: query.language });
    }

    // sort
    switch (query.sort) {
      case 'OLDEST':
        qb.orderBy('spec.createdOn', 'ASC');
        break;
      case 'TITLE_ASC':
        qb.orderBy('spec.name', 'ASC');
        break;
      case 'TITLE_DESC':
        qb.orderBy('spec.name', 'DESC');
        break;
      case 'NEWEST':
      default:
        qb.orderBy('spec.createdOn', 'DESC');
        break;
    }

    return qb.getMany();
  }

  async findById(id: string): Promise<GeneratedSpecEntity | null> {
    return this.generateSpecRepository.findOne({
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

  async findByIdForExport(id: string): Promise<GeneratedSpecEntity | null> {
    return this.generateSpecRepository.findOne({
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
    return this.generateSpecRepository.find({
      where: {
        mainSpec: { id: mainSpecId },
        isActive: true,
      },
    });
  }

  async create(
    generateSpec: DeepPartial<GeneratedSpecEntity>,
  ): Promise<GeneratedSpecEntity> {
    return this.generateSpecRepository.save(generateSpec);
  }

  async update(
    generateSpec: DeepPartial<GeneratedSpecEntity>,
  ): Promise<GeneratedSpecEntity> {
    return this.generateSpecRepository.save(generateSpec);
  }

  async updateStatus(id: string, statusId: string): Promise<UpdateResult> {
    return this.generateSpecRepository.update(id, {
      status: { id: statusId },
    });
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.generateSpecRepository.delete(id);
  }

  async softDelete(id: string): Promise<UpdateResult> {
    return this.generateSpecRepository.update(id, { isActive: false });
  }
}
