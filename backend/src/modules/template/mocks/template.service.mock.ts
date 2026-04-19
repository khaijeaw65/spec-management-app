import type { TemplateDetailDto, TemplateDto } from '@spec-app/schemas';
import { ITemplateService } from '../interfaces/template.service.interface';

const mockDetail = (): TemplateDetailDto => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  versionId: '223e4567-e89b-12d3-a456-426614174001',
  name: 'Test Template',
  description: 'Test description',
  language: 'EN',
  sections: [{ title: 'Section', description: 'Body', order: 0 }],
});

const mockListItem = (): TemplateDto => ({
  id: '223e4567-e89b-12d3-a456-426614174000',
  versionId: '223e4567-e89b-12d3-a456-426614174001',
  name: 'List item',
  description: 'Desc',
  language: 'EN',
  createdOn: new Date('2026-01-01T00:00:00.000Z'),
  sectionCount: 1,
});

export class MockTemplateService implements ITemplateService {
  getUserTemplates = jest.fn().mockResolvedValue([mockListItem()]);

  getById = jest.fn().mockResolvedValue(mockDetail());

  create = jest.fn().mockResolvedValue(mockDetail());

  update = jest.fn().mockResolvedValue(mockDetail());

  delete = jest.fn().mockResolvedValue(undefined);

  addNewVersion = jest.fn().mockResolvedValue(mockDetail());
}
