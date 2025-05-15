import { IsDateString, IsOptional } from 'class-validator';

export class AccountsTotalQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
