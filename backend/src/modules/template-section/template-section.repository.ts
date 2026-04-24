import { Injectable } from '@nestjs/common';
import { ITemplateSectionRepository } from './template-section.repository.interface';
import { TemplateSectionEntity } from 'src/entities/template-section.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class TemplateSectionRepository implements ITemplateSectionRepository {
  constructor(
    @InjectRepository(TemplateSectionEntity)
    private readonly templateSectionRepository: Repository<TemplateSectionEntity>,
  ) {}

  createMany(
    sections: DeepPartial<TemplateSectionEntity>[],
  ): Promise<TemplateSectionEntity[]> {
    return this.templateSectionRepository.save(sections);
  }

  updateMany(
    sections: DeepPartial<TemplateSectionEntity>[],
  ): Promise<TemplateSectionEntity[]> {
    return this.templateSectionRepository.save(sections);
  }
}
