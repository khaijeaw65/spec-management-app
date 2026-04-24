import { Test, TestingModule } from '@nestjs/testing';
import { SpecStatusController } from './spec-status.controller';
import { SpecStatusService } from './spec-status.service';

describe('SpecStatusController', () => {
  let controller: SpecStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpecStatusController],
      providers: [SpecStatusService],
    }).compile();

    controller = module.get<SpecStatusController>(SpecStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
