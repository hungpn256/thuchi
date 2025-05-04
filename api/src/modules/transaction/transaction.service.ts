import { DateRangeQueryDto } from '@/shared/dto/date-range-query.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from '@/shared/services/prisma/prisma.service';
import { Prisma, transaction } from '@prisma/client';
import { GetTransactionsDto } from './dto/get-transactions.dto';
export interface PaginatedTransactions {
  items: transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class TransactionService {
  constructor(private prismaService: PrismaService) {}

  async create(data: CreateTransactionDto & { profileId: number }): Promise<transaction> {
    const transaction = this.prismaService.transaction.create({
      data: {
        ...data,
        profileId: data.profileId,
      },
    });
    return transaction;
  }

  async findAll(profileId: number, query: GetTransactionsDto): Promise<PaginatedTransactions> {
    const { page = 1, limit = 10, startDate, endDate, categoryIds, type, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.transactionWhereInput = {
      profileId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      ...(categoryIds && { categoryId: { in: categoryIds.split(',').map(Number) } }),
      ...(type && { type }),
      ...(search && { description: { contains: search, mode: 'insensitive' } }),
    };

    const items = await this.prismaService.transaction.findMany({
      where: where,
      include: {
        category: true,
      },
      skip,
      take: limit,
    });
    const total = await this.prismaService.transaction.count({
      where: where,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<transaction> {
    const transaction = await this.prismaService.transaction.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async update(id: number, data: UpdateTransactionDto): Promise<transaction> {
    const transaction = await this.findOne(id);
    Object.assign(transaction, data);
    return this.prismaService.transaction.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<void> {
    await this.prismaService.transaction.delete({ where: { id } });
  }

  async getSummary(profileId: number, query: DateRangeQueryDto) {
    const { startDate, endDate } = query;

    const transactions = await this.prismaService.transaction.findMany({
      where: {
        profileId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }

  async getExpensesByCategory(
    profileId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ categoryid: number; categoryname: string; total: number }[]> {
    const transactions = await this.prismaService.transaction.groupBy({
      by: ['categoryId'],
      where: {
        profileId,
        type: 'EXPENSE',
        date: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      },
      _sum: {
        amount: true,
      },
    });

    const categories = await this.prismaService.category.findMany({
      where: {
        id: {
          in: transactions.map((t) => t.categoryId),
        },
      },
    });

    return transactions
      .map((t) => {
        const category = categories.find((c) => c.id === t.categoryId);
        return {
          categoryid: t.categoryId,
          categoryname: category?.name || '',
          total: Number(t._sum.amount) || 0,
        };
      })
      .sort((a, b) => b.total - a.total);
  }

  async createBatch(data: {
    transactions: CreateTransactionDto[];
    profileId: number;
  }): Promise<void> {
    await this.prismaService.transaction.createMany({
      data: data.transactions.map((t) => ({ ...t, profileId: data.profileId })),
      skipDuplicates: false,
    });
  }
}
