import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IGenerateSpecRepository } from '../repositories/generate-spec/generate-spec.repository.interface';
import { ISpecService } from './interfaces/spec.service.interface';
import { SpecStatusCode } from 'src/types/spec-status-code.enum';
import type { LlmResponse } from '../gen-ai/ports/llm-client.interface';
import { GeneratedSpecOutput } from '../gen-ai/types/generated-spec-output.type';
import { IGenerateSpecRiskRepository } from '../repositories/generate-spec-risk/generate-spec-risk.repository.interface';
import { IGenerateSpecSectionRepository } from '../repositories/generate-spec-section/generate-spec-section.repository.interface';
import { IMainGenerateSpecRepository } from '../repositories/main-generate-spec/main-genereate-spec.repository.interface';
import { IRiskTypeRepository } from '../repositories/risk-type/risk-type.repository.interface';
import { ISpecStatusRepository } from '../repositories/spec-status/spec-status.repository.interface';
import { Transactional } from '@nestjs-cls/transactional';
import { GeneratedSpecEntity } from 'src/entities/generated-spec.entity';
import { RiskTypeEntity } from 'src/entities/risk-type.entity';
import { LoggerService } from '../../utils/logger/logger.service';
import {
  CreateSpecDto,
  GenerateSpecResponseDto,
  LanguageCodeSchema,
  RiskPrioritySchema,
  RiskTypeSchema,
  type SpecDetailDto,
  SpecListQuery,
  SpecListResponseDto,
  SpecStatusCodeSchema,
} from '@spec-app/schemas';
import { IStorageService } from '../storage/ports/storage.service.interface';
import { IQueueService } from '../queue/ports/queue.service.interface';
import { IRequestContextService } from '../../contexts/request/interfaces/request.context.interface';
import { ILanguageRepository } from '../repositories/language/language.repository.interface';
import { RiskTypeCode } from 'src/types/risk-type-code.enum';
import { LanguageCode } from 'src/types/language-code.enum';
import { RiskPriority } from 'src/types/risk-priority.enum';

@Injectable()
export class SpecService implements ISpecService {
  constructor(
    private readonly generateSpecRepository: IGenerateSpecRepository,
    private readonly generateSpecSectionRepository: IGenerateSpecSectionRepository,
    private readonly riskTypeRepository: IRiskTypeRepository,
    private readonly generateSpecRiskRepository: IGenerateSpecRiskRepository,
    private readonly mainGenerateSpecRepository: IMainGenerateSpecRepository,
    private readonly specStatusRepository: ISpecStatusRepository,
    private readonly storageService: IStorageService,
    private readonly logger: LoggerService,
    private readonly queueService: IQueueService,
    private readonly requestContextService: IRequestContextService,
    private readonly languageRepository: ILanguageRepository,
  ) {}

  async getSpecs(query: SpecListQuery): Promise<SpecListResponseDto> {
    const { items, totalCount, page, limit } =
      await this.mainGenerateSpecRepository.findAll(query);

    console.log('get specs', items);

    return {
      items: items.map((spec) => ({
        id: spec.id,
        versionId: spec.currentVersion?.id ?? '',
        name: spec.name,
        templateName: spec.template.currentVersion!.name,
        version: spec.currentVersion?.version ?? 1,
        sectionCount:
          spec.currentVersion?.templateVersion?.templateSectionsCount ?? 0,
        status:
          SpecStatusCodeSchema.safeParse(spec.currentVersion?.status?.code)
            .data ?? SpecStatusCode.PENDING,
        language: spec.currentVersion?.language?.code ?? LanguageCode.EN,
        updatedAt: spec.updatedOn.toISOString(),
      })),
      totalCount,
      page,
      limit,
    };
  }

