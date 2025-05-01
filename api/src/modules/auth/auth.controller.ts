import { Controller, Post, Body, UseGuards, Get, Query, HttpStatus, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { LoginGoogleDto } from './dto/login-google.dto';
import { LoginDto } from './dto/login.dto';
import { BadRequestException, UnauthorizedException } from '@/shared/exceptions/app.exception';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleCallbackDto } from './dto/google-callback.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { DeviceService } from '../device/device.service';
import { LogoutDto } from './dto/logout.dto';
import { Profile } from '@/shared/decorators/profile.decorator';
import { Account } from '@/shared/decorators/account.decorator';
import { SwitchProfileDto } from './dto/switch-profile.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { account, profile } from '@prisma/client';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly deviceService: DeviceService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Đăng ký tài khoản mới',
    description: 'API đăng ký tài khoản mới với email và mật khẩu',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'Thông tin đăng ký',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đăng ký thành công',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'user@example.com',
          name: 'John Doe',
          createdAt: '2024-03-20T12:00:00Z',
          updatedAt: '2024-03-20T12:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Email đã được sử dụng hoặc thông tin đăng ký không hợp lệ',
  })
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Đăng ký thất bại', { error: error.message });
    }
  }

  @Post('login')
  @ApiOperation({
    summary: 'Đăng nhập với email/password',
    description: 'API đăng nhập hệ thống sử dụng email và password',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Thông tin đăng nhập',
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
          googleId: '123456789',
          avatar: 'https://example.com/avatar.jpg',
          createdAt: '2024-03-20T12:00:00Z',
          updatedAt: '2024-03-20T12:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Thông tin đăng nhập không hợp lệ' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Sai email hoặc password' })
  async login(@Body() loginDto: LoginDto) {
    try {
      const user = await this.authService.validateUser(loginDto.email, loginDto.password);
      if (!user) {
        throw new UnauthorizedException('Sai email hoặc mật khẩu');
      }
      return await this.authService.login(user.account, user.profile);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Đăng nhập thất bại', { error: error.message });
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
          googleId: '123456789',
          avatar: 'https://example.com/avatar.jpg',
          createdAt: '2024-03-20T12:00:00Z',
          updatedAt: '2024-03-20T12:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Token không hợp lệ' })
  async loginByGoogle(@Body() loginDto: LoginGoogleDto) {
    try {
      const user = await this.authService.verifyGoogleToken(loginDto.idToken);
      if (!user) {
        throw new UnauthorizedException('Token Google không hợp lệ');
      }
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Đăng nhập Google thất bại', { error: error.message });
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
          googleId: '123456789',
          avatar: 'https://example.com/avatar.jpg',
          createdAt: '2024-03-20T12:00:00Z',
          updatedAt: '2024-03-20T12:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Code không hợp lệ' })
  async googleCallback(@Query() query: GoogleCallbackDto) {
    try {
      const user = await this.authService.handleGoogleCallback(query.code);
      if (!user) {
        throw new UnauthorizedException('Mã xác thực không hợp lệ');
      }
      return await this.authService.verifyGoogleToken(user.idToken);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Xử lý callback Google thất bại', { error: error.message });
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
        googleId: '123456789',
        avatar: 'https://example.com/avatar.jpg',
        createdAt: '2024-03-20T12:00:00Z',
        updatedAt: '2024-03-20T12:00:00Z',
      },
    },
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Token không hợp lệ hoặc hết hạn' })
  async getProfile(@Account() account: account, @Profile() profile: profile) {
    try {
      if (!account || !profile) {
        throw new UnauthorizedException('Không tìm thấy người dùng');
      }
      return {
        account,
        profile,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Không thể lấy thông tin profile', { error: error.message });
    }
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'API để làm mới access token sử dụng refresh token',
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token được làm mới thành công',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'user@example.com',
          name: 'John Doe',
          createdAt: '2024-03-20T12:00:00Z',
          updatedAt: '2024-03-20T12:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Refresh token không hợp lệ hoặc đã hết hạn',
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      return await this.authService.refreshToken(refreshTokenDto.refreshToken);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Token refresh failed', { error: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({
    summary: 'Đăng xuất',
    description: 'Đăng xuất khỏi thiết bị hiện tại bằng cách xóa token thiết bị',
  })
  @ApiBody({
    type: LogoutDto,
    description: 'Thông tin thiết bị',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đăng xuất thành công',
    schema: {
      example: {
        message: 'Đăng xuất thành công',
      },
    },
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Token không hợp lệ hoặc hết hạn' })
  async logout(@Request() req, @Body() logoutDto: LogoutDto) {
    try {
      if (logoutDto?.deviceId) {
        // Logout from specific device
        await this.deviceService.deleteDevice(req.account.id, logoutDto.deviceId);
        return { message: 'Đăng xuất thành công' };
      } else {
        // Logout from all devices
        const result = await this.deviceService.deleteAllUserDevices(req.account.id);
        return {
          message: 'Đăng xuất thành công khỏi tất cả thiết bị',
          count: result.count,
        };
      }
    } catch (error) {
      throw new BadRequestException('Đăng xuất thất bại', { error: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('switch-profile')
  @ApiOperation({
    summary: 'Chuyển đổi profile',
    description: 'API được bảo vệ, yêu cầu token để truy cập',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chuyển đổi profile thành công',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Token không hợp lệ hoặc hết hạn' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Profile không tồn tại hoặc không có quyền truy cập',
  })
  async switchProfile(@Account() account: account, @Body() switchProfileDto: SwitchProfileDto) {
    try {
      return await this.authService.switchProfile(account.id, switchProfileDto.profileId);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Không thể chuyển đổi profile', { error: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('profiles')
  @ApiOperation({
    summary: 'Tạo profile mới',
    description: 'API được bảo vệ, yêu cầu token để truy cập',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tạo profile thành công',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Token không hợp lệ hoặc hết hạn' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' })
  async createProfile(@Account() account: account, @Body() createProfileDto: CreateProfileDto) {
    try {
      return await this.authService.createProfile(account.id, createProfileDto);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Không thể tạo profile mới', { error: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('current-profile-user')
  @ApiOperation({
    summary: 'Lấy thông tin profile user hiện tại',
    description: 'Trả về thông tin profile user ứng với account và profile hiện tại',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin profile user thành công',
    schema: {
      example: {
        id: 1,
        profileId: 1,
        accountId: 1,
        permission: 'ADMIN',
        profile: {
          id: 1,
          name: 'Profile 1',
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy profile user' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Token không hợp lệ hoặc hết hạn' })
  async getCurrentProfileUser(@Account('id') accountId: number, @Profile('id') profileId: number) {
    if (!accountId || !profileId) {
      throw new UnauthorizedException('Không xác định được account hoặc profile');
    }
    const profileUser = await this.authService.getCurrentProfileUser(accountId, profileId);
    if (!profileUser) {
      throw new BadRequestException('Không tìm thấy profile user');
    }
    return profileUser;
  }
}
