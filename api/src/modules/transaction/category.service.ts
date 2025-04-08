import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(data: CreateCategoryDto & { userId?: number }): Promise<Category> {
    const category = this.categoryRepository.create(data);
    return await this.categoryRepository.save(category);
  }

  async findAll(userId?: number): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: [
        { userId }, // Global categories
        { userId: IsNull() }, // Global categories
      ],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number, userId?: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: [
        { id, userId },
        { id, userId: IsNull() },
      ],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: number, userId: number, data: Partial<CreateCategoryDto>): Promise<Category> {
    // Chỉ cho phép update category của user, không cho update global categories
    const category = await this.categoryRepository.findOne({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException('Category not found or you do not have permission to update it');
    }

    Object.assign(category, data);
    return await this.categoryRepository.save(category);
  }

  async remove(id: number, userId: number): Promise<void> {
    // Chỉ cho phép xóa category của user, không cho xóa global categories
    const result = await this.categoryRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new NotFoundException('Category not found or you do not have permission to delete it');
    }
  }
}
