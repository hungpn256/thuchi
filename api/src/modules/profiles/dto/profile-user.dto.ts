import { profile_permission } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateProfileUserPermissionDto {
  @IsEnum(profile_permission)
  permission: profile_permission;
}
