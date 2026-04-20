import { Injectable } from '@nestjs/common';
import { ITemplateRepository } from './template.repository.interface';
import { TemplateEntity } from '../../../entities/template.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class TemplateRepository implements ITemplateRepository {
  constructor(
    @InjectRepository(TemplateEntity)
    private readonly repo: Repository<TemplateEntity>,
  ) {}

  async findByUserId(userId: string) {
    return this.repo.find({
      where: {
        mainTemplate: {
          user: {
            id: userId,
          },
        },
        isActive: true,
      },
      relations: {
        mainTemplate: {
          user: true,
        },
      },
    });
  }

  async findById(id: string) {
    return this.repo.findOne({
      where: {
        id,
        isActive: true,
        templateSections: true,
      },
      relations: {
        mainTemplate: {
          user: true,
        },
        templateSections: true,
      },
    });
  }

  async create(template: DeepPartial<TemplateEntity>) {
    return this.repo.save(template);
  }

  async update(template: DeepPartial<TemplateEntity>) {
    return this.repo.save(template);
  }

  async delete(id: string) {
    return this.repo.delete(id);
  }

  async softDelete(id: string) {
    return this.repo.update(id, { isActive: false });
  }
}
