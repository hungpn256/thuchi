import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '@/shared/services/prisma/prisma.service';
import { user } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

interface TokenPayload {
  id: number;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private client: OAuth2Client;
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.client = new OAuth2Client({
      clientId: this.configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: this.configService.get('GOOGLE_CLIENT_SECRET'),
      redirectUri: this.configService.get('GOOGLE_CALLBACK_URL'),
    });
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      // Tìm user theo email
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (!user) {
        return null;
      }

      // Kiểm tra nếu người dùng đăng nhập bằng Google
      if (!user.password) {
        return null;
      }

      // Kiểm tra mật khẩu
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error validating user:', error);
      return null;
    }
  }

  private async generateTokens(payload: TokenPayload): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('ACCESS_TOKEN_SECRET_KEY'),
        expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET_KEY'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRATION'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(user: user) {
    const payload = { id: user.id };
    const tokens = await this.generateTokens(payload);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: user,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = await this.jwtService.verifyAsync<TokenPayload>(refreshToken, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET_KEY'),
      });

      // Check if user exists
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const tokens = await this.generateTokens({ id: user.id });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(registerDto: RegisterDto) {
    // Check if user with this email already exists
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

    // Create new user
    const newUser = await this.prismaService.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
      },
    });

    // Return user with access token
    return this.login(newUser);
  }

  async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) throw new UnauthorizedException('Invalid token');

      let user = await this.prismaService.user.findUnique({ where: { email: payload.email } });
      if (!user) {
        user = await this.prismaService.user.create({
          data: {
            email: payload.email,
            name: payload.name,
            googleId: payload.sub,
          },
        });
      }

      return this.login(user);
    } catch (error) {
      console.log('🚀 ~ AuthService ~ verifyGoogleToken ~ error:', error);
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  async getLinkLoginGoogle() {
    return this.client.generateAuthUrl({
      scope: ['email', 'profile', 'openid'],
      redirect_uri: this.configService.get('GOOGLE_CALLBACK_URL'),
    });
  }

  async handleGoogleCallback(code: string) {
    try {
      const { tokens } = await this.client.getToken({ code });
      const idToken = tokens.id_token;

      if (!idToken) {
        throw new Error('Không lấy được idToken');
      }

      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid idToken');
      }

      return {
        googleId: payload['sub'],
        email: payload['email'],
        name: payload['name'],
        picture: payload['picture'],
        idToken,
        accessToken: tokens.access_token,
      };
    } catch (error) {
      throw new Error(`Lỗi khi xử lý callback: ${error}`);
    }
  }

  async findUserById(id: number): Promise<user | null> {
    return this.prismaService.user.findUnique({ where: { id } });
  }

  /**
   * Integrate device token with login response for push notification support
   * This method is used to login with a device token
   */
  async loginWithDevice(
    user: user,
    deviceInfo?: {
      deviceId: string;
      token: string;
      deviceType: string;
      deviceName?: string;
      deviceModel?: string;
      osVersion?: string;
      appVersion?: string;
    },
  ) {
    // Generate tokens for authentication
    const authResult = await this.login(user);

    // If device info is provided, register the device for push notifications
    if (deviceInfo) {
      await this.prismaService.device_token.upsert({
        where: {
          userId_deviceId: {
            userId: user.id,
            deviceId: deviceInfo.deviceId,
          },
        },
        update: {
          token: deviceInfo.token,
          deviceType: deviceInfo.deviceType,
          deviceName: deviceInfo.deviceName,
          deviceModel: deviceInfo.deviceModel,
          osVersion: deviceInfo.osVersion,
          appVersion: deviceInfo.appVersion,
          lastActiveAt: new Date(),
          updatedAt: new Date(),
        },
        create: {
          userId: user.id,
          deviceId: deviceInfo.deviceId,
          token: deviceInfo.token,
          deviceType: deviceInfo.deviceType,
          deviceName: deviceInfo.deviceName,
          deviceModel: deviceInfo.deviceModel,
          osVersion: deviceInfo.osVersion,
          appVersion: deviceInfo.appVersion,
        },
      });
    }

    return authResult;
  }
}
