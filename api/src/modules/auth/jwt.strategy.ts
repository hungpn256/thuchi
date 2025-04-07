import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('ACCESS_TOKEN_SECRET_KEY'),
    });
  }

  async validate(payload: any) {
    console.log('🚀 JWT Strategy - Request Headers:', payload.headers);
    console.log('🚀 JWT Strategy - Token Payload:', payload);

    if (!payload || !payload.id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return { id: payload.id };
  }
}
