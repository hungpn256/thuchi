import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TransactionModule } from './modules/transaction/transaction.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './shared/services/prisma/prisma.module';

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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
