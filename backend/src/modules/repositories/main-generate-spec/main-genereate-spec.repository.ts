import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MainGeneratedSpecEntity } from 'src/entities/main-generated-spec.entity';
import { DeepPartial, DeleteResult, Repository, UpdateResult } from 'typeorm';
import { IMainGenerateSpecRepository } from './main-genereate-spec.repository.interface';

@Injectable()
export class MainGenerateSpecRepository implements IMainGenerateSpecRepository {
  constructor(
    @InjectRepository(MainGeneratedSpecEntity)
    private readonly mainGenerateSpecRepository: Repository<MainGeneratedSpecEntity>,
  ) {}

  findById(id: string): Promise<MainGeneratedSpecEntity | null> {
    return this.mainGenerateSpecRepository.findOne({
      where: { id, isActive: true },
      relations: {
        user: true,
        template: true,
        currentVersion: true,
      },
    });
  }

  create(
    mainGeneratedSpec: DeepPartial<MainGeneratedSpecEntity>,
  ): Promise<MainGeneratedSpecEntity> {
    return this.mainGenerateSpecRepository.save(mainGeneratedSpec);
  }

  update(
    mainGeneratedSpec: DeepPartial<MainGeneratedSpecEntity>,
  ): Promise<MainGeneratedSpecEntity> {
    return this.mainGenerateSpecRepository.save(mainGeneratedSpec);
  }

  delete(id: string): Promise<DeleteResult> {
    return this.mainGenerateSpecRepository.delete(id);
  }

  softDelete(id: string): Promise<UpdateResult> {
    return this.mainGenerateSpecRepository.update(id, { isActive: false });
  }
}
