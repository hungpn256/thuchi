import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateSettingsDto } from './dto/settings.dto';
import { Profile } from '@/shared/decorators/profile.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(@Profile() profile) {
    return this.settingsService.getSettings(profile.id);
  }

  @Put()
  async updateSettings(@Profile() profile, @Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(profile.id, updateSettingsDto);
  }
}
