import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StorageModule } from './modules/storage/storage.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './providers/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TemplateModule } from './modules/template/template.module';
import { SpecModule } from './modules/spec/spec.module';
import { ClsModule } from 'nestjs-cls';
import { RequestContextModule } from './contexts/request/context.module';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup(cls, req: Request) {
          cls.set('requestId', req.headers['x-request-id'] ?? uuidv4());
        },
      },
    }),
    RequestContextModule,
    DatabaseModule,
    StorageModule,
    UserModule,
    AuthModule,
    TemplateModule,
    SpecModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
