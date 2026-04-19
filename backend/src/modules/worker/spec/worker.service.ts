import { Injectable } from '@nestjs/common';
import { IGenAiService } from '../../gen-ai/ports/gen-ai.interface';
import {
  IQueueService,
  QueueMessage,
} from '../../queue/ports/queue.service.interface';
import { ISpecService } from '../../spec/interfaces/spec.service.interface';
import { SpecStatusCode } from 'src/types/spec-status-code.enum';
import { LoggerService } from '../../../utils/logger/logger.service';

const MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 2000;

@Injectable()
export class SpecWorkerService {
  constructor(
    private readonly genAiService: IGenAiService,
    private readonly queueService: IQueueService,
    private readonly specService: ISpecService,
    private readonly logger: LoggerService,
  ) {}

  async handleMessage(message: QueueMessage): Promise<void> {
    const { body, receiptHandle } = message;

    let parsedBody: { generatedSpecId: string };

    try {
      parsedBody = JSON.parse(body) as { generatedSpecId: string };
    } catch {
      this.logger.error(
        `Invalid JSON in message: ${body}`,
        undefined,
        SpecWorkerService.name,
      );
      await this.queueService.deleteMessage(receiptHandle);
      return;
    }

    const { generatedSpecId } = parsedBody;
    let lastError: Error | undefined;

    await this.specService.updateSpecStatus(
      generatedSpecId,
      SpecStatusCode.PROCESSING,
    );

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        await this.processJob(generatedSpecId);
        await this.queueService.deleteMessage(receiptHandle);

        this.logger.log(
          `GENERATE_SPEC completed: ${generatedSpecId}`,
          SpecWorkerService.name,
        );
        return;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        this.logger.warn(
          `Attempt ${attempt}/${MAX_ATTEMPTS} failed: ${generatedSpecId} — ${lastError.message}`,
          SpecWorkerService.name,
        );

        if (attempt < MAX_ATTEMPTS) {
          await this.delay(RETRY_BASE_DELAY_MS * attempt); // 2s, 4s
        }
      }
    }

    // all attempts failed
    this.logger.error(
      `GENERATE_SPEC failed after ${MAX_ATTEMPTS} attempts: ${generatedSpecId}`,
      lastError?.stack,
      SpecWorkerService.name,
    );

    try {
      await this.specService.updateSpecStatus(
        generatedSpecId,
        SpecStatusCode.FAILED,
      );
    } catch (err) {
      this.logger.error(
        `Failed to mark spec as FAILED: ${generatedSpecId}`,
        err instanceof Error ? err.stack : String(err),
        SpecWorkerService.name,
      );
    }

    // delete regardless — prevent infinite redelivery
    await this.queueService.deleteMessage(receiptHandle);
  }

  private async processJob(generatedSpecId: string): Promise<void> {
    const { spec, riskTypes } =
      await this.specService.getSpecForGeneration(generatedSpecId);

    if (!spec.momS3Key) {
      throw new Error('MOM S3 key not found');
    }

    const start = Date.now();

    const result = await this.genAiService.generateSpec(
      spec.momS3Key,
      spec.templateVersion.templateSections.map((section) => ({
        id: section.id,
        order: section.sortOrder,
        title: section.title,
        description: section.description ?? '',
      })),
      riskTypes.map((r) => ({ id: r.id, name: r.name })),
      spec.language.code,
    );

    const generationTimeMs = Date.now() - start;

    await this.specService.saveGenerationResult(
      spec,
      riskTypes,
      result,
      generationTimeMs,
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
