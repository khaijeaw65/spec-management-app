import { ILanguageRepository } from './language.repository.interface';

export class MockLanguageRepository implements ILanguageRepository {
  findAll = jest.fn().mockResolvedValue([]);
  findByCode = jest.fn().mockResolvedValue(null);
}
