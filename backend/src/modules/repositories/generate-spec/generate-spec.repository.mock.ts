import { IGenerateSpecRepository } from './generate-spec.repository.interface';

export class MockGenerateSpecRepository implements IGenerateSpecRepository {
  findAll = jest.fn().mockResolvedValue([]);
  findById = jest.fn().mockResolvedValue({
    id: 'mock-id',
    mainSpec: { id: 'mock-main-spec-id' },
    language: { id: 'mock-language-id' },
    status: { id: 'mock-status-id' },
    templateVersion: { id: 'mock-template-version-id' },
  });
  findByIdForExport = jest.fn().mockResolvedValue({
    id: 'mock-id',
    mainSpec: { id: 'mock-main-spec-id' },
    language: { id: 'mock-language-id' },
    status: { id: 'mock-status-id' },
    templateVersion: { id: 'mock-template-version-id' },
  });
  findByMainSpecId = jest.fn().mockResolvedValue([]);
  create = jest.fn().mockResolvedValue({ id: 'mock-id', name: 'mock-name' });
  update = jest.fn().mockResolvedValue({ id: 'mock-id', name: 'mock-name' });
  updateStatus = jest
    .fn()
    .mockResolvedValue({ id: 'mock-id', name: 'mock-name' });
  delete = jest.fn().mockResolvedValue({ affected: 1 });
  softDelete = jest.fn().mockResolvedValue({ affected: 1 });
}
