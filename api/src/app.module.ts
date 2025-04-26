import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { TransactionModule } from './modules/transaction/transaction.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './shared/services/prisma/prisma.module';
import { EventModule } from './modules/event/event.module';
import { ValidationPipe } from '@nestjs/common';
import { validationConfig } from './configs/validation.config';
import { ReportsModule } from './modules/reports/reports.module';
import { SettingsModule } from './modules/settings/settings.module';
import { DeviceModule } from './modules/device/device.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true,
    }),
    PrismaModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10000, // 10seconds
          limit: 10,
        },
      ],
    }),
    AuthModule,
    TransactionModule,
    EventModule,
    ReportsModule,
    SettingsModule,
    DeviceModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe(validationConfig),
    },
  ],
})
export class AppModule {}
