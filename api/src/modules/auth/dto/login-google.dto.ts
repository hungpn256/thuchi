import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginGoogleDto {
  @ApiProperty({ description: 'idToken', example: 'abc...' })
  @IsString()
  @MinLength(3)
  idToken: string;
}
