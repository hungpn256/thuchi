import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';
import { TransactionType } from '@/constants/transaction.enum';

export class GetTransactionsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Start date for filtering (ISO format)',
    example: '2024-03-01T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'End date for filtering (ISO format)',
    example: '2024-03-31T23:59:59.999Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Category IDs for filtering (comma-separated)',
    example: '1,2,3',
  })
  @IsString()
  @IsOptional()
  categoryIds?: string;

  @ApiPropertyOptional({
    description: 'Transaction type (INCOME, EXPENSE)',
    enum: TransactionType,
  })
  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;

  @ApiPropertyOptional({
    description: 'Search term for description',
    example: 'groceries',
  })
  @IsString()
  @IsOptional()
  search?: string;
}
