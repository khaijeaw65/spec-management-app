import { Injectable, NotFoundException } from '@nestjs/common';
import { LanguageEntity } from 'src/entities/language.entity';
import { ILanguageRepository } from '../repositories/language/language.repository.interface';
import { ILanguageService } from './interfaces/language.service.interface';

@Injectable()
export class LanguageService implements ILanguageService {
  constructor(private readonly languageRepository: ILanguageRepository) {}

  async getLanguages(): Promise<LanguageEntity[]> {
    const languages = await this.languageRepository.findAll();
    return languages;
  }

  async getByCode(code: string): Promise<LanguageEntity> {
    const language = await this.languageRepository.findByCode(code);
    if (!language) {
      throw new NotFoundException('Language not found');
    }
    return language;
  }
}
