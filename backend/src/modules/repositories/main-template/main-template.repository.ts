import { InjectRepository } from '@nestjs/typeorm';
import { MainTemplateEntity } from 'src/entities/main-template.entity';
import { DeepPartial, DeleteResult, Repository, UpdateResult } from 'typeorm';
import { IMainTemplateRepository } from './main-template.repository.interface';

export class MainTemplateRepository implements IMainTemplateRepository {
  constructor(
    @InjectRepository(MainTemplateEntity)
    private readonly repo: Repository<MainTemplateEntity>,
  ) {}
  async findById(id: string): Promise<MainTemplateEntity | null> {
    return this.repo.findOne({
      where: {
        id,
        isActive: true,
        currentVersion: {
          isActive: true,
        },
      },
      relations: {
        user: true,
        currentVersion: {
          templateSections: true,
        },
        language: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<MainTemplateEntity[]> {
    const qb = this.repo
      .createQueryBuilder('mainTemplate')
      .innerJoinAndSelect('mainTemplate.user', 'user')
      .innerJoinAndSelect('mainTemplate.currentVersion', 'currentVersion')
      .innerJoinAndSelect('mainTemplate.language', 'language')
      .loadRelationCountAndMap(
        'currentVersion.templateSectionsCount',
        'currentVersion.templateSections',
      )
      .where('mainTemplate.user.id = :userId', { userId })
      .andWhere('mainTemplate.isActive = TRUE')
      .andWhere('currentVersion.isActive = TRUE');

    return qb.getMany();
  }

  async create(
    mainTemplate: DeepPartial<MainTemplateEntity>,
  ): Promise<MainTemplateEntity> {
    return this.repo.save(mainTemplate);
  }

  async update(
    mainTemplate: DeepPartial<MainTemplateEntity>,
  ): Promise<MainTemplateEntity> {
    return this.repo.save(mainTemplate);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.repo.delete(id);
  }

  async softDelete(id: string): Promise<UpdateResult> {
    return this.repo.update(id, { isActive: false });
  }
}
