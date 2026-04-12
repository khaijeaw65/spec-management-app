import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MockAuthService } from './mocks/auth.service.mock';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: MockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useClass: MockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(
      AuthService,
    ) as unknown as MockAuthService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return a login response', async () => {
      const loginResponse = await controller.login({
        email: 'test@test.com',
        password: 'password',
      });
      expect(loginResponse).toBeDefined();
    });
  });

  describe('refresh', () => {
    it('should return a refresh response', async () => {
      const refreshResponse = await controller.refresh({
        refreshToken: 'mock-refresh-token',
      });
      expect(refreshResponse).toBeDefined();
    });
  });

  describe('register', () => {
    it('should return a register response', async () => {
      const registerResponse = await controller.register({
        email: 'test@test.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
      });
      expect(registerResponse).toBeDefined();
    });

    it('should throw an error if user already exists', async () => {
      authService.register.mockRejectedValueOnce(
        new BadRequestException('Email already in use'),
      );
      await expect(
        controller.register({
          email: 'test@test.com',
          password: 'password',
          firstName: 'Test',
          lastName: 'User',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProfile', () => {
    it('should return a profile response', async () => {
      authService.getProfile.mockResolvedValue({
        id: 'mock-id',
        email: 'test@test.com',
        name: 'Test User',
      });
      const profile = await controller.getProfile({
        id: 'mock-id',
        email: 'test@test.com',
        name: 'Test User',
      });
      expect(profile).toBeDefined();
    });

    it('should throw an error if user not found', async () => {
      authService.getProfile.mockRejectedValueOnce(
        new UnauthorizedException('User not found'),
      );
      await expect(
        controller.getProfile({
          id: 'mock-id',
          name: 'Test User',
          email: 'test@test.com',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
