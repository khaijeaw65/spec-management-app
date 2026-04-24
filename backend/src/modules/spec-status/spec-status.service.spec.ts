import { Test, TestingModule } from '@nestjs/testing';
import { SpecStatusService } from './spec-status.service';

describe('SpecStatusService', () => {
  let service: SpecStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpecStatusService],
    }).compile();

    service = module.get<SpecStatusService>(SpecStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
