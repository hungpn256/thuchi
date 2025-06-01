import { IsDecimal, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSavingsDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '3' })
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  assetType?: string = 'MONEY';

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string = 'VND';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;
}
