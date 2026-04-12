import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IInternalJwtService } from '../jwt/interfaces/jwt.interface';
import { UserService } from '../user/user.service';
import type {
  AuthUserDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  RegisterResponseDto,
} from '@spec-app/schemas';
import bcrypt from 'bcrypt';
import { JwtConfigService } from '../../providers/config/jwt/config.service';
import { IAuthService } from './interfaces/auth.service.interface';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly userService: UserService,
    private readonly internalJwtService: IInternalJwtService,
    private readonly jwtConfigService: JwtConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userService.getByEmailWithPassword(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueAuthTokens(user);
  }

  async refresh(dto: RefreshTokenDto) {
    const { sub: userId } = this.validateRefreshToken(dto.refreshToken);

    const user = await this.validateUser(userId);

    return this.issueAuthTokens(user);
  }

  async getProfile(user: AuthUserDto) {
    const existingUser = await this.userService.getById(user.id);
    if (!existingUser) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: existingUser.id,
      name: `${existingUser.firstName} ${existingUser.lastName}`,
      email: existingUser.email,
    };
  }

  private validateRefreshToken(refreshToken: string) {
    try {
      return this.internalJwtService.verify<{ sub: string }>(refreshToken, {
        secret: this.jwtConfigService.refreshTokenSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async validateUser(userId: string) {
    const user = await this.userService.getById(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return user;
  }

  private issueAuthTokens(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  }) {
    const accessToken = this.internalJwtService.sign({
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      sub: user.id,
    });

    const refreshToken = this.internalJwtService.sign(
      { sub: user.id },
      {
        secret: this.jwtConfigService.refreshTokenSecret,
        expiresIn: this.jwtConfigService.refreshTokenExpiresIn,
      },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const user = await this.userService.create(registerDto);

    return this.issueAuthTokens(user);
  }
}
