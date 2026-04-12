import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AuthUserDto } from '@spec-app/schemas';
import { JwtConfigService } from '../../providers/config/jwt/config.service';
import { UserService } from '../user/user.service';
import { RequestContextService } from '../../contexts/request/request.context';

type AccessTokenPayload = {
  sub: string;
  email: string;
  name: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly jwtConfigService: JwtConfigService,
    private readonly userService: UserService,
    private readonly requestContextService: RequestContextService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfigService.accessTokenSecret,
    });
  }

  async validate(payload: AccessTokenPayload): Promise<AuthUserDto> {
    const user = await this.userService.getById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    this.requestContextService.userId = user.id;

    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    };
  }
}
