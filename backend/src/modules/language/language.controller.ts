import { Controller, Get } from '@nestjs/common';
import { LanguageService } from './language.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { LanguageSchema, type LanguageDto } from '@spec-app/schemas';
import { zodToOpenapiResponse } from 'src/swagger/zod-to-openapi';
import { z } from 'zod';

@Controller('languages')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get()
  @ApiOperation({ summary: 'Get all languages' })
  @ApiOkResponse({ schema: zodToOpenapiResponse(z.array(LanguageSchema)) })
  async getLanguages(): Promise<LanguageDto[]> {
    return this.languageService.getLanguages();
  }
}
