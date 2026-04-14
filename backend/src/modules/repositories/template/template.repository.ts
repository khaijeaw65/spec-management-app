import { Injectable } from '@nestjs/common';
import { ITemplateRepository } from './template.repository.interface';
import { TemplateEntity } from '../../../entities/template.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class TemplateRepository implements ITemplateRepository {
  constructor(
    @InjectRepository(TemplateEntity)
    private readonly templateRepository: Repository<TemplateEntity>,
  ) {}

  async findByUserId(userId: string) {
    return this.templateRepository.find({
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
    return this.templateRepository.findOne({
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
    return this.templateRepository.save(template);
  }

  async update(template: DeepPartial<TemplateEntity>) {
    return this.templateRepository.save(template);
  }

  async delete(id: string) {
    return this.templateRepository.delete(id);
  }

  async softDelete(id: string) {
    return this.templateRepository.update(id, { isActive: false });
  }
}
