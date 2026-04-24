export abstract class IQueueService {
  abstract sendMessage(message: string): Promise<void>;
  abstract receiveMessages(): Promise<QueueMessage[]>;
  abstract deleteMessage(receiptHandle: string): Promise<void>;
}

export interface QueueMessage {
  body: string;
  receiptHandle: string;
}
