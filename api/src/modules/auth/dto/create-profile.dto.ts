import { Optional } from '@nestjs/common';
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
}
