import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  type AuthUserDto,
  LoginResponseSchema,
  LoginSchema,
  type LoginDto,
  RefreshTokenRequestSchema,
  RefreshTokenResponseSchema,
  type RefreshTokenDto,
  type RegisterDto,
  RegisterSchema,
  RegisterResponseSchema,
  AuthUserSchema,
} from '@spec-app/schemas';
import { Public } from '../../decorators/public.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  zodToOpenapi,
  zodToOpenapiResponse,
} from '../../swagger/zod-to-openapi';
import { AuthUser } from '../../decorators/auth-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ schema: zodToOpenapi(LoginSchema) })
  @ApiCreatedResponse({ schema: zodToOpenapiResponse(LoginResponseSchema) })
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh Profile' })
  @ApiOkResponse({ schema: zodToOpenapiResponse(AuthUserSchema) })
  getProfile(@AuthUser() user: AuthUserDto) {
    return this.authService.getProfile(user);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiBody({ schema: zodToOpenapi(RefreshTokenRequestSchema) })
  @ApiOkResponse({ schema: zodToOpenapiResponse(RefreshTokenResponseSchema) })
  refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refresh(body);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register' })
  @ApiBody({ schema: zodToOpenapi(RegisterSchema) })
  @ApiCreatedResponse({ schema: zodToOpenapiResponse(RegisterResponseSchema) })
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }
}
