import { PartialType } from '@nestjs/swagger';
import { CreateSavingsDto } from './create-savings.dto';

export class UpdateSavingsDto extends PartialType(CreateSavingsDto) {}
