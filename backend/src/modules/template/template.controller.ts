import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TemplateService } from './template.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUser } from '../../decorators/auth-user.decorator';
import {
  type CreateTemplateDto,
  type UpdateTemplateDto,
  TemplateDetailSchema,
  TemplateListSchema,
  type AuthUserDto,
  CreateTemplateSchema,
} from '@spec-app/schemas';
import {
  zodToOpenapi,
  zodToOpenapiResponse,
} from '../../swagger/zod-to-openapi';

@ApiTags('Template')
@Controller('template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get('/user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user templates' })
  @ApiOkResponse({ schema: zodToOpenapiResponse(TemplateListSchema) })
  getUserTemplates(@AuthUser() user: AuthUserDto) {
    return this.templateService.getUserTemplates(user.id);
  }

  @Get('/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get template by id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ schema: zodToOpenapiResponse(TemplateDetailSchema) })
  getById(@Param('id') id: string) {
    return this.templateService.getById(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create template' })
  @ApiBody({ schema: zodToOpenapi(CreateTemplateSchema) })
  @ApiOkResponse({ schema: zodToOpenapiResponse(TemplateDetailSchema) })
  create(@Body() template: CreateTemplateDto) {
    return this.templateService.create(template);
  }

  @Post('/:id/version')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add new version to template' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ schema: zodToOpenapiResponse(TemplateDetailSchema) })
  addNewVersion(@Param('id') id: string) {
    return this.templateService.addNewVersion(id);
  }

  @Patch('/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update template by id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ schema: zodToOpenapiResponse(TemplateDetailSchema) })
  update(@Param('id') id: string, @Body() template: UpdateTemplateDto) {
    return this.templateService.update(id, template);
  }

  @Delete('/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete template by id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ schema: zodToOpenapiResponse(TemplateDetailSchema) })
  delete(@Param('id') id: string) {
    return this.templateService.delete(id);
  }
}
