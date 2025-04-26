import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString, IsDateString } from 'class-validator';

export class PushSubscriptionKeys {
  @ApiProperty({ description: 'P256DH key for the push subscription' })
  @IsString()
  @IsNotEmpty()
  p256dh: string;

  @ApiProperty({ description: 'Auth secret for the push subscription' })
  @IsString()
  @IsNotEmpty()
  auth: string;
}

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Unique device identifier' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ description: 'Device type (web, android, ios)' })
  @IsString()
  @IsNotEmpty()
  deviceType: string;

  @ApiProperty({ description: 'Device name' })
  @IsString()
  @IsOptional()
  deviceName?: string;

  @ApiProperty({ description: 'Device model' })
  @IsString()
  @IsOptional()
  deviceModel?: string;

  @ApiProperty({ description: 'OS version' })
  @IsString()
  @IsOptional()
  osVersion?: string;

  @ApiProperty({ description: 'App version' })
  @IsString()
  @IsOptional()
  appVersion?: string;

  @ApiProperty({ description: 'Push subscription endpoint' })
  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @ApiProperty({ description: 'Push subscription expiration time' })
  @IsDateString()
  @IsOptional()
  expirationTime?: string | null;

  @ApiProperty({ description: 'Push subscription keys' })
  @IsObject()
  @IsNotEmpty()
  keys: PushSubscriptionKeys;
}
