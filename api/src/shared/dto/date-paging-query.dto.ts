import { IsDateString, IsOptional } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class DatePagingQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
