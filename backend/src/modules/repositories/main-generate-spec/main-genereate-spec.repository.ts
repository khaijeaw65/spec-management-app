import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MainGeneratedSpecEntity } from 'src/entities/main-generated-spec.entity';
import { DeepPartial, DeleteResult, Repository, UpdateResult } from 'typeorm';
import { IMainGenerateSpecRepository } from './main-genereate-spec.repository.interface';
import { SpecListQuery } from '@spec-app/schemas';

@Injectable()
export class MainGenerateSpecRepository implements IMainGenerateSpecRepository {
  constructor(
    @InjectRepository(MainGeneratedSpecEntity)
    private readonly repo: Repository<MainGeneratedSpecEntity>,
  ) {}

  async findAll(query: SpecListQuery) {
    const qb = this.repo
      .createQueryBuilder('mainGeneratedSpec')
      .leftJoinAndSelect('mainGeneratedSpec.template', 'template')
      .leftJoinAndSelect('template.currentVersion', 'templateCurrentVersion')
      .leftJoinAndSelect('mainGeneratedSpec.currentVersion', 'currentVersion')
      .leftJoinAndSelect('currentVersion.status', 'status')
      .leftJoinAndSelect('currentVersion.language', 'language')
      .leftJoinAndSelect('currentVersion.templateVersion', 'templateVersion')
      .loadRelationCountAndMap(
        'templateVersion.templateSectionsCount',
        'templateVersion.templateSections',
      )
      .where('mainGeneratedSpec.isActive = TRUE');

    // search
    if (query?.search) {
      qb.andWhere('mainGeneratedSpec.name ILIKE :search', {
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
        qb.orderBy('mainGeneratedSpec.createdOn', 'ASC');
        break;
      case 'TITLE_ASC':
        qb.orderBy('mainGeneratedSpec.name', 'ASC');
        break;
      case 'TITLE_DESC':
        qb.orderBy('mainGeneratedSpec.name', 'DESC');
        break;
      case 'NEWEST':
      default:
        qb.orderBy('mainGeneratedSpec.createdOn', 'DESC');
        break;
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    qb.skip((page - 1) * limit).take(limit);

    const [items, totalCount] = await qb.getManyAndCount();
    return { items, totalCount, page, limit };
  }

  findById(id: string): Promise<MainGeneratedSpecEntity | null> {
    return this.repo.findOne({
      where: { id, isActive: true },
      relations: {
        user: true,
        template: true,
        currentVersion: true,
      },
    });
  }

  findByMainAndVersionId(
    mainSpecId: string,
    versionId: string,
  ): Promise<MainGeneratedSpecEntity | null> {
    return this.repo.findOne({
      where: {
        id: mainSpecId,
        currentVersion: { id: versionId },
        isActive: true,
      },
      relations: {
        user: true,
        template: { currentVersion: true },
        currentVersion: {
          language: true,
          status: true,
          templateVersion: { templateSections: true },
          specRisks: {
            riskType: true,
            section: { templateSection: true },
          },
        },
      },
    });
  }

  findVersions(mainSpecId: string): Promise<MainGeneratedSpecEntity[]> {
    return this.repo.find({
      where: { id: mainSpecId, isActive: true },
      relations: {
        generatedSpecs: true,
      },
      order: {
        generatedSpecs: {
          version: 'DESC',
        },
      },
    });
  }

  create(
    mainGeneratedSpec: DeepPartial<MainGeneratedSpecEntity>,
  ): Promise<MainGeneratedSpecEntity> {
    return this.repo.save(mainGeneratedSpec);
  }

  update(
    mainGeneratedSpec: DeepPartial<MainGeneratedSpecEntity>,
  ): Promise<MainGeneratedSpecEntity> {
    return this.repo.save(mainGeneratedSpec);
  }

  delete(id: string): Promise<DeleteResult> {
    return this.repo.delete(id);
  }

  softDelete(id: string): Promise<UpdateResult> {
    return this.repo.update(id, { isActive: false });
  }
}
