import { ITemplateRepository } from './template.repository.interface';

export class MockTemplateRepository implements ITemplateRepository {
  findByUserId = jest.fn().mockResolvedValue([]);
  findById = jest.fn().mockResolvedValue(null);
  create = jest.fn().mockResolvedValue({ id: 'mock-id', name: 'mock-name' });
  update = jest.fn().mockResolvedValue({ id: 'mock-id', name: 'mock-name' });
  delete = jest.fn().mockResolvedValue({ affected: 1 });
  softDelete = jest.fn().mockResolvedValue({ affected: 1 });
}
