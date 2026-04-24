import { IRiskTypeRepository } from './risk-type.repository.interface';

export class MockRiskTypeRepository implements IRiskTypeRepository {
  findById = jest.fn().mockResolvedValue({
    id: 'mock-id',
    name: 'mock-name',
  });
  findAll = jest.fn().mockResolvedValue([]);
  create = jest.fn().mockResolvedValue({ id: 'mock-id', name: 'mock-name' });
  update = jest.fn().mockResolvedValue({ id: 'mock-id', name: 'mock-name' });
  delete = jest.fn().mockResolvedValue({ affected: 1 });
  softDelete = jest.fn().mockResolvedValue({ affected: 1 });
}
