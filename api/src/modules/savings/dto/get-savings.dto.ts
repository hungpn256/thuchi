import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../transaction/dto/pagination.dto';

export class GetSavingsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Tìm kiếm theo tên khoản tiết kiệm',
    example: 'tiền dự phòng',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
