import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class NotificationAction {
  @ApiProperty({ description: 'Action title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Action to perform when notification is clicked' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ description: 'Optional icon for the action' })
  @IsString()
  @IsOptional()
  icon?: string;
}

export class SendNotificationDto {
  @ApiProperty({ description: 'Notification title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Notification body' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({ description: 'Icon to display with notification', required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: 'Badge to display with notification', required: false })
  @IsString()
  @IsOptional()
  badge?: string;

  @ApiProperty({ description: 'URL to open when notification is clicked', required: false })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({ description: 'Image to display with notification', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ description: 'Tag for grouping notifications', required: false })
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiProperty({ description: 'Custom data to include with notification', required: false })
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @ApiProperty({ description: 'User ID to send notification to', required: false })
  @IsNumber()
  @IsOptional()
  userId?: number;

  @ApiProperty({
    description: 'Actions the user can take',
    required: false,
    type: [NotificationAction],
  })
  @IsOptional()
  actions?: NotificationAction[];

  @ApiProperty({ description: 'Time to live for the notification in seconds', required: false })
  @IsNumber()
  @IsOptional()
  ttl?: number;
}

export interface SendBulkNotificationDto {
  accountIds: number[];
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  image?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
  ttl?: number;
}
