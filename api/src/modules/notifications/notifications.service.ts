import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/services/prisma/prisma.service';
import * as webpush from 'web-push';
import { CreateSubscriptionDto } from './dto/subscription.dto';
import { SendNotificationDto } from './dto/send-notification.dto';

interface WebPushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private isInitialized = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const publicVapidKey = this.configService.get<string>('PUBLIC_VAPID_KEY');
    const privateVapidKey = this.configService.get<string>('PRIVATE_VAPID_KEY');
    const vapidSubject = this.configService.get<string>('VAPID_SUBJECT');

    if (!publicVapidKey || !privateVapidKey) {
      this.logger.error('VAPID keys are not set. Push notifications will not work.');
      return;
    }

    if (!vapidSubject) {
      this.logger.error('VAPID_SUBJECT is not set. Using default email.');
    }

    try {
      webpush.setVapidDetails(
        `mailto:${vapidSubject || 'example@example.com'}`,
        publicVapidKey,
        privateVapidKey,
      );
      this.isInitialized = true;
      this.logger.log('Web Push initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize Web Push: ${error.message}`, error.stack);
      throw error;
    }
  }

  private checkInitialization() {
    if (!this.isInitialized) {
      throw new Error('Push notification service is not properly initialized');
    }
  }

  private validateSubscription(subscription: WebPushSubscription): boolean {
    if (!subscription.endpoint || typeof subscription.endpoint !== 'string') {
      throw new Error('Invalid subscription endpoint');
    }

    if (!subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      throw new Error('Invalid subscription keys');
    }

    return true;
  }

  async subscribe(userId: number, subscriptionDto: CreateSubscriptionDto) {
    this.checkInitialization();
    const { deviceId, deviceType, deviceName, deviceModel, osVersion, appVersion, endpoint, keys } =
      subscriptionDto;

    try {
      // Convert the subscription to the correct format
      const subscription: WebPushSubscription = {
        endpoint,
        // Convert string to number or null for expirationTime
        expirationTime: subscriptionDto.expirationTime
          ? new Date(subscriptionDto.expirationTime).getTime()
          : null,
        keys,
      };

      // Validate the subscription
      this.validateSubscription(subscription);

      // Store the token in a JSON field for web push subscriptions
      const token = JSON.stringify(subscription);

      // Upsert the device token (create or update if exists)
      const deviceToken = await this.prisma.device_token.upsert({
        where: {
          userId_deviceId: {
            userId,
            deviceId,
          },
        },
        update: {
          token,
          deviceType,
          deviceName,
          deviceModel,
          osVersion,
          appVersion,
          lastActiveAt: new Date(),
        },
        create: {
          userId,
          deviceId,
          token,
          deviceType,
          deviceName,
          deviceModel,
          osVersion,
          appVersion,
        },
      });

      return deviceToken;
    } catch (error) {
      this.logger.error(`Failed to subscribe device: ${error.message}`, error.stack);
      throw error;
    }
  }

  async unsubscribe(userId: number, deviceId: string) {
    this.checkInitialization();
    try {
      return await this.prisma.device_token.delete({
        where: {
          userId_deviceId: {
            userId,
            deviceId,
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to unsubscribe device: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendNotification(
    subscription: WebPushSubscription,
    notificationPayload: SendNotificationDto,
    options: webpush.RequestOptions = {},
  ) {
    this.checkInitialization();
    try {
      // Validate the subscription
      this.validateSubscription(subscription);

      // Prepare the payload
      const payload = JSON.stringify({
        title: notificationPayload.title,
        body: notificationPayload.body,
        icon: notificationPayload.icon,
        badge: notificationPayload.badge,
        image: notificationPayload.image,
        data: {
          url: notificationPayload.url,
          ...notificationPayload.data,
        },
        actions: notificationPayload.actions,
        tag: notificationPayload.tag,
      });

      // Set TTL if provided
      if (notificationPayload.ttl) {
        options.TTL = notificationPayload.ttl;
      }

      // Send the notification
      const result = await webpush.sendNotification(subscription, payload, options);
      this.logger.log(`Push notification sent successfully: ${result.statusCode}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`, error.stack);

      // Check if subscription has expired
      if (error.statusCode === 410) {
        this.logger.warn('Subscription has expired or is no longer valid');
        // Remove the expired subscription
        try {
          await this.removeExpiredSubscription(subscription.endpoint);
        } catch (cleanupError) {
          this.logger.error(`Failed to remove expired subscription: ${cleanupError.message}`);
        }
      }

      throw error;
    }
  }

  private async removeExpiredSubscription(endpoint: string) {
    try {
      await this.prisma.device_token.deleteMany({
        where: {
          deviceType: 'web',
          token: { contains: endpoint },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to remove expired subscription: ${error.message}`);
      throw error;
    }
  }

  async sendNotificationToUser(userId: number, notificationPayload: SendNotificationDto) {
    this.checkInitialization();
    try {
      // Get all active web device tokens for the user
      const deviceTokens = await this.prisma.device_token.findMany({
        where: {
          userId,
          deviceType: 'web',
        },
      });

      if (!deviceTokens.length) {
        this.logger.warn(`No web devices found for user ${userId}`);
        return { sent: 0, failed: 0 };
      }

      let sent = 0;
      let failed = 0;

      // Send notification to each device
      for (const device of deviceTokens) {
        try {
          // Parse the token to get the subscription object
          const subscription = JSON.parse(device.token) as WebPushSubscription;
          await this.sendNotification(subscription, notificationPayload);
          sent++;
        } catch (error) {
          failed++;
          this.logger.error(
            `Failed to send notification to device ${device.deviceId} for user ${userId}: ${error.message}`,
            error.stack,
          );
        }
      }

      return { sent, failed };
    } catch (error) {
      this.logger.error(
        `Failed to send notification to user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async sendBroadcastNotification(notificationPayload: SendNotificationDto) {
    this.checkInitialization();
    // Get all active web device tokens
    const deviceTokens = await this.prisma.device_token.findMany({
      where: {
        deviceType: 'web',
      },
    });

    if (!deviceTokens.length) {
      this.logger.warn('No web devices found for broadcast');
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    // Send notification to each device
    for (const device of deviceTokens) {
      try {
        const subscription = JSON.parse(device.token) as WebPushSubscription;
        await this.sendNotification(subscription, notificationPayload);
        sent++;
      } catch (error) {
        failed++;
        this.logger.error(
          `Failed to send broadcast notification to device ${device.deviceId}: ${error.message}`,
          error.stack,
        );
      }
    }

    return { sent, failed };
  }
}
