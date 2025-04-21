import { ApiProperty } from '@nestjs/swagger';
import { transaction_type_enum } from '@prisma/client';

export class CategoryReportItem {
  @ApiProperty({
    description: 'ID danh mục',
    example: 1,
  })
  categoryId: number;

  @ApiProperty({
    description: 'Tên danh mục',
    example: 'Lương',
  })
  categoryName: string;

  @ApiProperty({
    description: 'Tổng số tiền',
    example: 5000000,
  })
  amount: number;

  @ApiProperty({
    description: 'Phần trăm so với tổng',
    example: 65.5,
  })
  percentage: number;
}

export class CategoryReportResponseDto {
  @ApiProperty({
    description: 'Loại giao dịch',
    enum: transaction_type_enum,
  })
  type: transaction_type_enum;

  @ApiProperty({
    description: 'Tổng số tiền',
    example: 15000000,
  })
  total: number;

  @ApiProperty({
    description: 'Dữ liệu theo danh mục',
    type: [CategoryReportItem],
  })
  categories: CategoryReportItem[];
}
