import { Controller, Post } from '@nestjs/common';
import { SpecService } from './spec.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';

@ApiTags('Spec')
@Controller('spec')
export class SpecController {
  constructor(private readonly specService: SpecService) {}

  @Public()
  @Post('generate')
  async generateSpec() {
    return this.specService.generateSpec();
  }
}
