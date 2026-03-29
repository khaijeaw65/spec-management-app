import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  type AuthUserDto,
  LoginResponseSchema,
  LoginSchema,
  type LoginDto,
  type RegisterDto,
  RegisterSchema,
} from '@spec-app/schemas';
import { Public } from 'src/decorators/public.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { zodToOpenapi, zodToOpenapiResponse } from 'src/swagger/zod-to-openapi';
import { AuthUser } from 'src/decorators/auth-user.decorator';

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
  getProfile(@AuthUser() user: AuthUserDto) {
    return user;
  }

  @Public()
  @Post('register')
  @ApiBody({ schema: zodToOpenapi(RegisterSchema) })
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }
}
