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
  UpdateTemplateSchema,
} from '@spec-app/schemas';
import {
  zodToOpenapi,
  zodToOpenapiResponse,
} from '../../swagger/zod-to-openapi';

@ApiTags('Template')
@Controller('templates')
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
  @ApiBody({
    schema: zodToOpenapi(CreateTemplateSchema, {
      name: 'Retail Order Management Template',
      description:
        'Standard sections for capturing functional and non-functional requirements from MOM workshops with stakeholders.',
      language: 'EN',
      sections: [
        {
          title: 'Business objectives',
          description:
            'Goals, KPIs, and success criteria the product must achieve.',
          order: 0,
        },
        {
          title: 'Scope and exclusions',
          description:
            'In-scope capabilities and items explicitly out of scope for this release.',
          order: 1,
        },
        {
          title: 'Integration points',
          description:
            'ERP, payment providers, shipping carriers, and third-party APIs.',
          order: 2,
        },
      ],
    }),
  })
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
  @ApiBody({
    schema: zodToOpenapi(UpdateTemplateSchema, {
      id: '550e8400-e29b-41d4-a716-446655440000',
      versionId: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Retail Order Management Template',
      description:
        'Updated after stakeholder review: clarified inventory sync and return-handling flows.',
      language: 'TH',
      sections: [
        {
          title: 'วัตถุประสงค์ทางธุรกิจ',
          description:
            'เป้าหมาย ตัวชี้วัดความสำเร็จ และเกณฑ์ความสำเร็จที่ตกลงในการประชุม',
          order: 0,
        },
        {
          title: 'ขอบเขตและข้อยกเว้น',
          description:
            'ความสามารถที่อยู่ในขอบเขตและรายการที่ตัดออกจากเวอร์ชันนี้อย่างชัดเจน',
          order: 1,
        },
      ],
    }),
  })
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
