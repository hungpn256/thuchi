import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { category, Prisma } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateCategoryDto & { userId?: number }): Promise<category> {
    const category = this.prismaService.category.create({ data });
    return category;
  }

  async findAll(userId?: number): Promise<category[]> {
    return await this.prismaService.category.findMany({
      where: {
        OR: [
          { userId }, // Global categories
          { userId: null }, // Global categories
        ],
      },
      orderBy: { name: Prisma.SortOrder.asc },
    });
  }

  async findOne(id: number, userId?: number): Promise<category> {
    const category = await this.prismaService.category.findFirst({
      where: {
        OR: [
          { id, userId },
          { id, userId: null },
        ],
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: number, userId: number, data: Partial<CreateCategoryDto>): Promise<category> {
    // Chỉ cho phép update category của user, không cho update global categories
    const category = await this.prismaService.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException('Category not found or you do not have permission to update it');
    }

    Object.assign(category, data);
    return await this.prismaService.category.update({
      where: { id, userId },
      data,
    });
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.prismaService.category.delete({ where: { id, userId } });
  }
}
