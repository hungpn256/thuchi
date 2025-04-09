import { Controller, Post, Body, UseGuards, Get, Query, HttpStatus, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginGoogleDto } from './dto/login-google.dto';
import { LoginDto } from './dto/login.dto';
import {
  BadRequestException,
  UnauthorizedException,
  ValidationException,
} from '@/shared/exceptions/app.exception';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Đăng nhập với username/password',
    description: 'API đăng nhập hệ thống sử dụng username và password',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Thông tin đăng nhập',
    examples: {
      example1: {
        value: {
          username: 'user@example.com',
          password: '123456',
        },
        summary: 'Basic Login Credentials',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đăng nhập thành công',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'user@example.com',
          name: 'John Doe',
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Thông tin đăng nhập không hợp lệ' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Sai username hoặc password' })
  async login(@Body() loginDto: LoginDto) {
    try {
      const user = await this.authService.validateUser(loginDto.username, loginDto.password);
      if (!user) {
        throw new UnauthorizedException('Invalid username or password');
      }
      return await this.authService.login(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Login failed', { error: error.message });
    }
  }

  @Post('login/google')
  @ApiOperation({
    summary: 'Đăng nhập với Google',
    description: 'API đăng nhập hệ thống sử dụng Google ID Token',
  })
  @ApiBody({
    type: LoginGoogleDto,
    description: 'Google ID Token',
    examples: {
      example1: {
        value: {
          idToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
        },
        summary: 'Google ID Token Example',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đăng nhập thành công',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'user@gmail.com',
          name: 'John Doe',
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Token không hợp lệ' })
  async loginByGoogle(@Body() loginDto: LoginGoogleDto) {
    try {
      if (!loginDto.idToken) {
        throw new ValidationException({ idToken: 'ID Token is required' });
      }
      const user = await this.authService.verifyGoogleToken(loginDto.idToken);
      if (!user) {
        throw new UnauthorizedException('Invalid Google token');
      }
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ValidationException) {
        throw error;
      }
      throw new BadRequestException('Google login failed', { error: error.message });
    }
  }

  @Get('login/google')
  @ApiOperation({
    summary: 'Lấy link đăng nhập Google',
    description: 'Trả về URL để redirect người dùng tới trang đăng nhập của Google',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'URL đăng nhập Google',
    schema: {
      example: {
        url: 'https://accounts.google.com/o/oauth2/v2/auth?...',
      },
    },
  })
  async loginByGoogleRedirect() {
    try {
      const url = await this.authService.getLinkLoginGoogle();
      return { url };
    } catch (error) {
      throw new BadRequestException('Failed to get Google login URL', { error: error.message });
    }
  }

  @Get('login/google/callback')
  @ApiOperation({
    summary: 'Callback URL cho Google OAuth',
    description: 'API nhận callback từ Google sau khi người dùng đăng nhập thành công',
  })
  @ApiQuery({
    name: 'code',
    required: true,
    description: 'Authorization code từ Google',
    example: '4/0AfJohXnC4Zf...',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xử lý callback thành công',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'user@gmail.com',
          name: 'John Doe',
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Code không hợp lệ' })
  async googleCallback(@Query('code') code: string) {
    try {
      if (!code) {
        throw new ValidationException({ code: 'Authorization code is required' });
      }
      const user = await this.authService.handleGoogleCallback(code);
      if (!user) {
        throw new UnauthorizedException('Invalid authorization code');
      }
      return await this.authService.verifyGoogleToken(user.idToken);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ValidationException) {
        throw error;
      }
      throw new BadRequestException('Google callback failed', { error: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({
    summary: 'Lấy thông tin profile',
    description: 'API được bảo vệ, yêu cầu token để truy cập',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin profile thành công',
    schema: {
      example: {
        id: 1,
        email: 'user@example.com',
        name: 'John Doe',
      },
    },
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Token không hợp lệ hoặc hết hạn' })
  async getProfile(@Request() req) {
    try {
      const user = await this.authService.findUserById(req.user.id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Failed to get profile', { error: error.message });
    }
  }
}
