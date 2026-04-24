import {
  LoginDto,
  LoginResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  RegisterResponseDto,
  RegisterDto,
  AuthUserDto,
} from '@spec-app/schemas';

export abstract class IAuthService {
  abstract login(loginDto: LoginDto): Promise<LoginResponseDto>;
  abstract refresh(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto>;
  abstract register(registerDto: RegisterDto): Promise<RegisterResponseDto>;
  abstract getProfile(user: AuthUserDto): Promise<AuthUserDto>;
}
