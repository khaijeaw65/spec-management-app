import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MainGeneratedSpecEntity } from 'src/entities/main-generated-spec.entity';
import {
  Brackets,
  DeepPartial,
  DeleteResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { IMainGenerateSpecRepository } from './main-genereate-spec.repository.interface';
import { type DashboardStatKind, SpecListQuery } from '@spec-app/schemas';
import { SpecStatusCode } from 'src/types/spec-status-code.enum';

@Injectable()
export class MainGenerateSpecRepository implements IMainGenerateSpecRepository {
  constructor(
    @InjectRepository(MainGeneratedSpecEntity)
    private readonly repo: Repository<MainGeneratedSpecEntity>,
  ) {}

  async findAll(userId: string, query: SpecListQuery) {
    const qb = this.repo
      .createQueryBuilder('mainGeneratedSpec')
      .leftJoinAndSelect('mainGeneratedSpec.template', 'template')
      .leftJoinAndSelect('template.currentVersion', 'templateCurrentVersion')
      .leftJoinAndSelect('mainGeneratedSpec.currentVersion', 'currentVersion')
      .leftJoinAndSelect('mainGeneratedSpec.pendingVersion', 'pendingVersion')
      .leftJoinAndSelect('currentVersion.status', 'status')
      .leftJoinAndSelect('currentVersion.language', 'language')
      .leftJoinAndSelect('currentVersion.templateVersion', 'templateVersion')
      .leftJoinAndSelect('pendingVersion.status', 'pendingStatus')
      .leftJoinAndSelect('pendingVersion.language', 'pendingLanguage')
      .leftJoinAndSelect(
        'pendingVersion.templateVersion',
        'pendingTemplateVersion',
      )
      .loadRelationCountAndMap(
        'templateVersion.templateSectionsCount',
        'templateVersion.templateSections',
      )
      .loadRelationCountAndMap(
        'pendingTemplateVersion.templateSectionsCount',
        'pendingTemplateVersion.templateSections',
      )
      .where('mainGeneratedSpec.isActive = TRUE')
      .andWhere('template.user.id = :userId', { userId });

    // search
    if (query?.search) {
      qb.andWhere('mainGeneratedSpec.name ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    // status filter — match current or pending row (first gen has no currentVersion)
    if (query.status) {
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('status.code = :status', { status: query.status })
            .orWhere('pendingStatus.code = :status', { status: query.status });
        }),
      );
    }

    // language filter
    if (query.language) {
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('language.code = :language', { language: query.language })
            .orWhere('pendingLanguage.code = :language', {
              language: query.language,
            });
        }),
      );
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
      case 'LAST_UPDATED':
        qb.orderBy('mainGeneratedSpec.updatedOn', 'DESC');
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

  async getDashboardCount(userId: string, kind: DashboardStatKind) {
    const qb = this.repo
      .createQueryBuilder('mainSpec')
      .innerJoin('mainSpec.template', 'tpl')
      .innerJoin('tpl.user', 'owner')
      .leftJoin('mainSpec.currentVersion', 'cv')
      .leftJoin('mainSpec.pendingVersion', 'pv')
      .leftJoin('cv.status', 'cs')
      .leftJoin('pv.status', 'ps')
      .where('mainSpec.isActive = TRUE')
      .andWhere('owner.id = :userId', { userId });

    if (kind !== 'total') {
      const code =
        kind === 'reviewed'
          ? SpecStatusCode.REVIEWED
          : kind === 'processing'
            ? SpecStatusCode.PROCESSING
            : SpecStatusCode.FAILED;
      qb.andWhere('COALESCE(cs.code, ps.code) = :code', { code });
    }

    const raw = await qb
      .select('COUNT(DISTINCT mainSpec.id)::int', 'count')
      .getRawOne<{ count: string | number | null }>();

    const n = (v: string | number | null | undefined) =>
      v == null
        ? 0
        : typeof v === 'number'
          ? v
          : Number.parseInt(String(v), 10) || 0;

    return n(raw?.count);
  }

  findById(id: string): Promise<MainGeneratedSpecEntity | null> {
    return this.repo.findOne({
      where: { id, isActive: true },
      relations: {
        user: true,
        template: { language: true, currentVersion: true },
        currentVersion: true,
      },
    });
  }

  findByMainAndVersionId(
    mainSpecId: string,
    versionId: string,
  ): Promise<MainGeneratedSpecEntity | null> {
    // IsActive is not assigned because previous spec will be flagged as inactive when new spec is generated. And it still need to be viewable
    return this.repo.findOne({
      where: {
        id: mainSpecId,
        generatedSpecs: { id: versionId },
      },
      relations: {
        user: true,
        template: { currentVersion: true },
        pendingVersion: {
          status: true,
          language: true,
          templateVersion: { templateSections: true },
        },
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
