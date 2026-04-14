import { ILanguageRepository } from './language.repository.interface';

export class MockLanguageRepository implements ILanguageRepository {
  findByCode = jest.fn().mockResolvedValue(null);
}
