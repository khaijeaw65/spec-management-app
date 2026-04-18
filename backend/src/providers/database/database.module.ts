import { Module } from '@nestjs/common';
import { TypeOrmModule as NestTypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfigService } from '../config/database/config.service';
import { DatabaseConfigModule } from '../config/database/config.module';
import { UserEntity } from '../../entities/user.entity';
import { GeneratedSpecSectionEntity } from '../../entities/generated-spec-section.entity';
import { GeneratedSpecEntity } from '../../entities/generated-spec.entity';
import { MainGeneratedSpecEntity } from '../../entities/main-generated-spec.entity';
import { MainTemplateEntity } from '../../entities/main-template.entity';
import { SpecRiskEntity } from '../../entities/spec-risk.entity';
import { TemplateSectionEntity } from '../../entities/template-section.entity';
import { TemplateEntity } from '../../entities/template.entity';
import { RiskTypeEntity } from '../../entities/risk-type.entity';
import { LanguageEntity } from '../../entities/language.entity';
import { SpecStatusEntity } from '../../entities/spec-status.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AuditLogEntity } from 'src/entities/audit-log.entity';
import { AuditSubscriber } from './subscribers/audit.subscriber';

@Module({
  imports: [
    NestTypeOrmModule.forRootAsync({
      imports: [DatabaseConfigModule],
      inject: [DatabaseConfigService],
      useFactory: (config: DatabaseConfigService) => ({
        type: 'postgres',
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        database: config.database,
        entities: [
          UserEntity,
          MainTemplateEntity,
          TemplateEntity,
          TemplateSectionEntity,
          MainGeneratedSpecEntity,
          GeneratedSpecEntity,
          GeneratedSpecSectionEntity,
          SpecRiskEntity,
          RiskTypeEntity,
          LanguageEntity,
          SpecStatusEntity,
          AuditLogEntity,
        ],
        autoLoadEntities: true,
        synchronize: false,
        logging: false,
        namingStrategy: new SnakeNamingStrategy(),
        subscribers: [],
      }),
    }),
  ],
  providers: [AuditSubscriber],
  exports: [],
})
export class DatabaseModule {}