  async getByMainAndVersionId(
    mainSpecId: string,
    versionId: string,
  ): Promise<SpecDetailDto> {
    const spec = await this.mainGenerateSpecRepository.findByMainAndVersionId(
      mainSpecId,
      versionId,
    );
    if (!spec) throw new NotFoundException('Spec not found');

    const versions =
      await this.generateSpecRepository.findVersionsByMainSpecId(mainSpecId);

    return {
      id: spec.id,
      versionId: spec.currentVersion?.id ?? '',
      name: spec.name,
      templateName: spec.template?.currentVersion?.name ?? '',
      description: spec.description ?? undefined,
      status:
        SpecStatusCodeSchema.safeParse(spec.currentVersion?.status?.code)
          .data ?? SpecStatusCode.PENDING,
      language:
        LanguageCodeSchema.safeParse(spec.currentVersion?.language?.code)
          .data ?? LanguageCode.EN,
      version: spec.currentVersion?.version ?? 1,
      createdByName: spec.user.firstName + ' ' + spec.user.lastName,
      createdAt: spec.createdOn.toISOString(),
      updatedAt: spec.updatedOn.toISOString(),
      momFile: await this.buildMomFileDto(spec.currentVersion ?? undefined),
      sections:
        spec.currentVersion?.templateVersion?.templateSections.map(
          (section) => ({
            id: section.id,
            title: section.title,
            description: section.description ?? undefined,
            detail: section.description ?? undefined,
          }),
        ) ?? [],
      risks:
        spec.currentVersion?.specRisks.map((risk) => ({
          id: risk.id,
          sectionTitle: risk.section?.templateSection.title ?? 'Unknown',
          riskType:
            RiskTypeSchema.safeParse(risk.riskType?.code).data ??
            RiskTypeCode.AMBIGUOUS_LANGUAGE,
          priority:
            RiskPrioritySchema.safeParse(risk.priority).data ??
            RiskPriority.MEDIUM,
          detail: risk.detail ?? undefined,
          referenceText: risk.referenceText ?? undefined,
        })) ?? [],
      versions: versions.map((version) => ({
        id: version.id,
        version: version.version,
        createdAt: version.createdOn.toISOString(),
        updatedAt: version.updatedOn.toISOString(),
      })),
    };
  }

  async markAsExported(specId: string): Promise<void> {
    await this.generateSpecRepository.update({
      id: specId,
      exportedOn: new Date(),
    });
  }

  async generateSpec(
    dto: CreateSpecDto,
    file?: Express.Multer.File,
  ): Promise<GenerateSpecResponseDto> {
    const preparedMomFile = this.prepareMomFile(dto.momContent, file);

    const { mainSpecId, generatedSpec } = await this.createPendingSpec(dto);

    // use spec id as s3 key — traceable and unique
    const momS3Key = `mom/${generatedSpec.id}`;

    await this.storageService.uploadFile(
      preparedMomFile.buffer,
      momS3Key,
      preparedMomFile.contentType,
    );

    // update spec with s3 key after upload
    await this.generateSpecRepository.update({
      ...generatedSpec,
      momS3Key,
    });

    await this.queueService.sendMessage(
      JSON.stringify({
        type: 'GENERATE_SPEC',
        generatedSpecId: generatedSpec.id,
      }),
    );

    return {
      id: mainSpecId,
      versionId: generatedSpec.id,
    };
  }

  private prepareMomFile(
    momContent: string | undefined,
    file?: Express.Multer.File,
  ): { buffer: Buffer; contentType: string } {
    if (file) {
      return {
        buffer: file.buffer,
        contentType: file.mimetype,
      };
    }

    if (momContent) {
      return {
        buffer: Buffer.from(momContent, 'utf-8'),
        contentType: 'text/plain',
      };
    }

    throw new BadRequestException('Either momContent or file must be provided');
  }

