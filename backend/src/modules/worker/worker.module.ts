import { Module } from '@nestjs/common';
import { WorkerService } from './worker.service';
import { SpecWorkerService } from './spec/worker.service';
import { QueueModule } from '../queue/queue.module';
import { SpecModule } from '../spec/spec.module';
import { GenAiModule } from '../gen-ai/gen-ai.module';
import { LoggerModule } from '../../utils/logger/logger.module';
import { DatabaseModule } from '../../providers/database/database.module';
import { ClsModule } from 'nestjs-cls';
import { ConfigModule } from '@nestjs/config';
import { RequestContextModule } from 'src/contexts/request/context.module';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: false }, // no HTTP middleware needed for worker
      plugins: [
        new ClsPluginTransactional({
          adapter: new TransactionalAdapterTypeOrm({
            dataSourceToken: DataSource,
          }),
        }),
      ],
    }),
    RequestContextModule,
    DatabaseModule,
    LoggerModule,
    QueueModule,
    SpecModule,
    GenAiModule,
  ],
  providers: [WorkerService, SpecWorkerService],
})
export class WorkerModule {}
