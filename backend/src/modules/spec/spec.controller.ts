import { Controller } from '@nestjs/common';
import { SpecService } from './spec.service';

@Controller('spec')
export class SpecController {
  constructor(private readonly specService: SpecService) {}
}
