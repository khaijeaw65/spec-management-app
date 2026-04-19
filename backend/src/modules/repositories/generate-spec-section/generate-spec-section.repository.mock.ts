import { IGenerateSpecSectionRepository } from './generate-spec-section.repository.interface';

export class MockGenerateSpecSectionRepository implements IGenerateSpecSectionRepository {
  findById = jest.fn().mockResolvedValue({
    id: 'mock-id',
    spec: { id: 'mock-spec-id' },
    templateSection: { id: 'mock-template-section-id' },
    sortOrder: 0,
    detail: 'mock-detail',
  });
  findBySpecId = jest.fn().mockResolvedValue([]);
  create = jest.fn().mockResolvedValue({ id: 'mock-id', name: 'mock-name' });
  createMany = jest.fn().mockResolvedValue([]);
  update = jest.fn().mockResolvedValue({ id: 'mock-id', name: 'mock-name' });
  updateMany = jest.fn().mockResolvedValue([]);
  delete = jest.fn().mockResolvedValue({ affected: 1 });
  softDelete = jest.fn().mockResolvedValue({ affected: 1 });
}
