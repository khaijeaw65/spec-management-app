import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
  GenerateSpecResponseSchema,
  SpecListQuerySchema,
  type SpecListQuery,
  SpecDetailSchema,
  SpecListResponseSchema,
  UpdateSpecStatusSchema,
} from '@spec-app/schemas';
import {
  zodToOpenapi,
  zodToOpenapiMultipart,
  zodToOpenapiResponse,
} from '../../swagger/zod-to-openapi';
import { FileInterceptor } from '@nestjs/platform-express';
import { momFileOptions } from 'src/utils/file-upload/file-upload.config';
import { SpecStatusCode } from 'src/types/spec-status-code.enum';
import type { Response } from 'express';
import { SkipTransform } from 'src/decorators/skip-transform-response.decorator';

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

  @Get(':mainId/versions/:versionId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get specification detail',
    description:
      '`mainId` is the main generated spec id; `versionId` is the generated spec (version row) id.',
  })
  @ApiOkResponse({ schema: zodToOpenapiResponse(SpecDetailSchema) })
  async getSpecDetail(
    @Param('mainId') mainId: string,
    @Param('versionId') versionId: string,
  ) {
    return this.specService.getByMainAndVersionId(mainId, versionId);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update status of the specification’s current version',
    description:
      'Path `id` is the main specification id (same as list/detail).',
  })
  @ApiBody({ schema: zodToOpenapi(UpdateSpecStatusSchema) })
  @ApiOkResponse({ description: 'Status updated' })
  async updateSpecStatus(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<void> {
    const parsed = UpdateSpecStatusSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException('Invalid request body');
    }
    await this.specService.updateSpecStatusForMainSpec(
      id,
      parsed.data.status as SpecStatusCode,
    );
  }

  @Get(':id/export')
  @SkipTransform()
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

  @Get(':id/mom')
  @SkipTransform()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Download original MOM',
    description:
      'Path `id` is the generated-spec (version row) id, same as list `versionId`.',
  })
  async getMom(
    @Param('id') id: string,
    @Res({ passthrough: false }) res: Response,
  ) {
    const { buffer, contentType, fileName } =
      await this.specService.getMomFileResponse(id);
    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${fileName.replace(/"/g, '')}"`,
    );
    res.send(buffer);
  }

  @Post('generate')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Generate spec' })
  @ApiOkResponse({ schema: zodToOpenapiResponse(GenerateSpecResponseSchema) })
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
