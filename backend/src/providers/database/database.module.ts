import { Module } from '@nestjs/common';
import { TypeOrmModule as NestTypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfigService } from 'src/providers/config/database/config.service';
import { DatabaseConfigModule } from 'src/providers/config/database/config.module';
import { UserEntity } from 'src/entities/user.entity';
import { GeneratedSpecSectionEntity } from 'src/entities/generated-spec-section.entity';
import { GeneratedSpecEntity } from 'src/entities/generated-spec.entity';
import { MainGeneratedSpecEntity } from 'src/entities/main-generated-spec.entity';
import { MainTemplateEntity } from 'src/entities/main-template.entity';
import { SpecRiskEntity } from 'src/entities/spec-risk.entity';
import { TemplateSectionEntity } from 'src/entities/template-section.entity';
import { TemplateEntity } from 'src/entities/template.entity';
import { RiskTypeEntity } from 'src/entities/risk-type.entity';
import { SectionTypeEntity } from 'src/entities/section-type.entity';
import { LanguageEntity } from 'src/entities/language.entity';
import { SpecStatusEntity } from 'src/entities/spec-status.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

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
          SectionTypeEntity,
          LanguageEntity,
          SpecStatusEntity,
        ],
        autoLoadEntities: true,
        synchronize: false,
        logging: false,
        namingStrategy: new SnakeNamingStrategy(),
      }),
    }),
  ],
  exports: [],
})
export class DatabaseModule {}
