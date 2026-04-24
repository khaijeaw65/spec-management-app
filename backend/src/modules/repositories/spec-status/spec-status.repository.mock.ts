import { ISpecStatusRepository } from './spec-status.repository.interface';

export class MockSpecStatusRepository implements ISpecStatusRepository {
  findAll = jest.fn().mockResolvedValue([
    {
      id: 'mock-id',
      code: 'mock-code',
      name: 'mock-name',
    },
  ]);
  findById = jest.fn().mockResolvedValue({
    id: 'mock-id',
    code: 'mock-code',
    name: 'mock-name',
  });
  findByCode = jest.fn().mockResolvedValue({
    id: 'mock-id',
    code: 'mock-code',
    name: 'mock-name',
  });
  create = jest.fn().mockResolvedValue({
    id: 'mock-id',
    code: 'mock-code',
    name: 'mock-name',
  });
  update = jest.fn().mockResolvedValue({
    id: 'mock-id',
    code: 'mock-code',
    name: 'mock-name',
  });
  delete = jest.fn().mockResolvedValue({ affected: 1 });
  softDelete = jest.fn().mockResolvedValue({ affected: 1 });
}
