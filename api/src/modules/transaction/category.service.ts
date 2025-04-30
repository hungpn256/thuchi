import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { PrismaService } from '@/shared/services/prisma/prisma.service';
import { category, Prisma } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateCategoryDto & { profileId?: number }): Promise<category> {
    const category = this.prismaService.category.create({ data });
    return category;
  }

  async findAll(profileId?: number): Promise<category[]> {
    return await this.prismaService.category.findMany({
      where: {
        OR: [
          { profileId }, // Global categories
          { profileId: null }, // Global categories
        ],
      },
      orderBy: { name: Prisma.SortOrder.asc },
    });
  }

  async findOne(id: number, profileId?: number): Promise<category> {
    const category = await this.prismaService.category.findFirst({
      where: {
        OR: [
          { id, profileId },
          { id, profileId: null },
        ],
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: number, profileId: number, data: Partial<CreateCategoryDto>): Promise<category> {
    // Chỉ cho phép update category của user, không cho update global categories
    const category = await this.prismaService.category.findFirst({
      where: { id, profileId },
    });

    if (!category) {
      throw new NotFoundException('Category not found or you do not have permission to update it');
    }

    Object.assign(category, data);
    return await this.prismaService.category.update({
      where: { id, profileId },
      data,
    });
  }

  async remove(id: number, profileId: number): Promise<void> {
    await this.prismaService.category.delete({ where: { id, profileId } });
  }
}
