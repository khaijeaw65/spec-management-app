import { IMainTemplateRepository } from './main-template.repository.interface';

export class MockMainTemplateRepository implements IMainTemplateRepository {
  findById = jest.fn().mockResolvedValue({
    id: '1',
    name: 'Test Template',
    description: 'Test Description',
    language: { code: 'EN' },
    currentVersion: {
      id: '1',
      name: 'Test Version',
      description: 'Test Description',
      templateSections: [],
    },
    createdOn: new Date(),
  });
  findByUserId = jest.fn().mockResolvedValue([
    {
      id: '1',
      name: 'Test Template',
      description: 'Test Description',
      language: { code: 'EN' },
      currentVersion: {
        id: '1',
        name: 'Test Version',
        description: 'Test Description',
        templateSections: [],
      },
      createdOn: new Date(),
    },
  ]);
  create = jest.fn().mockResolvedValue({ id: 'mock-id', name: 'mock-name' });
  update = jest.fn().mockResolvedValue({ id: 'mock-id', name: 'mock-name' });
  delete = jest.fn().mockResolvedValue({ affected: 1 });
  softDelete = jest.fn().mockResolvedValue({ affected: 1 });
}
