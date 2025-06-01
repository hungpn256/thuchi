import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SavingsService } from './savings.service';
import { CreateSavingsDto } from './dto/create-savings.dto';
import { UpdateSavingsDto } from './dto/update-savings.dto';
import { GetSavingsDto } from './dto/get-savings.dto';
import { SavingsTotalDto } from './dto/savings-total.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Profile } from '@/shared/decorators/profile.decorator';
import { Account } from '@/shared/decorators/account.decorator';

@ApiTags('Savings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('savings')
export class SavingsController {
  constructor(private readonly savingsService: SavingsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo khoản tiết kiệm mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo khoản tiết kiệm thành công',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ',
  })
  async create(@Body() createSavingsDto: CreateSavingsDto, @Profile() profile, @Account() account) {
    return this.savingsService.create({
      ...createSavingsDto,
      profileId: profile.id,
      createdById: account.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách khoản tiết kiệm' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách thành công',
  })
  async findAll(@Query() query: GetSavingsDto, @Profile() profile) {
    return this.savingsService.findAll(profile.id, query);
  }

  @Get('total')
  @ApiOperation({ summary: 'Lấy tổng quan tiết kiệm theo loại tài sản' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy tổng quan thành công',
  })
  async getTotalAmount(@Profile() profile) {
    return this.savingsService.getTotalAmount(profile.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết khoản tiết kiệm' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy chi tiết thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy khoản tiết kiệm',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Profile() profile) {
    return this.savingsService.findOne(id, profile.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật khoản tiết kiệm' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy khoản tiết kiệm',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSavingsDto: UpdateSavingsDto,
    @Profile() profile,
  ) {
    return this.savingsService.update(id, profile.id, updateSavingsDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa khoản tiết kiệm' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Xóa thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy khoản tiết kiệm',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Profile() profile) {
    await this.savingsService.remove(id, profile.id);
  }
}