  private async createPendingSpec(spec: CreateSpecDto): Promise<{
    mainSpecId: string;
    generatedSpec: GeneratedSpecEntity;
  }> {
    const language = await this.languageRepository.findByCode(spec.language);

    const createdMainSpec = await this.mainGenerateSpecRepository.create({
      name: spec.name,
      description: spec.description ?? undefined,
      template: {
        id: spec.mainTemplateId,
      },
      user: {
        id: this.requestContextService.userId,
      },
    });

    const pendingStatus = await this.specStatusRepository.findByCode(
      SpecStatusCode.PENDING,
    );

    if (!pendingStatus) {
      throw new Error('Pending status not found');
    }

    const createdGeneratedSpec = await this.generateSpecRepository.create({
      mainSpec: { id: createdMainSpec.id },
      templateVersion: { id: spec.versionId },
      language: { id: language?.id },
      status: { id: pendingStatus.id },
      momInputType: spec.inputType,
      version: 1,
    });

    await this.mainGenerateSpecRepository.update({
      id: createdMainSpec.id,
      currentVersion: { id: createdGeneratedSpec.id },
    });

    return {
      mainSpecId: createdMainSpec.id,
      generatedSpec: createdGeneratedSpec,
    };
  }

  public async getSpecForGeneration(specId: string) {
    const spec = await this.generateSpecRepository.findById(specId);
    if (!spec) throw new NotFoundException('Spec not found');
    if (!spec.momS3Key) throw new Error('MOM S3 key not found');

    const riskTypes = await this.riskTypeRepository.findAll();
    if (!riskTypes?.length) throw new Error('Risk types not found');

    return { spec, riskTypes };
  }

  @Transactional()
  public async saveGenerationResult(
    spec: GeneratedSpecEntity,
    riskTypes: RiskTypeEntity[],
    result: LlmResponse,
    generationTimeMs: number,
  ): Promise<void> {
    const genSpec = this.parseGenerationResult(result);

    // build map once — title → templateSection
    // spec.templateVersion.templateSections is already loaded
    const templateSectionMap = new Map(
      spec.templateVersion.templateSections.map((ts) => [ts.title, ts]),
    );

    // 1. save sections
    const sectionIdMap = new Map<string, string>(); // sectionName → created section id

    const sectionEntities = genSpec.sections
      .map((section) => {
        const templateSection = templateSectionMap.get(section.sectionName);
        if (!templateSection) {
          this.logger.warn(
            `No template section matched: ${section.sectionName}`,
            SpecService.name,
          );
          return null;
        }
        return {
          spec: { id: spec.id },
          templateSection: { id: templateSection.id },
          sortOrder: templateSection.sortOrder,
          content: section.content ?? null,
        };
      })
      .filter((s) => s !== null);

    const createdSections =
      await this.generateSpecSectionRepository.createMany(sectionEntities);

    // build sectionName → created section id map for risk matching
    createdSections.forEach((cs, index) => {
      const sectionName = genSpec.sections[index]?.sectionName;
      if (sectionName) {
        sectionIdMap.set(sectionName, cs.id);
      }
    });

    // 2. save risks
    const validRisks = genSpec.risks
      .map((risk) => {
        const riskType = riskTypes.find((r) => r.code === risk.code);
        if (!riskType) {
          this.logger.warn(`Unknown risk type: ${risk.code}`, SpecService.name);
          return null;
        }

        // match by sectionName → created section id
        const sectionId = risk.sectionName
          ? sectionIdMap.get(risk.sectionName)
          : null;

        if (risk.sectionName && !sectionId) {
          this.logger.warn(
            `No created section matched for risk: ${risk.sectionName}`,
            SpecService.name,
          );
        }

        return {
          spec: { id: spec.id },
          section: sectionId ? { id: sectionId } : null,
          riskType: { id: riskType.id },
          priority: risk.priority,
          detail: risk.detail,
          referenceText: risk.referenceText ?? null,
        };
      })
      .filter((r) => r !== null);

    if (validRisks.length > 0) {
      await this.generateSpecRiskRepository.createMany(validRisks);
    }

    // 3. update spec status + AI metadata
    const completedStatus = await this.specStatusRepository.findByCode(
      SpecStatusCode.COMPLETED,
    );
    if (!completedStatus) throw new Error('COMPLETED status not found');

    await this.generateSpecRepository.update({
      ...spec,
      status: completedStatus,
      aiModel: result.model,
      promptTokens: result.usage?.promptTokens,
      completionTokens: result.usage?.completionTokens,
      totalTokens: result.usage?.totalTokens,
      generationTimeMs,
    });

    // 4. update currentVersion pointer
    await this.mainGenerateSpecRepository.update({
      id: spec.mainSpec.id,
      currentVersion: { id: spec.id },
    });
  }

