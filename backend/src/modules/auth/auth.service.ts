import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IInternalJwtService } from '../jwt/interface/jwt.interface';
import { UserService } from '../user/user.service';
import type { LoginDto, RegisterDto } from '@spec-app/schemas';
import bcrypt from 'bcrypt';
import { JwtConfigService } from 'src/providers/config/jwt/config.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly internalJwtService: IInternalJwtService,
    private readonly jwtConfigService: JwtConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userService.getUserByEmailWithPassword(
      loginDto.email,
    );

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

    const accessToken = this.internalJwtService.sign({
      name: user.firstName + ' ' + user.lastName,
      email: user.email,
      sub: user?.id,
    });

    const refreshToken = this.internalJwtService.sign(
      {
        sub: user?.id,
      },
      { expiresIn: this.jwtConfigService.refreshTokenExpiresIn },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user?.id,
        name: user?.firstName + ' ' + user?.lastName,
        email: user?.email,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const user = await this.userService.createUser(registerDto);

    return user;
  }
}
