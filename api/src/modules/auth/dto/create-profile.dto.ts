import { ApiProperty } from '@nestjs/swagger';
import { profile_permission, profile_user_status } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({
    description: 'Tên profile',
    example: 'Cá nhân',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Quyền của profile',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(profile_permission)
  permission: profile_permission;

  @ApiProperty({
    description: 'Trạng thái của profile',
    example: 'active',
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(profile_user_status)
  status: profile_user_status;
}
