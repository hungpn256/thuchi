import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';

@Module({
  controllers: [TransactionController, CategoryController],
  providers: [TransactionService, CategoryService],
})
export class TransactionModule {}
