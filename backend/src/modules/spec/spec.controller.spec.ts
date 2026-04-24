import { Test, TestingModule } from '@nestjs/testing';
import { SpecController } from './spec.controller';
import { SpecService } from './spec.service';

describe('SpecController', () => {
  let controller: SpecController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpecController],
      providers: [SpecService],
    }).compile();

    controller = module.get<SpecController>(SpecController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
