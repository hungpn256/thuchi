import { IsDecimal, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSavingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '3' })
  amount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  assetType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;
}
