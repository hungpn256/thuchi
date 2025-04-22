import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../../shared/decorators';
import { UpdateSettingsDto } from './dto/settings.dto';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(@User('id') userId: number) {
    return this.settingsService.getSettings(userId);
  }

  @Put()
  async updateSettings(@User('id') userId: number, @Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(userId, updateSettingsDto);
  }
}
