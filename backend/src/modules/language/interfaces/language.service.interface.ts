import { type LanguageDto } from '@spec-app/schemas';

export abstract class ILanguageService {
  abstract getLanguages(): Promise<LanguageDto[]>;
  abstract getByCode(code: string): Promise<LanguageDto>;
}
