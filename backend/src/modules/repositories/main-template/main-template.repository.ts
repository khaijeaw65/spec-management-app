import { InjectRepository } from '@nestjs/typeorm';
import { MainTemplateEntity } from 'src/entities/main-template.entity';
import { DeepPartial, DeleteResult, Repository, UpdateResult } from 'typeorm';
import { IMainTemplateRepository } from './main-template.repository.interface';

export class MainTemplateRepository implements IMainTemplateRepository {
  constructor(
    @InjectRepository(MainTemplateEntity)
    private readonly mainTemplateRepository: Repository<MainTemplateEntity>,
  ) {}
  async findById(id: string): Promise<MainTemplateEntity | null> {
    return this.mainTemplateRepository.findOne({
      where: {
        id,
        isActive: true,
        currentVersion: {
          isActive: true,
        },
      },
      relations: {
        currentVersion: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<MainTemplateEntity[]> {
    return this.mainTemplateRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        currentVersion: true,
      },
    });
  }

  async create(
    mainTemplate: DeepPartial<MainTemplateEntity>,
  ): Promise<MainTemplateEntity> {
    return this.mainTemplateRepository.save(mainTemplate);
  }

  async update(
    mainTemplate: DeepPartial<MainTemplateEntity>,
  ): Promise<MainTemplateEntity> {
    return this.mainTemplateRepository.save(mainTemplate);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.mainTemplateRepository.delete(id);
  }

  async softDelete(id: string): Promise<UpdateResult> {
    return this.mainTemplateRepository.update(id, { isActive: false });
  }
}
