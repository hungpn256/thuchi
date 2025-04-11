import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address for login',
  })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  username: string;

  @ApiProperty({
    example: '123456',
    description: 'Password for login',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
