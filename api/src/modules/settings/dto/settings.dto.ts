import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @IsIn(['VND', 'USD', 'EUR', 'JPY'])
  @MaxLength(3)
  defaultCurrency?: string;

  @IsOptional()
  @IsString()
  @IsIn(['vi', 'en'])
  @MaxLength(2)
  language?: string;

  @IsOptional()
  @IsString()
  @IsIn(['light', 'dark'])
  theme?: string;

  @IsOptional()
  @IsBoolean()
  notificationsEnabled?: boolean;
}

export class SettingsResponseDto {
  id: number;
  userId: number;
  defaultCurrency: string;
  language: string;
  theme: string;
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
