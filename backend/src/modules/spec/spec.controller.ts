import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SpecService } from './spec.service';
import { SpecExportService } from './spec-export.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  type CreateSpecDto,
  CreateSpecSchema,
  SpecListQuerySchema,
  type SpecListQuery,
  SpecListResponseSchema,
} from '@spec-app/schemas';
import {
  zodToOpenapi,
  zodToOpenapiMultipart,
  zodToOpenapiResponse,
} from '../../swagger/zod-to-openapi';
import { FileInterceptor } from '@nestjs/platform-express';
import { momFileOptions } from 'src/utils/file-upload/file-upload.config';
import type { Response } from 'express';

@ApiTags('Spec')
@Controller('specs')
export class SpecController {
  constructor(
    private readonly specService: SpecService,
    private readonly specExportService: SpecExportService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get specs' })
  @ApiQuery({ schema: zodToOpenapi(SpecListQuerySchema) })
  @ApiOkResponse({ schema: zodToOpenapiResponse(SpecListResponseSchema) })
  async getSpecs(@Query() query: SpecListQuery) {
    return this.specService.getSpecs(query);
  }

  @Get(':id/export')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export spec as PDF' })
  async exportPdf(
    @Param('id') id: string,
    @Res({ passthrough: false }) res: Response,
  ) {
    const buffer = await this.specExportService.generatePdf(id);
    await this.specService.markAsExported(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="spec-${id}.pdf"`,
    );
    res.send(buffer);
  }

  @Post('generate')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Generate spec' })
  @ApiBody({
    schema: zodToOpenapiMultipart(CreateSpecSchema, {
      name: 'E-Commerce Platform Requirements',
      momContent:
        'The steering committee approved OAuth2 with refresh-token rotation, PostgreSQL as the system of record, and a phased rollout beginning Q2. Outstanding: exact RTO/RPO targets and whether nightly CSV exports from the legacy warehouse remain mandatory. Next steps: BA to validate inventory sync assumptions with ERP by end of week.',
      inputType: 'TEXT',
      mainTemplateId: '550e8400-e29b-41d4-a716-446655440001',
      versionId: '550e8400-e29b-41d4-a716-446655440002',
      language: 'EN',
    }),
  })
  @UseInterceptors(FileInterceptor('file', momFileOptions))
  async generateSpec(
    @Body() body: CreateSpecDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file && !body.momContent) {
      throw new BadRequestException(
        'Either momContent or file must be provided',
      );
    }
    return this.specService.generateSpec(body, file);
  }
}
