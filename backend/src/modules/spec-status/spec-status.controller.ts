import { Controller, Get } from '@nestjs/common';
import { SpecStatusService } from './spec-status.service';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SpecStatusSchema, SpecStatusDto } from '@spec-app/schemas';
import { zodToOpenapiResponse } from 'src/swagger/zod-to-openapi';
import { z } from 'zod';

@ApiTags('Spec Status')
@Controller('spec-statuses')
export class SpecStatusController {
  constructor(private readonly specStatusService: SpecStatusService) {}

  @Get()
  @ApiOperation({ summary: 'Get all spec statuses' })
  @ApiOkResponse({ schema: zodToOpenapiResponse(z.array(SpecStatusSchema)) })
  async getStatuses(): Promise<SpecStatusDto[]> {
    return this.specStatusService.getStatuses();
  }
}
