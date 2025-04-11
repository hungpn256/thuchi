import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleCallbackDto {
  @ApiProperty({
    example: '4/0AfJohXnC4Zf...',
    description: 'Authorization code from Google',
  })
  @IsString({ message: 'Authorization code must be a string' })
  @IsNotEmpty({ message: 'Authorization code is required' })
  code: string;
}
