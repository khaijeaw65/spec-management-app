import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './modules/worker/worker.module';
import { LoggerService } from './utils/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(LoggerService));
  app.get(LoggerService).log('Worker process started', 'Bootstrap');

  // keep process alive — polling loop handles everything
  await new Promise<void>(() => {});
}

void bootstrap();
