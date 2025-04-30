import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/services/prisma/prisma.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { device_token } from '@prisma/client';

@Injectable()
export class DeviceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Register or update a device token for a user
   */
  async registerDevice(
    accountId: number,
    registerDeviceDto: RegisterDeviceDto,
  ): Promise<device_token> {
    return this.prisma.device_token.upsert({
      where: {
        accountId_deviceId: {
          accountId,
          deviceId: registerDeviceDto.deviceId,
        },
      },
      update: {
        token: registerDeviceDto.token,
        deviceType: registerDeviceDto.deviceType,
        deviceName: registerDeviceDto.deviceName,
        deviceModel: registerDeviceDto.deviceModel,
        osVersion: registerDeviceDto.osVersion,
        appVersion: registerDeviceDto.appVersion,
        lastActiveAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        accountId,
        deviceId: registerDeviceDto.deviceId,
        token: registerDeviceDto.token,
        deviceType: registerDeviceDto.deviceType,
        deviceName: registerDeviceDto.deviceName,
        deviceModel: registerDeviceDto.deviceModel,
        osVersion: registerDeviceDto.osVersion,
        appVersion: registerDeviceDto.appVersion,
      },
    });
  }

  /**
   * Get all device tokens for a user
   */
  async getUserDevices(accountId: number): Promise<device_token[]> {
    return this.prisma.device_token.findMany({
      where: {
        accountId,
      },
    });
  }

  /**
   * Delete a specific device token
   */
  async deleteDevice(accountId: number, deviceId: string): Promise<device_token> {
    return this.prisma.device_token.delete({
      where: {
        accountId_deviceId: {
          accountId,
          deviceId,
        },
      },
    });
  }

  /**
   * Delete all device tokens for a user
   */
  async deleteAllUserDevices(accountId: number): Promise<{ count: number }> {
    const result = await this.prisma.device_token.deleteMany({
      where: {
        accountId,
      },
    });

    return { count: result.count };
  }

  /**
   * Update device last active time
   */
  async updateDeviceLastActive(accountId: number, deviceId: string): Promise<device_token> {
    return this.prisma.device_token.update({
      where: {
        accountId_deviceId: {
          accountId,
          deviceId,
        },
      },
      data: {
        lastActiveAt: new Date(),
      },
    });
  }

  /**
   * Get device tokens for sending push notifications
   */
  async getDeviceTokensForUser(accountId: number): Promise<string[]> {
    const devices = await this.prisma.device_token.findMany({
      where: {
        accountId,
      },
      select: {
        token: true,
      },
    });

    return devices.map((device) => device.token);
  }
}
