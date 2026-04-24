import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import {
  ClsPluginTransactional,
  NoOpTransactionalAdapter,
} from '@nestjs-cls/transactional';
import { TemplateService } from './template.service';
import { MockMainTemplateRepository } from '../repositories/main-template/main-template.repository.mock';
import { MockLanguageRepository } from '../repositories/language/language.repository.mock';
import { MockTemplateRepository } from '../repositories/template/template.repository.mock';
import { MockRequestContextService } from '../../contexts/request/context.mock';
import { ILanguageRepository } from '../repositories/language/language.repository.interface';
import { IRequestContextService } from '../../contexts/request/interfaces/request.context.interface';
import { IMainTemplateRepository } from '../repositories/main-template/main-template.repository.interface';
import { ITemplateRepository } from '../repositories/template/template.repository.interface';
import { ITemplateSectionRepository } from '../template-section/template-section.repository.interface';
import { MockTemplateSectionRepository } from '../template-section/template-section.repository.mock';

describe('TemplateService', () => {
  let service: TemplateService;
  let mainTemplateRepository: MockMainTemplateRepository;
  let templateRepository: MockTemplateRepository;
  let languageRepository: MockLanguageRepository;
  let requestContextService: MockRequestContextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ClsModule.forRoot({
          plugins: [
            new ClsPluginTransactional({
              adapter: new NoOpTransactionalAdapter({
                tx: {},
                disableWarning: true,
              }),
            }),
          ],
        }),
      ],
      providers: [
        TemplateService,
        {
          provide: IMainTemplateRepository,
          useClass: MockMainTemplateRepository,
        },
        {
          provide: ITemplateRepository,
          useClass: MockTemplateRepository,
        },
        {
          provide: ITemplateSectionRepository,
          useClass: MockTemplateSectionRepository,
        },
        {
          provide: ILanguageRepository,
          useClass: MockLanguageRepository,
        },
        {
          provide: IRequestContextService,
          useClass: MockRequestContextService,
        },
      ],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
    mainTemplateRepository = module.get<IMainTemplateRepository>(
      IMainTemplateRepository,
    ) as MockMainTemplateRepository;
    templateRepository = module.get<ITemplateRepository>(
      ITemplateRepository,
    ) as MockTemplateRepository;
    languageRepository = module.get<ILanguageRepository>(
      ILanguageRepository,
    ) as MockLanguageRepository;
    requestContextService = module.get<IRequestContextService>(
      IRequestContextService,
    ) as MockRequestContextService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserTemplates', () => {
    it('should return an array of templates', async () => {
      const templates = await service.getUserTemplates('1');
      expect(templates).toBeDefined();
    });

    it('should throw an error if the language code is invalid', async () => {
      mainTemplateRepository.findByUserId.mockResolvedValue([
        {
          id: '1',
          name: 'Test Template',
          description: 'Test Description',
          language: { code: 'invalid' },
          currentVersion: {
            name: 'Test Version',
            description: 'Test Description',
            templateSections: [],
          },
          createdOn: new Date(),
        },
      ]);
      await expect(service.getUserTemplates('1')).rejects.toThrow(
        'Failed to parse language code',
      );
    });
  });

  describe('getById', () => {
    it('should return a template', async () => {
      const template = await service.getById('1');
      expect(template).toBeDefined();
    });

    it('should throw an error if the template is not found', async () => {
      mainTemplateRepository.findById.mockResolvedValue(null);
      await expect(service.getById('1')).rejects.toThrow('Template not found');
    });

    it('should throw an error if the language code is invalid', async () => {
      mainTemplateRepository.findById.mockResolvedValue({
        id: '1',
        name: 'Test Template',
        description: 'Test Description',
        language: { code: 'invalid' },
        currentVersion: {
          id: '1',
          name: 'Test Version',
          description: 'Test Description',
          templateSections: [],
        },
        createdOn: new Date(),
      });
      await expect(service.getById('1')).rejects.toThrow(
        'Failed to parse language code',
      );
    });
  });

  describe('create', () => {
    it('should create a template', async () => {
      languageRepository.findByCode.mockResolvedValueOnce({
        id: '1',
        code: 'EN',
        name: 'English',
      });
      templateRepository.create.mockResolvedValueOnce({
        id: '1',
        name: 'Test Template',
        description: 'Test Description',
        templateSections: [],
      });
      const template = await service.create({
        name: 'Test Template',
        description: 'Test Description',
        language: 'EN',
        sections: [],
      });
      expect(template).toBeDefined();
    });

    it('should throw an error if the language is not found', async () => {
      languageRepository.findByCode.mockResolvedValue(null);
      await expect(
        service.create({
          name: 'Test Template',
          description: 'Test Description',
          language: 'EN',
          sections: [],
        }),
      ).rejects.toThrow('Language not found');
    });
  });

  describe('update', () => {
    it('should update a template', async () => {
      mainTemplateRepository.findById.mockResolvedValueOnce({
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
      templateRepository.findById.mockResolvedValueOnce({
        id: '1',
        mainTemplate: { id: '1' },
        name: 'Test Template',
        description: 'Test Description',
        templateSections: [],
      });
      templateRepository.update.mockResolvedValueOnce({
        id: '1',
        name: 'Test Template',
        description: 'Test Description',
        templateSections: [],
      });
      const template = await service.update('1', {
        id: '1',
        versionId: '1',
        name: 'Test Template Updated',
        description: 'Test Description Updated',
        language: 'EN',
        sections: [],
      });
      expect(template).toBeDefined();
      expect(template).toMatchObject({
        id: '1',
        name: 'Test Template Updated',
        description: 'Test Description Updated',
        language: 'EN',
        sections: [],
      });
    });

    it('should throw an error if the template is not found', async () => {
      mainTemplateRepository.findById.mockResolvedValueOnce(null);
      await expect(
        service.update('1', {
          id: '1',
          versionId: '1',
          name: 'Test Template',
          description: 'Test Description',
          language: 'EN',
          sections: [],
        }),
      ).rejects.toThrow('Template not found');
    });
  });
});
