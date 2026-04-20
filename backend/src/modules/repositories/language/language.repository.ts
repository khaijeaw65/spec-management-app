import { Injectable } from '@nestjs/common';
import { ILanguageRepository } from './language.repository.interface';
import { LanguageEntity } from 'src/entities/language.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class LanguageRepository implements ILanguageRepository {
  constructor(
    @InjectRepository(LanguageEntity)
    private readonly repo: Repository<LanguageEntity>,
  ) {}

  async findAll(): Promise<LanguageEntity[]> {
    return this.repo.find({
      where: { isActive: true },
    });
  }

  async findByCode(code: string): Promise<LanguageEntity | null> {
    return this.repo.findOne({
      where: { code, isActive: true },
    });
  }
}
