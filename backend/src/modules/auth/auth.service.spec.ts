import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { IInternalJwtService } from '../jwt/interfaces/jwt.interface';
import { JwtServiceMock } from '../jwt/mocks/jwt.service.mock';
import { UserService } from '../user/user.service';
import { UserServiceMock } from '../user/mocks/user.service.mock';
import { JwtConfigService } from '../../providers/config/jwt/config.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserServiceMock;

  beforeEach(async () => {
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useClass: UserServiceMock,
        },
        {
          provide: IInternalJwtService,
          useClass: JwtServiceMock,
        },
        {
          provide: JwtConfigService,
          useValue: {
            accessTokenSecret: 'mock-access-token-secret',
            refreshTokenSecret: 'mock-refresh-token-secret',
            accessTokenExpiresIn: '1h',
            refreshTokenExpiresIn: '1h',
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(
      UserService,
    ) as unknown as UserServiceMock;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return a login response', async () => {
      const loginResponse = await service.login({
        email: 'test@test.com',
        password: 'password',
      });
      expect(loginResponse).toBeDefined();
    });

    it('should throw an error if user not found', async () => {
      userService.getByEmailWithPassword.mockResolvedValue(null);
      await expect(
        service.login({ email: 'test@test.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw an error if password is incorrect', async () => {
      jest.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);
      userService.getByEmailWithPassword.mockResolvedValue({
        id: 'mock-id',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'incorrect-password',
        isActive: true,
      });
      await expect(
        service.login({ email: 'test@test.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should return a refresh response', async () => {
      const refreshResponse = await service.refresh({
        refreshToken: 'mock-refresh-token',
      });
      expect(refreshResponse).toBeDefined();
    });
  });

  describe('register', () => {
    it('should return a register response', async () => {
      const registerResponse = await service.register({
        email: 'test@test.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
      });
      expect(registerResponse).toBeDefined();
    });

    it('should throw an error if user already exists', async () => {
      userService.create.mockRejectedValueOnce(
        new BadRequestException('Email already in use'),
      );
      await expect(
        service.register({
          email: 'test@test.com',
          password: 'password',
          firstName: 'Test',
          lastName: 'User',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
