import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import {
  IQueueService,
  QueueMessage,
} from '../queue/ports/queue.service.interface';
import { LoggerService } from '../../utils/logger/logger.service';
import { SpecWorkerService } from './spec/worker.service';

@Injectable()
export class WorkerService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private isRunning = false;

  constructor(
    private readonly queueService: IQueueService,
    private readonly specWorkerService: SpecWorkerService,
    private readonly logger: LoggerService,
  ) {}

  onApplicationBootstrap() {
    this.isRunning = true;
    void this.startPolling();
    this.logger.log('SQS polling started', WorkerService.name);
  }

  onApplicationShutdown() {
    this.isRunning = false;
    this.logger.log('SQS polling stopped', WorkerService.name);
  }

  private async startPolling(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.poll();
      } catch (err) {
        this.logger.error(
          'Unexpected polling error',
          err instanceof Error ? err.stack : String(err),
          WorkerService.name,
        );
        await this.delay(5000);
      }
    }
  }

  private async poll(): Promise<void> {
    const messages = await this.queueService.receiveMessages();
    if (messages.length === 0) return;
    await Promise.all(messages.map((msg) => this.handleMessage(msg)));
  }

  private async handleMessage(message: QueueMessage): Promise<void> {
    const { body, receiptHandle } = message;

    try {
      JSON.parse(body); // validate it's valid JSON at minimum
    } catch {
      this.logger.error(`Invalid JSON: ${body}`, undefined, WorkerService.name);
      await this.queueService.deleteMessage(receiptHandle);
      return;
    }

    await this.specWorkerService.handleMessage(message);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
