import { Injectable } from '@nestjs/common';
import { ILanguageRepository } from './language.repository.interface';
import { LanguageEntity } from 'src/entities/language.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class LanguageRepository implements ILanguageRepository {
  constructor(
    @InjectRepository(LanguageEntity)
    private readonly languageRepository: Repository<LanguageEntity>,
  ) {}

  async findByCode(code: string): Promise<LanguageEntity | null> {
    return this.languageRepository.findOne({
      where: { code },
    });
  }
}
