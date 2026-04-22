import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './exception/http-exception.filter';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerService } from './utils/logger/logger.service';

function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Spec App API')
    .setDescription('API documentation for Spec App')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(LoggerService));
  app.useGlobalFilters(new HttpExceptionFilter());

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [
      'https://spec-management-app-3ndp-six.vercel.app',
      process.env.NODE_ENV === 'local' ? 'http://localhost:3000' : undefined,
    ],
    credentials: true,
  });
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(
      `[Spec app API] is running on ${process.env.NODE_ENV} environment on port ${process.env.PORT ?? 3000}`,
    );
  });
}
void bootstrap();
