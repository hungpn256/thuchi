import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@/shared/services/prisma/prisma.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { SendBulkNotificationDto } from '@/modules/notifications/dto/send-notification.dto';
import { DateTime } from 'luxon';

interface ProfileWithUsers {
  id: number;
  name: string;
  profileUsers: { accountId: number }[];
}

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // 7AM Vietnam cron: notify profiles with no transactions yesterday
  @Cron('0 0 7 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async notifyProfilesWithoutTransactions(): Promise<void> {
    try {
      const nowVN = DateTime.now().setZone('Asia/Ho_Chi_Minh');
      const yesterday = nowVN.minus({ days: 1 }).startOf('day');
      const yesterdayStart = yesterday.toJSDate();
      this.logger.log(`yesterdayStart: ${yesterdayStart}`);
      const yesterdayEnd = yesterday.endOf('day').toJSDate();
      this.logger.log(`yesterdayEnd: ${yesterdayEnd}`);
      const profiles: ProfileWithUsers[] = await this.prisma.profile.findMany({
        where: {
          status: 'ACTIVE',
          transactions: { none: { date: { gte: yesterdayStart, lte: yesterdayEnd } } },
        },
        select: {
          id: true,
          name: true,
          profileUsers: {
            where: { status: 'ACTIVE' },
            select: { accountId: true },
          },
        },
      });
      for (const profile of profiles) {
        const accountIds = profile.profileUsers.map((u) => u.accountId);
        if (accountIds.length > 0) {
          const notification: SendBulkNotificationDto = {
            accountIds,
            title: 'Bạn có quên cập nhật không?',
            body: 'Hãy vào app để cập nhật giao dịch cho ngày hôm qua!',
          };
          try {
            await this.notificationsService.sendBulkNotification(notification);
          } catch (err) {
            this.logger.error(
              `Failed to send bulk notification for profile ${profile.id}: ${err.message}`,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error('Error in notifyProfilesWithoutTransactions cron job', error.stack);
    }
  }
}
