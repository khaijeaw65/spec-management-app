import {
  ReceiveMessageCommand,
  DeleteMessageCommand,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';
import {
  IQueueService,
  QueueMessage,
} from 'src/modules/queue/ports/queue.service.interface';
import { QueueConfigService } from 'src/providers/config/queue/config.service';

@Injectable()
export class AwsSqsService implements IQueueService {
  private readonly client: SQSClient;

  constructor(private readonly configService: QueueConfigService) {
    this.client = new SQSClient({
      region: this.configService.region,
      credentials: {
        accessKeyId: this.configService.accessKeyId,
        secretAccessKey: this.configService.secretAccessKey,
      },
    });
  }

  async sendMessage(message: string): Promise<void> {
    await this.client.send(
      new SendMessageCommand({
        QueueUrl: this.configService.url,
        MessageBody: message,
      }),
    );
  }

  async receiveMessages(): Promise<QueueMessage[]> {
    const response = await this.client.send(
      new ReceiveMessageCommand({
        QueueUrl: this.configService.url,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20,
        VisibilityTimeout: 30,
      }),
    );

    return (response.Messages ?? []).map((msg) => ({
      body: msg.Body ?? '',
      receiptHandle: msg.ReceiptHandle ?? '',
    }));
  }

  async deleteMessage(receiptHandle: string): Promise<void> {
    await this.client.send(
      new DeleteMessageCommand({
        QueueUrl: this.configService.url,
        ReceiptHandle: receiptHandle,
      }),
    );
  }
}
