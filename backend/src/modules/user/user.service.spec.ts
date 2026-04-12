import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { IUserRepository } from '../repositories/user/user.repository.interface';
import { UserRepositoryMock } from '../repositories/user/user.repository.mock';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepositoryMock;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: IUserRepository, useClass: UserRepositoryMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<IUserRepository>(
      IUserRepository,
    ) as UserRepositoryMock;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getById', () => {
    it('should return a user', async () => {
      const user = await service.getById('1');
      expect(user).toBeDefined();
    });

    it('should return null if user not found', async () => {
      userRepository.findById.mockReturnValue(null);
      const user = await service.getById('1');
      expect(user).toBeNull();
    });
  });

  describe('getByEmail', () => {
    it('should return a user', async () => {
      const user = await service.getByEmail('test@test.com');
      expect(user).toBeDefined();
    });
  });

  describe('getByEmailWithPassword', () => {
    it('should return a user', async () => {
      const user = await service.getByEmailWithPassword('test@test.com');
      expect(user).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      userRepository.findByEmail.mockReturnValue(null);

      const user = await service.create({
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'Test',
        password: 'password',
      });
      expect(user).toBeDefined();
    });

    it('should throw an error if user already exists', async () => {
      userRepository.findByEmail.mockReturnValue({
        id: '1',
        email: 'test@test.com',
      });
      await expect(
        service.create({
          email: 'test@test.com',
          firstName: 'Test',
          lastName: 'Test',
          password: 'password',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      await expect(
        service.update('1', {
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
        service.update('1', {
          email: 'test@test.com',
          firstName: 'Test',
          lastName: 'Test',
          password: 'password',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      await expect(service.delete('1')).resolves.not.toThrow();
    });

    it('should throw an error if user not found', async () => {
      userRepository.findById.mockReturnValue(null);
      await expect(service.delete('1')).rejects.toThrow(NotFoundException);
    });
  });
});
