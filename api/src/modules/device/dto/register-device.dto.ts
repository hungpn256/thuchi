import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export enum DeviceType {
  ANDROID = 'android',
  IOS = 'ios',
  WEB = 'web',
}

export class RegisterDeviceDto {
  @ApiProperty({
    description: 'Unique device identifier',
    example: 'b8e7a2-f3c5-48d9-a6b1-c7d8e3f5a2b1',
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({
    description: 'Device token for push notifications',
    example: 'dIkW8tRfY7Uzv1X2...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'Type of device',
    enum: DeviceType,
    example: DeviceType.ANDROID,
  })
  @IsEnum(DeviceType)
  deviceType: DeviceType;

  @ApiProperty({
    description: 'Name of the device',
    example: 'Pixel 6',
    required: false,
  })
  @IsString()
  @IsOptional()
  deviceName?: string;

  @ApiProperty({
    description: 'Device model',
    example: 'SM-G998B',
    required: false,
  })
  @IsString()
  @IsOptional()
  deviceModel?: string;

  @ApiProperty({
    description: 'OS version',
    example: 'Android 12',
    required: false,
  })
  @IsString()
  @IsOptional()
  osVersion?: string;

  @ApiProperty({
    description: 'App version',
    example: '1.0.0',
    required: false,
  })
  @IsString()
  @IsOptional()
  appVersion?: string;
}
