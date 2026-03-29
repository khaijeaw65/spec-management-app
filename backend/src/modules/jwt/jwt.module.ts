import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigModule } from 'src/providers/config/jwt/config.module';
import { JwtConfigService } from 'src/providers/config/jwt/config.service';
import { IInternalJwtService } from './interface/jwt.interface';
import { InternalJwtService } from './jwt.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [JwtConfigModule],
      inject: [JwtConfigService],
      useFactory: (jwtConfigService: JwtConfigService) => ({
        secret: jwtConfigService.secret,
        signOptions: {
          expiresIn: jwtConfigService.accessTokenExpiresIn,
        },
      }),
    }),
  ],
  providers: [
    {
      provide: IInternalJwtService,
      useClass: InternalJwtService,
    },
  ],
  exports: [IInternalJwtService],
})
export class InternalJwtModule {}
