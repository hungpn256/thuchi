import { ApiProperty } from '@nestjs/swagger';

export class MonthlyData {
  @ApiProperty({
    description: 'Tháng',
    example: '2024-01',
  })
  month: string;

  @ApiProperty({
    description: 'Tổng thu',
    example: 5000000,
  })
  totalIncome: number;

  @ApiProperty({
    description: 'Tổng chi',
    example: 3000000,
  })
  totalExpense: number;

  @ApiProperty({
    description: 'Chênh lệch (thu - chi)',
    example: 2000000,
  })
  balance: number;
}

export class SummaryReportResponseDto {
  @ApiProperty({
    description: 'Tổng thu trong khoảng thời gian',
    example: 15000000,
  })
  totalIncome: number;

  @ApiProperty({
    description: 'Tổng chi trong khoảng thời gian',
    example: 9000000,
  })
  totalExpense: number;

  @ApiProperty({
    description: 'Chênh lệch (thu - chi)',
    example: 6000000,
  })
  balance: number;

  @ApiProperty({
    description: 'Dữ liệu theo tháng',
    type: [MonthlyData],
  })
  monthlyData: MonthlyData[];
}
