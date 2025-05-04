import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateTransactionFromDescriptionDto {
  @IsString()
  @MinLength(1)
  @ApiProperty({ description: 'Text to create transaction from' })
  text: string;
}
