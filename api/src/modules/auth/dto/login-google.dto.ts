import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginGoogleDto {
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
    description: 'Google ID Token',
  })
  @IsString({ message: 'ID Token must be a string' })
  @IsNotEmpty({ message: 'ID Token is required' })
  idToken: string;
}
