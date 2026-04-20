import { Test, TestingModule } from '@nestjs/testing';
import { TemplateController } from './template.controller';
import { TemplateService } from './template.service';
import { MockTemplateService } from './mocks/template.service.mock';
import type {
  AuthUserDto,
  CreateTemplateDto,
  TemplateDetailDto,
  TemplateDto,
  UpdateTemplateDto,
} from '@spec-app/schemas';

describe('TemplateController', () => {
  let controller: TemplateController;
  let templateService: MockTemplateService;

  const authUser: AuthUserDto = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@test.com',
  };

  const detail: TemplateDetailDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    versionId: '323e4567-e89b-12d3-a456-426614174000',
    name: 'Test Template',
    description: 'Test description',
    language: 'EN',
    sections: [{ title: 'Section', description: 'Body', order: 0 }],
  };

  const list: TemplateDto[] = [
    {
      id: '223e4567-e89b-12d3-a456-426614174000',
      versionId: '423e4567-e89b-12d3-a456-426614174000',
      name: 'List item',
      description: 'Desc',
      language: 'EN',
      createdOn: new Date('2026-01-01T00:00:00.000Z'),
      sectionCount: 1,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplateController],
      providers: [
        {
          provide: TemplateService,
          useClass: MockTemplateService,
        },
      ],
    }).compile();

    controller = module.get<TemplateController>(TemplateController);
    templateService = module.get<TemplateService>(
      TemplateService,
    ) as unknown as MockTemplateService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserTemplates', () => {
    it('should delegate to templateService.getUserTemplates with user id', async () => {
      templateService.getUserTemplates.mockResolvedValueOnce(list);

      const result = await controller.getUserTemplates(authUser);

      expect(templateService.getUserTemplates).toHaveBeenCalledWith(
        authUser.id,
      );
      expect(result).toBe(list);
    });
  });

  describe('getById', () => {
    it('should delegate to templateService.getById', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      templateService.getById.mockResolvedValueOnce(detail);

      const result = await controller.getById(id);

      expect(templateService.getById).toHaveBeenCalledWith(id);
      expect(result).toBe(detail);
    });
  });

  describe('create', () => {
    it('should delegate to templateService.create', async () => {
      const body: CreateTemplateDto = {
        name: 'New',
        description: 'Desc',
        language: 'EN',
        sections: [{ title: 'S', description: 'D', order: 0 }],
      };
      templateService.create.mockResolvedValueOnce(detail);

      const result = await controller.create(body);

      expect(templateService.create).toHaveBeenCalledWith(body);
      expect(result).toBe(detail);
    });
  });

  describe('addNewVersion', () => {
    it('should delegate to templateService.addNewVersion', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      templateService.addNewVersion.mockResolvedValueOnce(detail);

      const result = await controller.addNewVersion(id);

      expect(templateService.addNewVersion).toHaveBeenCalledWith(id);
      expect(result).toBe(detail);
    });
  });

  describe('update', () => {
    it('should delegate to templateService.update', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const body: UpdateTemplateDto = {
        id,
        versionId: detail.versionId,
        name: 'Updated',
        description: 'Desc',
        language: 'TH',
        sections: [{ title: 'S', description: 'D', order: 0 }],
      };
      templateService.update.mockResolvedValueOnce(detail);

      const result = await controller.update(id, body);

      expect(templateService.update).toHaveBeenCalledWith(id, body);
      expect(result).toBe(detail);
    });
  });

  describe('delete', () => {
    it('should delegate to templateService.delete', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';

      await controller.delete(id);

      expect(templateService.delete).toHaveBeenCalledWith(id);
    });
  });
});
