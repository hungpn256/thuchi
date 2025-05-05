import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaService } from '@/shared/services/prisma/prisma.service';
import { CronService } from './cron.service';

@Module({
  imports: [NotificationsModule],
  providers: [CronService, PrismaService],
})
export class CronModule {}
