import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { CreateSubscriptionDto } from './dto/subscription.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  @Get('vapid-public-key')
  @ApiOperation({ summary: 'Get VAPID public key for push notifications' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns the VAPID public key' })
  getVapidPublicKey() {
    const publicKey = this.configService.get<string>('PUBLIC_VAPID_KEY');
    if (!publicKey) {
      throw new BadRequestException('VAPID public key is not configured');
    }
    return { publicKey };
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe to push notifications' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Subscription created' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid subscription data' })
  async subscribe(@Req() req, @Body() subscriptionDto: CreateSubscriptionDto) {
    try {
      if (subscriptionDto.deviceType !== 'web') {
        throw new BadRequestException(
          'Invalid device type. Must be "web" for web push notifications',
        );
      }
      const userId = req.user.id;
      return await this.notificationsService.subscribe(userId, subscriptionDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to subscribe: ${error.message}`);
    }
  }

  @Delete('unsubscribe/:deviceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unsubscribe from push notifications' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Subscription deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Subscription not found' })
  async unsubscribe(@Req() req, @Param('deviceId') deviceId: string) {
    try {
      const userId = req.user.id;
      return await this.notificationsService.unsubscribe(userId, deviceId);
    } catch (error) {
      throw new NotFoundException(`Subscription not found: ${error.message}`);
    }
  }

  @Post('send-to-me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a test notification to the current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification sent' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to send notification' })
  @HttpCode(HttpStatus.OK)
  async sendToMe(@Req() req, @Body() notificationDto: SendNotificationDto) {
    try {
      const userId = req.user.id;
      const result = await this.notificationsService.sendNotificationToUser(
        userId,
        notificationDto,
      );
      if (result.sent === 0) {
        throw new BadRequestException('No active web subscriptions found for the user');
      }
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to send notification: ${error.message}`);
    }
  }

  @Post('send-to-user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a notification to a specific user (admin only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification sent' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to send notification' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @HttpCode(HttpStatus.OK)
  async sendToUser(@Param('userId') userId: string, @Body() notificationDto: SendNotificationDto) {
    try {
      // Here you might want to add an admin check
      const result = await this.notificationsService.sendNotificationToUser(
        parseInt(userId, 10),
        notificationDto,
      );
      if (result.sent === 0) {
        throw new BadRequestException('No active web subscriptions found for the user');
      }
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to send notification: ${error.message}`);
    }
  }

  @Post('broadcast')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a notification to all subscribed users (admin only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Broadcast sent' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to send broadcast' })
  @HttpCode(HttpStatus.OK)
  async broadcast(@Body() notificationDto: SendNotificationDto) {
    try {
      // Here you might want to add an admin check
      const result = await this.notificationsService.sendBroadcastNotification(notificationDto);
      if (result.sent === 0) {
        throw new BadRequestException('No active web subscriptions found');
      }
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to send broadcast: ${error.message}`);
    }
  }
}
