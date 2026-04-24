import { LanguageEntity } from 'src/entities/language.entity';

export abstract class ILanguageRepository {
  abstract findAll(): Promise<LanguageEntity[]>;
  abstract findByCode(code: string): Promise<LanguageEntity | null>;
}
