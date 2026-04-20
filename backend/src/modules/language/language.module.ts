import { Module } from '@nestjs/common';
import { LanguageService } from './language.service';
import { LanguageController } from './language.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguageEntity } from 'src/entities/language.entity';
import { LanguageRepository } from '../repositories/language/language.repository';
import { ILanguageRepository } from '../repositories/language/language.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([LanguageEntity])],
  controllers: [LanguageController],
  providers: [
    LanguageService,
    {
      provide: ILanguageRepository,
      useClass: LanguageRepository,
    },
  ],
})
export class LanguageModule {}
