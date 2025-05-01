import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { profile_permission } from '@prisma/client';

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export class CreateInvitationDto {
  @ApiProperty({
    description: 'Email of the user to invite',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Permission of the user to invite',
    example: 'ADMIN',
  })
  @IsEnum(profile_permission)
  permission: profile_permission;
}

export class InvitationResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the invitation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Email of the invited user',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Message sent with the invitation',
    example: 'Please join my profile',
  })
  message: string;

  @ApiProperty({
    description: 'Status of the invitation',
    enum: InvitationStatus,
    example: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @ApiProperty({
    description: 'ID of the profile that sent the invitation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  profileId: string;

  @ApiProperty({
    description: 'When the invitation was created',
    example: '2024-03-20T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the invitation was last updated',
    example: '2024-03-20T10:00:00Z',
  })
  updatedAt: Date;
}
