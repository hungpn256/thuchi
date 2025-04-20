import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '@/shared/services/prisma/prisma.service';
import { user } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

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

  async login(user: user) {
    const payload = { id: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
      user: user,
    };
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
}
