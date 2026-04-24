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
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  type CreateSpecDto,
  CreateSpecSchema,
  DashboardStatCountSchema,
  DashboardStatKindSchema,
  GenerateSpecResponseSchema,
  SpecListQuerySchema,
  type SpecListQuery,
  SpecDetailSchema,
  SpecListResponseSchema,
  UpdateSpecStatusSchema,
  RegenerateSpecSchema,
  type RegenerateSpecDto,
  UpdateSpecMetaDataSchema,
  type UpdateSpecMetaDataDto,
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
import {
  generateSpecMultipartExample,
  regenerateSpecMultipartExample,
} from './spec.swagger-examples';

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

  @Get('dashboard/counts/:kind')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Dashboard stat count',
    description:
      'Single metric for dashboard cards. Use `processing` with polling while specs are generating.',
  })
  @ApiParam({
    name: 'kind',
    schema: zodToOpenapi(DashboardStatKindSchema),
  })
  @ApiOkResponse({
    schema: zodToOpenapiResponse(DashboardStatCountSchema),
  })
  async getDashboardStatCount(@Param('kind') kind: string) {
    const parsed = DashboardStatKindSchema.safeParse(kind);
    if (!parsed.success) {
      throw new BadRequestException('Invalid dashboard count kind');
    }
    return this.specService.getDashboardStatCount(parsed.data);
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
      `inline; filename="${fileName.replaceAll('"', '')}"`,
    );
    res.send(buffer);
  }

  @Post('generate')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Generate spec' })
  @ApiOkResponse({ schema: zodToOpenapiResponse(GenerateSpecResponseSchema) })
  @ApiBody({
    schema: zodToOpenapiMultipart(
      CreateSpecSchema,
      generateSpecMultipartExample,
    ),
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

  @Post(':id/regenerate')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Regenerate spec' })
  @ApiOkResponse({ schema: zodToOpenapiResponse(GenerateSpecResponseSchema) })
  @ApiBody({
    schema: zodToOpenapiMultipart(
      RegenerateSpecSchema,
      regenerateSpecMultipartExample,
    ),
  })
  @UseInterceptors(FileInterceptor('file', momFileOptions))
  async regenerateSpec(
    @Param('id') id: string,
    @Body() body: RegenerateSpecDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.specService.regenerateSpec(id, body, file);
  }

  @Patch(':id/meta-data')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update spec meta data' })
  @ApiBody({ schema: zodToOpenapi(UpdateSpecMetaDataSchema) })
  @ApiOkResponse({ description: 'Meta data updated' })
  async updateSpecMetaData(
    @Param('id') id: string,
    @Body() body: UpdateSpecMetaDataDto,
  ) {
    return this.specService.updateMetaData(id, body);
  }
}
