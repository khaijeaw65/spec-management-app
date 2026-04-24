import { ITemplateSectionRepository } from './template-section.repository.interface';

export class MockTemplateSectionRepository implements ITemplateSectionRepository {
  createMany = jest.fn().mockResolvedValue([]);
  updateMany = jest.fn().mockResolvedValue([]);
}
