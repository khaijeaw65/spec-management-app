import { IMainGenerateSpecRepository } from './main-genereate-spec.repository.interface';

export class MockMainGenerateSpecRepository implements IMainGenerateSpecRepository {
  findById = jest.fn().mockResolvedValue({
    id: 'mock-id',
    user: { id: 'mock-user-id' },
    template: { id: 'mock-template-id' },
    name: 'mock-name',
    currentVersion: { id: 'mock-current-version-id' },
    generatedSpecs: [{ id: 'mock-generated-spec-id' }],
  });
  create = jest.fn().mockResolvedValue({
    id: 'mock-id',
    user: { id: 'mock-user-id' },
    template: { id: 'mock-template-id' },
    name: 'mock-name',
    currentVersion: { id: 'mock-current-version-id' },
    generatedSpecs: [{ id: 'mock-generated-spec-id' }],
  });
  update = jest.fn().mockResolvedValue({ id: 'mock-id', name: 'mock-name' });
  delete = jest.fn().mockResolvedValue({ affected: 1 });
  softDelete = jest.fn().mockResolvedValue({ affected: 1 });
}
