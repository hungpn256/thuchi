import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    description: 'Tên sự kiện',
    example: 'Đám cưới',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Mô tả sự kiện',
    example: 'Đám cưới của bạn A',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Ngày bắt đầu sự kiện',
    example: '2024-03-20T00:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Ngày kết thúc sự kiện',
    example: '2024-03-21T00:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Số tiền dự kiến',
    example: 50000000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  expectedAmount?: number;
}
