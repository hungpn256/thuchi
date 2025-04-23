import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Delete,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { DeviceService } from './device.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('Device Management')
@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('register')
  @ApiOperation({
    summary: 'Register a device for push notifications',
    description: 'Register or update a device token for the current user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The device has been successfully registered',
  })
  async registerDevice(@Request() req, @Body() registerDeviceDto: RegisterDeviceDto) {
    const result = await this.deviceService.registerDevice(req.user.id, registerDeviceDto);
    return {
      message: 'Device registered successfully',
      deviceId: result.deviceId,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({
    summary: 'Get user devices',
    description: 'Get all registered devices for the current user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of registered devices',
  })
  async getUserDevices(@Request() req) {
    return this.deviceService.getUserDevices(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':deviceId')
  @ApiOperation({
    summary: 'Delete a device',
    description: 'Delete a specific device for the current user',
  })
  @ApiParam({
    name: 'deviceId',
    description: 'Device ID to delete',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The device has been successfully deleted',
  })
  async deleteDevice(@Request() req, @Param('deviceId') deviceId: string) {
    await this.deviceService.deleteDevice(req.user.id, deviceId);
    return {
      message: 'Device deleted successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete()
  @ApiOperation({
    summary: 'Delete all devices',
    description: 'Delete all registered devices for the current user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All devices have been successfully deleted',
  })
  async deleteAllDevices(@Request() req) {
    const result = await this.deviceService.deleteAllUserDevices(req.user.id);
    return {
      message: 'All devices deleted successfully',
      count: result.count,
    };
  }
}
