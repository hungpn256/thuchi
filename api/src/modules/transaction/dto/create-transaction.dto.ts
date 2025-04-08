import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsDateString,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Loại giao dịch',
    enum: ['INCOME', 'EXPENSE'],
    example: 'INCOME',
  })
  @IsNotEmpty()
  @IsEnum(['INCOME', 'EXPENSE'])
  type: TransactionType;

  @ApiProperty({
    description: 'Số tiền',
    example: 1000000,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Mô tả giao dịch',
    example: 'Lương tháng 1',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Ngày giao dịch',
    example: '2024-01-01',
  })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'ID danh mục',
    example: 1,
    required: false,
  })
  @IsNumber()
  categoryId: number;
}
