import { ApiProperty } from '@nestjs/swagger';

export class SavingsTotalDto {
  @ApiProperty({
    description: 'Tổng số tiền tiết kiệm',
    example: 15000000,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Số lượng khoản tiết kiệm',
    example: 3,
  })
  totalCount: number;
}
