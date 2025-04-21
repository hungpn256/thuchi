import { ApiProperty } from '@nestjs/swagger';
import { transaction_type_enum } from '@prisma/client';
import { ComparisonPeriod } from './trend-filter.dto';

export class TrendComparisonItem {
  @ApiProperty({
    description: 'Tên chỉ số',
    example: 'Tổng thu',
  })
  name: string;

  @ApiProperty({
    description: 'Giá trị kỳ hiện tại',
    example: 5000000,
  })
  currentValue: number;

  @ApiProperty({
    description: 'Giá trị kỳ so sánh',
    example: 4000000,
  })
  previousValue: number;

  @ApiProperty({
    description: 'Phần trăm thay đổi',
    example: 25,
  })
  changePercentage: number;

  @ApiProperty({
    description: 'Giá trị thay đổi',
    example: 1000000,
  })
  changeValue: number;
}

export class TrendReportResponseDto {
  @ApiProperty({
    description: 'Loại giao dịch',
    enum: transaction_type_enum,
    required: false,
  })
  type?: transaction_type_enum;

  @ApiProperty({
    description: 'Kỳ so sánh',
    enum: ComparisonPeriod,
  })
  comparisonPeriod: ComparisonPeriod;

  @ApiProperty({
    description: 'Ngày bắt đầu kỳ hiện tại',
    example: '2024-01-01',
  })
  currentStartDate: string;

  @ApiProperty({
    description: 'Ngày kết thúc kỳ hiện tại',
    example: '2024-03-31',
  })
  currentEndDate: string;

  @ApiProperty({
    description: 'Ngày bắt đầu kỳ so sánh',
    example: '2023-10-01',
  })
  previousStartDate: string;

  @ApiProperty({
    description: 'Ngày kết thúc kỳ so sánh',
    example: '2023-12-31',
  })
  previousEndDate: string;

  @ApiProperty({
    description: 'Các chỉ số so sánh',
    type: [TrendComparisonItem],
  })
  comparisons: TrendComparisonItem[];
}
