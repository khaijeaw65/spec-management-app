import { LanguageEntity } from 'src/entities/language.entity';

export abstract class ILanguageRepository {
  abstract findByCode(code: string): Promise<LanguageEntity | null>;
}
