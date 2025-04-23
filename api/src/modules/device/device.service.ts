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
    userId: number,
    registerDeviceDto: RegisterDeviceDto,
  ): Promise<device_token> {
    return this.prisma.device_token.upsert({
      where: {
        userId_deviceId: {
          userId,
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
        userId,
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
  async getUserDevices(userId: number): Promise<device_token[]> {
    return this.prisma.device_token.findMany({
      where: {
        userId,
      },
    });
  }

  /**
   * Delete a specific device token
   */
  async deleteDevice(userId: number, deviceId: string): Promise<device_token> {
    return this.prisma.device_token.delete({
      where: {
        userId_deviceId: {
          userId,
          deviceId,
        },
      },
    });
  }

  /**
   * Delete all device tokens for a user
   */
  async deleteAllUserDevices(userId: number): Promise<{ count: number }> {
    const result = await this.prisma.device_token.deleteMany({
      where: {
        userId,
      },
    });

    return { count: result.count };
  }

  /**
   * Update device last active time
   */
  async updateDeviceLastActive(userId: number, deviceId: string): Promise<device_token> {
    return this.prisma.device_token.update({
      where: {
        userId_deviceId: {
          userId,
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
  async getDeviceTokensForUser(userId: number): Promise<string[]> {
    const devices = await this.prisma.device_token.findMany({
      where: {
        userId,
      },
      select: {
        token: true,
      },
    });

    return devices.map((device) => device.token);
  }
}
