import { IMainGenerateSpecRepository } from './main-genereate-spec.repository.interface';

export class MockMainGenerateSpecRepository implements IMainGenerateSpecRepository {
  findAll = jest.fn().mockResolvedValue({
    items: [
      {
        id: 'mock-id',
        user: { id: 'mock-user-id' },
        template: { id: 'mock-template-id' },
        name: 'mock-name',
        currentVersion: { id: 'mock-current-version-id' },
        generatedSpecs: [{ id: 'mock-generated-spec-id' }],
      },
    ],
    totalCount: 1,
    page: 1,
    limit: 10,
  });
  findById = jest.fn().mockResolvedValue({
    id: 'mock-id',
    user: { id: 'mock-user-id' },
    template: { id: 'mock-template-id' },
    name: 'mock-name',
    currentVersion: { id: 'mock-current-version-id' },
    generatedSpecs: [{ id: 'mock-generated-spec-id' }],
  });
  findByMainAndVersionId = jest.fn().mockResolvedValue({
    id: 'mock-id',
    user: { id: 'mock-user-id' },
    template: { id: 'mock-template-id' },
    name: 'mock-name',
    currentVersion: { id: 'mock-current-version-id' },
    generatedSpecs: [{ id: 'mock-generated-spec-id' }],
  });
  findVersions = jest.fn().mockResolvedValue([]);
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
