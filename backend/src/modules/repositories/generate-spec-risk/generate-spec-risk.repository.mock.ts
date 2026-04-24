import { IGenerateSpecRiskRepository } from './generate-spec-risk.repository.interface';

export class MockGenerateSpecRiskRepository implements IGenerateSpecRiskRepository {
  findById = jest.fn().mockResolvedValue({
    id: 'mock-id',
    spec: { id: 'mock-spec-id' },
    section: { id: 'mock-section-id' },
    riskType: { id: 'mock-risk-type-id' },
    detail: 'mock-detail',
    referenceText: 'mock-reference-text',
  });
  findBySpecId = jest.fn().mockResolvedValue([]);
  create = jest.fn().mockResolvedValue({ id: 'mock-id', name: 'mock-name' });
  createMany = jest.fn().mockResolvedValue([]);
  update = jest.fn().mockResolvedValue({ id: 'mock-id', name: 'mock-name' });
  updateMany = jest.fn().mockResolvedValue([]);
  delete = jest.fn().mockResolvedValue({ affected: 1 });
  softDelete = jest.fn().mockResolvedValue({ affected: 1 });
}
