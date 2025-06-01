import { Module } from '@nestjs/common';
import { SavingsController } from './savings.controller';
import { SavingsService } from './savings.service';
import { PrismaModule } from '../../shared/services/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SavingsController],
  providers: [SavingsService],
  exports: [SavingsService],
})
export class SavingsModule {}
