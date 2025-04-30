import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class SwitchProfileDto {
  @ApiProperty({
    description: 'ID của profile muốn chuyển sang',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  profileId: number;
}
