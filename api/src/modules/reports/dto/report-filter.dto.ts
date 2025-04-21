import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { transaction_type_enum } from '@prisma/client';

export class ReportFilterDto {
  @ApiProperty({
    description: 'Ngày bắt đầu',
    example: '2024-01-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Ngày kết thúc',
    example: '2024-12-31',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Loại giao dịch (thu/chi)',
    enum: transaction_type_enum,
    required: false,
  })
  @IsOptional()
  @IsEnum(transaction_type_enum)
  type?: transaction_type_enum;
}