  public async updateSpecStatus(
    specId: string,
    status: SpecStatusCode,
  ): Promise<void> {
    const specStatus = await this.specStatusRepository.findByCode(status);
    if (!specStatus) {
      throw new NotFoundException('Spec status not found');
    }
    await this.generateSpecRepository.updateStatus(specId, specStatus.id);
  }

  public async updateSpecStatusForMainSpec(
    mainSpecId: string,
    status: SpecStatusCode,
  ): Promise<void> {
    const main = await this.mainGenerateSpecRepository.findById(mainSpecId);
    if (!main?.currentVersion?.id) {
      throw new NotFoundException('Specification not found');
    }
    await this.updateSpecStatus(main.currentVersion.id, status);
  }

  async getMomFileResponse(versionId: string): Promise<{
    buffer: Buffer;
    contentType: string;
    fileName: string;
  }> {
    const userId = this.requestContextService.userId;
    const spec =
      await this.generateSpecRepository.findByIdWithMainUser(versionId);
    if (!spec?.momS3Key?.length || !spec.mainSpec?.user) {
      throw new NotFoundException('MOM not found');
    }
    if (spec.mainSpec.user.id !== userId) {
      throw new NotFoundException('MOM not found');
    }
    const meta = await this.resolveMomMeta(spec);
    const file = await this.storageService.getFile(spec.momS3Key);
    return {
      buffer: file.buffer,
      contentType: this.contentTypeForMomExt(meta.extension),
      fileName: meta.fileName,
    };
  }

  private async buildMomFileDto(
    version: GeneratedSpecEntity | null | undefined,
  ): Promise<SpecDetailDto['momFile']> {
    if (!version?.momS3Key) {
      return null;
    }
    return this.resolveMomMeta(version);
  }

  private async resolveMomMeta(spec: GeneratedSpecEntity): Promise<{
    fileName: string;
    extension: 'txt' | 'pdf' | 'docx';
  }> {
    if (!spec.momS3Key) {
      throw new NotFoundException('MOM not found');
    }
    if (spec.momInputType === 'TEXT') {
      return { fileName: 'meeting-notes.txt', extension: 'txt' };
    }
    const head = await this.storageService.headFile(spec.momS3Key);
    const extension = this.mimeToMomExt(head.contentType);
    return { fileName: `meeting-notes.${extension}`, extension };
  }

  private mimeToMomExt(
    contentType: string | undefined,
  ): 'txt' | 'pdf' | 'docx' {
    const ct = contentType?.split(';')[0]?.trim().toLowerCase();
    switch (ct) {
      case 'text/plain':
        return 'txt';
      case 'application/pdf':
        return 'pdf';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'docx';
      default:
        return 'txt';
    }
  }

  private contentTypeForMomExt(ext: 'txt' | 'pdf' | 'docx'): string {
    switch (ext) {
      case 'txt':
        return 'text/plain';
      case 'pdf':
        return 'application/pdf';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default: {
        const _e: never = ext;
        return _e;
      }
    }
  }

  private parseGenerationResult(result: LlmResponse): GeneratedSpecOutput {
    try {
      return JSON.parse(result.text) as GeneratedSpecOutput;
    } catch {
      throw new Error('Failed to parse AI response');
    }
  }
}
