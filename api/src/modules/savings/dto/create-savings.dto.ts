import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateSavingsDto {
  @ApiProperty({
    description: 'Tên khoản tiết kiệm',
    example: 'Tiền dự phòng',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Số lượng tài sản',
    example: 5000000,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: 'Loại tài sản',
    example: 'MONEY',
    maxLength: 50,
    required: false,
    default: 'MONEY',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  assetType?: string;

  @ApiProperty({
    description: 'Đơn vị',
    example: 'VND',
    maxLength: 20,
    required: false,
    default: 'VND',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiProperty({
    description: 'Mô tả khoản tiết kiệm',
    example: 'Tiền dự phòng cho các tình huống khẩn cấp',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Màu sắc (hex code)',
    example: '#3B82F6',
    pattern: '^#[A-Fa-f0-9]{6}$',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[A-Fa-f0-9]{6}$/, {
    message: 'Color must be a valid hex color code (e.g., #3B82F6)',
  })
  color?: string;
}
