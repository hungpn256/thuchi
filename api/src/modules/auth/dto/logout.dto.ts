import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LogoutDto {
  @ApiProperty({
    description:
      'Device ID to logout from (optional - if not provided, will logout from all devices)',
    example: 'b8e7a2-f3c5-48d9-a6b1-c7d8e3f5a2b1',
    required: false,
  })
  @IsString()
  @IsOptional()
  deviceId?: string;
}
