import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';
import { PaginationDto } from './pagination.dto';

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
}
