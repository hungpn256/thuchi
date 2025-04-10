import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { category } from '@prisma/client';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo danh mục mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo danh mục thành công',
  })
  async create(@Body() createCategoryDto: CreateCategoryDto, @Request() req): Promise<category> {
    try {
      return await this.categoryService.create({
        ...createCategoryDto,
        userId: req.user.id,
      });
    } catch (error) {
      throw new BadRequestException('Failed to create category: ' + error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách danh mục' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Danh sách danh mục' })
  async findAll(@Request() req): Promise<category[]> {
    try {
      const categories = await this.categoryService.findAll(req.user.id);
      return categories;
    } catch (error) {
      throw new BadRequestException('Failed to get categories: ' + error.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết danh mục' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Chi tiết danh mục' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy danh mục' })
  async findOne(@Param('id') id: number, @Request() req): Promise<category> {
    try {
      const category = await this.categoryService.findOne(id, req.user.id);
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      return category;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to get category: ' + error.message);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật danh mục' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật danh mục thành công',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy danh mục' })
  async update(
    @Param('id') id: number,
    @Body() updateCategoryDto: Partial<CreateCategoryDto>,
    @Request() req,
  ): Promise<category> {
    try {
      return await this.categoryService.update(id, req.user.id, updateCategoryDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update category: ' + error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa danh mục' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Xóa danh mục thành công' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy danh mục' })
  async remove(@Param('id') id: number, @Request() req): Promise<void> {
    try {
      await this.categoryService.remove(id, req.user.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete category: ' + error.message);
    }
  }
}
