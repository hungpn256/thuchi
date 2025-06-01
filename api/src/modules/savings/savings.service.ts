import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/shared/services/prisma/prisma.service';
import { CreateSavingsDto } from './dto/create-savings.dto';
import { UpdateSavingsDto } from './dto/update-savings.dto';
import { GetSavingsDto } from './dto/get-savings.dto';
import { SavingsTotalDto } from './dto/savings-total.dto';
import { savings } from '@prisma/client';

export interface SavingsCreateInput extends CreateSavingsDto {
  profileId: number;
  createdById: number;
  assetType?: string;
  unit?: string;
}

export interface PaginatedSavingsResult {
  data: savings[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class SavingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: SavingsCreateInput): Promise<savings> {
    return this.prisma.savings.create({
      data: {
        name: data.name,
        amount: data.amount,
        assetType: data.assetType || 'MONEY',
        unit: data.unit || 'VND',
        description: data.description,
        color: data.color,
        profileId: data.profileId,
        createdById: data.createdById,
      },
      include: {
        profile: true,
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(profileId: number, query: GetSavingsDto): Promise<PaginatedSavingsResult> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where = {
      profileId,
      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.savings.findMany({
        where,
        include: {
          profile: true,
          createdBy: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.savings.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, profileId: number): Promise<savings> {
    const savings = await this.prisma.savings.findFirst({
      where: { id, profileId },
      include: {
        profile: true,
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!savings) {
      throw new NotFoundException(`Không tìm thấy khoản tiết kiệm với ID ${id}`);
    }

    return savings;
  }

  async update(id: number, profileId: number, updateData: UpdateSavingsDto): Promise<savings> {
    // Check if savings exists and belongs to profile
    await this.findOne(id, profileId);

    return this.prisma.savings.update({
      where: { id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.amount !== undefined && { amount: updateData.amount }),
        ...(updateData.assetType && { assetType: updateData.assetType }),
        ...(updateData.unit && { unit: updateData.unit }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.color !== undefined && { color: updateData.color }),
      },
      include: {
        profile: true,
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: number, profileId: number): Promise<void> {
    // Check if savings exists and belongs to profile
    await this.findOne(id, profileId);

    await this.prisma.savings.delete({
      where: { id },
    });
  }

  async getTotalAmount(profileId: number) {
    const result = await this.prisma.savings.groupBy({
      by: ['assetType', 'unit'],
      where: { profileId },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    const totalCount = await this.prisma.savings.count({ where: { profileId } });

    // Get a representative color for each asset type group
    const resultWithColors = await Promise.all(
      result.map(async (item) => {
        const firstAsset = await this.prisma.savings.findFirst({
          where: {
            profileId,
            assetType: item.assetType,
            unit: item.unit,
          },
          select: { color: true },
        });

        return {
          assetType: item.assetType,
          unit: item.unit,
          totalAmount: Number(item._sum.amount) || 0,
          count: item._count,
          color: firstAsset?.color || '#3B82F6', // Default blue if no color
        };
      }),
    );

    return {
      byAssetType: resultWithColors,
      totalCount,
    };
  }
}
