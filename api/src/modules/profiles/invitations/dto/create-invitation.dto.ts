import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvitationDto {
  @ApiProperty({
    description: 'Email of the user to invite',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Message to send with the invitation',
    example: 'Please join my profile',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
