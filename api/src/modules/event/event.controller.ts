import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo sự kiện mới' })
  @ApiBody({
    type: CreateEventDto,
    description: 'Thông tin sự kiện cần tạo',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo sự kiện thành công',
    schema: {
      example: {
        id: 1,
        name: 'Đám cưới',
        description: 'Đám cưới của bạn A',
        startDate: '2024-03-20T00:00:00.000Z',
        endDate: '2024-03-21T00:00:00.000Z',
        expectedAmount: 50000000,
        userId: 1,
        createdAt: '2024-03-20T12:00:00Z',
        updatedAt: '2024-03-20T12:00:00Z',
      },
    },
  })
  create(@Request() req, @Body() createEventDto: CreateEventDto) {
    return this.eventService.create(req.user.id, createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sự kiện' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách sự kiện',
    schema: {
      example: [
        {
          id: 1,
          name: 'Đám cưới',
          description: 'Đám cưới của bạn A',
          startDate: '2024-03-20T00:00:00.000Z',
          endDate: '2024-03-21T00:00:00.000Z',
          expectedAmount: 50000000,
          userId: 1,
          createdAt: '2024-03-20T12:00:00Z',
          updatedAt: '2024-03-20T12:00:00Z',
          transactions: [],
        },
      ],
    },
  })
  findAll(@Request() req) {
    return this.eventService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết sự kiện' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chi tiết sự kiện',
    schema: {
      example: {
        id: 1,
        name: 'Đám cưới',
        description: 'Đám cưới của bạn A',
        startDate: '2024-03-20T00:00:00.000Z',
        endDate: '2024-03-21T00:00:00.000Z',
        expectedAmount: 50000000,
        userId: 1,
        createdAt: '2024-03-20T12:00:00Z',
        updatedAt: '2024-03-20T12:00:00Z',
        transactions: [],
      },
    },
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy sự kiện' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.eventService.findOne(req.user.id, +id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật sự kiện' })
  @ApiBody({
    type: UpdateEventDto,
    description: 'Thông tin cần cập nhật của sự kiện',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật sự kiện thành công',
    schema: {
      example: {
        id: 1,
        name: 'Đám cưới',
        description: 'Đám cưới của bạn A - Đã cập nhật',
        startDate: '2024-03-20T00:00:00.000Z',
        endDate: '2024-03-21T00:00:00.000Z',
        expectedAmount: 60000000,
        userId: 1,
        createdAt: '2024-03-20T12:00:00Z',
        updatedAt: '2024-03-20T13:00:00Z',
        transactions: [],
      },
    },
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy sự kiện' })
  update(@Request() req, @Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(req.user.id, +id, updateEventDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa sự kiện' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Xóa sự kiện thành công' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy sự kiện' })
  remove(@Request() req, @Param('id') id: string) {
    return this.eventService.remove(req.user.id, +id);
  }
}
