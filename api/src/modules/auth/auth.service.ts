import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '@/shared/services/prisma/prisma.service';
import {
  account,
  account_status,
  profile,
  profile_permission,
  profile_user_status,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { CreateProfileDto } from './dto/create-profile.dto';

interface TokenPayload {
  accountId: number;
  profileId: number;
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

  async validateUser(
    email: string,
    password: string,
  ): Promise<{ account: account; profile: profile } | null> {
    try {
      // Tìm user theo email
      const account = await this.prismaService.account.findUnique({
        where: { email },
        include: { profileUsers: { include: { profile: true } } },
      });

      if (!account) {
        return null;
      }

      // Kiểm tra nếu người dùng đăng nhập bằng Google
      if (!account.password) {
        return null;
      }

      // Kiểm tra mật khẩu
      const isPasswordValid = await bcrypt.compare(password, account.password);
      if (!isPasswordValid) {
        return null;
      }

      // Get the last profile associated with this account
      const profileUser = await this.prismaService.profile_user.findFirst({
        where: {
          accountId: account.id,
        },
        orderBy: {
          lastLogin: 'desc',
        },
        include: {
          profile: true,
        },
      });

      if (!profileUser) {
        return null;
      }

      // Update last login time
      await this.prismaService.profile_user.update({
        where: { id: profileUser.id },
        data: { lastLogin: new Date() },
      });

      return { account, profile: profileUser.profile };
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

  async login(account: account, profile: profile) {
    const payload = { accountId: account.id, profileId: profile.id };
    const tokens = await this.generateTokens(payload);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      account,
      profile,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = await this.jwtService.verifyAsync<TokenPayload>(refreshToken, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET_KEY'),
      });

      // Check if account exists
      const account = await this.prismaService.account.findUnique({
        where: { id: payload.accountId, status: account_status.ACTIVE },
      });

      if (!account) {
        throw new UnauthorizedException('Account not found');
      }

      // Generate new tokens
      const tokens = await this.generateTokens({
        accountId: payload.accountId,
        profileId: payload.profileId,
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(registerDto: RegisterDto) {
    // Check if user with this email already exists
    const existingUser = await this.prismaService.account.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

    // Create new user
    const newUser = await this.prismaService.account.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        profileUsers: {
          create: {
            permission: profile_permission.ADMIN,
            profile: {
              create: {
                name: registerDto.name,
              },
            },
          },
        },
      },
      include: { profileUsers: { include: { profile: true } } },
    });

    if (!newUser || !newUser.profileUsers[0]?.profile) {
      throw new Error('Failed to create user profile');
    }

    // Return user with access token
    return this.login(newUser, newUser.profileUsers[0].profile);
  }

  async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) throw new UnauthorizedException('Invalid token');

      let account = await this.prismaService.account.findUnique({
        where: { email: payload.email },
        include: { profileUsers: { include: { profile: true } } },
      });
      if (!account) {
        account = await this.prismaService.account.create({
          data: {
            email: payload.email,
            googleId: payload.sub,
            profileUsers: {
              create: {
                permission: profile_permission.ADMIN,
                profile: {
                  create: {
                    name: payload.name,
                  },
                },
              },
            },
          },
          include: { profileUsers: { include: { profile: true } } },
        });
      }

      return this.login(account, account.profileUsers[0].profile);
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

  async findAccountById(id: number): Promise<account | null> {
    return this.prismaService.account.findUnique({
      where: { id, status: account_status.ACTIVE },
      include: {
        profileUsers: { include: { profile: true }, where: { status: profile_user_status.ACTIVE } },
      },
    });
  }

  async findProfileById(id: number): Promise<profile | null> {
    return this.prismaService.profile.findUnique({
      where: { id },
      include: { profileUsers: true },
    });
  }

  /**
   * Integrate device token with login response for push notification support
   * This method is used to login with a device token
   */
  async loginWithDevice(
    account: account,
    profile: profile,
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
    const authResult = await this.login(account, profile);

    // If device info is provided, register the device for push notifications
    if (deviceInfo) {
      await this.prismaService.device_token.upsert({
        where: {
          accountId_deviceId: {
            accountId: account.id,
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
          accountId: account.id,
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

  async switchProfile(accountId: number, profileId: number) {
    // Check if profile exists and user has access to it
    const profileUser = await this.prismaService.profile_user.findFirst({
      where: {
        accountId,
        profileId,
        status: profile_user_status.ACTIVE,
      },
      include: {
        profile: true,
      },
    });

    if (!profileUser) {
      throw new BadRequestException('Profile không tồn tại hoặc bạn không có quyền truy cập');
    }

    // Update last login time for the profile
    await this.prismaService.profile_user.update({
      where: { id: profileUser.id },
      data: { lastLogin: new Date() },
    });

    // Generate new access token with the new profile
    const account = await this.findAccountById(accountId);

    if (!account) {
      throw new UnauthorizedException('Account không tồn tại');
    }

    return this.login(account, profileUser.profile);
  }

  async createProfile(accountId: number, createProfileDto: CreateProfileDto) {
    // Create new profile and link it to the account
    const profileUser = await this.prismaService.profile_user.create({
      data: {
        account: {
          connect: { id: accountId },
        },
        profile: {
          create: {
            name: createProfileDto.name,
          },
        },
        status: profile_user_status.ACTIVE,
      },
      include: {
        profile: true,
      },
    });

    if (!profileUser || !profileUser.profile) {
      throw new BadRequestException('Failed to create profile');
    }

    // Return the new profile with tokens
    return profileUser.profile;
  }

  async getCurrentProfileUser(accountId: number, profileId: number) {
    return this.prismaService.profile_user.findFirst({
      where: {
        accountId,
        profileId,
        status: 'ACTIVE',
      },
      include: {
        profile: true,
      },
    });
  }
}
