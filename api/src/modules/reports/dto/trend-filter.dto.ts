import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ReportFilterDto } from './report-filter.dto';

export enum ComparisonPeriod {
  PREVIOUS_WEEK = 'PREVIOUS_WEEK',
  PREVIOUS_MONTH = 'PREVIOUS_MONTH',
  PREVIOUS_YEAR = 'PREVIOUS_YEAR',
  CUSTOM = 'CUSTOM',
}

export class TrendFilterDto extends ReportFilterDto {
  @ApiProperty({
    description: 'Kỳ so sánh',
    enum: ComparisonPeriod,
    default: ComparisonPeriod.PREVIOUS_MONTH,
  })
  @IsOptional()
  @IsEnum(ComparisonPeriod)
  compareWith: ComparisonPeriod = ComparisonPeriod.PREVIOUS_MONTH;

  @ApiProperty({
    description: 'Ngày bắt đầu kỳ so sánh (chỉ dùng khi compareWith=CUSTOM)',
    example: '2023-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  compareStartDate?: string;

  @ApiProperty({
    description: 'Ngày kết thúc kỳ so sánh (chỉ dùng khi compareWith=CUSTOM)',
    example: '2023-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  compareEndDate?: string;
}
