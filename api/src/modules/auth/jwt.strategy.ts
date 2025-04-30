import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/services/prisma/prisma.service';
import { AuthService } from './auth.service';

interface JwtPayload {
  accountId: number;
  email: string;
  iat?: number;
  exp?: number;
  profileId?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('ACCESS_TOKEN_SECRET_KEY'),
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload || !payload.accountId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Get user from database to ensure they still exist and get latest data
    const [account, profile] = await Promise.all([
      this.authService.findAccountById(payload.accountId),
      this.authService.findProfileById(payload.profileId),
    ]);

    if (!account || !profile) {
      throw new UnauthorizedException('User no longer exists');
    }

    return { account, profile };
  }
}
