import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MockUserRepository } from '../repositories/user/user.repository.mock';
import { IUserRepository } from '../repositories/user/user.repository.interface';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userRepository: MockUserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        { provide: IUserRepository, useClass: MockUserRepository },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userRepository = module.get<IUserRepository>(
      IUserRepository,
    ) as MockUserRepository;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getById', () => {
    it('should return a user', async () => {
      const user = await controller.getById('1');
      expect(user).toBeDefined();
    });
  });

  describe('updateById', () => {
    it('should update a user', async () => {
      await expect(
        controller.updateById('1', {
          email: 'test@test.com',
          firstName: 'Test',
          lastName: 'Test',
          password: 'password',
        }),
      ).resolves.not.toThrow();
    });

    it('should throw an error if user not found', async () => {
      userRepository.findById.mockReturnValue(null);
      await expect(
        controller.updateById('1', {
          email: 'test@test.com',
          firstName: 'Test',
          lastName: 'Test',
          password: 'password',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteById', () => {
    it('should delete a user', async () => {
      await expect(controller.deleteById('1')).resolves.not.toThrow();
    });

    it('should throw an error if user not found', async () => {
      userRepository.findById.mockReturnValue(null);
      await expect(controller.deleteById('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
