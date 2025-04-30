import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma/prisma.service';
import { UpdateSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(profileId: number) {
    const settings = await this.prisma.settings.findUnique({
      where: { profileId },
    });

    if (!settings) {
      // Create default settings for user if not exist
      return this.prisma.settings.create({
        data: {
          profileId,
          defaultCurrency: 'VND',
          language: 'vi',
          theme: 'light',
          notificationsEnabled: true,
        },
      });
    }

    return settings;
  }

  async updateSettings(profileId: number, updateSettingsDto: UpdateSettingsDto) {
    // Check if settings exist
    const existingSettings = await this.prisma.settings.findUnique({
      where: { profileId },
    });

    if (!existingSettings) {
      // Create settings with provided values and defaults for missing ones
      return this.prisma.settings.create({
        data: {
          profileId,
          defaultCurrency: updateSettingsDto.defaultCurrency || 'VND',
          language: updateSettingsDto.language || 'vi',
          theme: updateSettingsDto.theme || 'light',
          notificationsEnabled:
            updateSettingsDto.notificationsEnabled !== undefined
              ? updateSettingsDto.notificationsEnabled
              : true,
        },
      });
    }

    // Update existing settings
    return this.prisma.settings.update({
      where: { profileId },
      data: updateSettingsDto,
    });
  }
}
