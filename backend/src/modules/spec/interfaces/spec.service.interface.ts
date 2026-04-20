import { GeneratedSpecEntity } from '../../../entities/generated-spec.entity';
import { RiskTypeEntity } from '../../../entities/risk-type.entity';
import type { LlmResponse } from '../../gen-ai/ports/llm-client.interface';
import { SpecStatusCode } from '../../../types/spec-status-code.enum';
import { CreateSpecDto, GenerateSpecResponseDto } from '@spec-app/schemas';

export abstract class ISpecService {
  abstract generateSpec(
    spec: CreateSpecDto,
    file?: Express.Multer.File,
  ): Promise<GenerateSpecResponseDto>;
  abstract getSpecForGeneration(specId: string): Promise<{
    spec: GeneratedSpecEntity;
    riskTypes: RiskTypeEntity[];
  }>;
  abstract saveGenerationResult(
    spec: GeneratedSpecEntity,
    riskTypes: RiskTypeEntity[],
    result: LlmResponse,
    generationTimeMs: number,
  ): Promise<void>;
  abstract updateSpecStatus(
    specId: string,
    status: SpecStatusCode,
  ): Promise<void>;
  /** Resolve main spec’s `currentVersion` and call {@link updateSpecStatus}. */
  abstract updateSpecStatusForMainSpec(
    mainSpecId: string,
    status: SpecStatusCode,
  ): Promise<void>;
}
