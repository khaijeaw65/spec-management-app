import { Module } from '@nestjs/common';
import { IQueueService } from './ports/queue.service.interface';
import { AwsSqsService } from '../../providers/infrastructures/queue/aws-SQS.service';
import { QueueConfigModule } from 'src/providers/config/queue/config.module';

@Module({
  imports: [QueueConfigModule],
  providers: [
    AwsSqsService,
    {
      provide: IQueueService,
      useExisting: AwsSqsService,
    },
  ],
  exports: [IQueueService],
})
export class QueueModule {}
