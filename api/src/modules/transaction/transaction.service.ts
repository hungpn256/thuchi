import { DateRangeQueryDto } from '@/shared/dto/date-range-query.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from '@/shared/services/prisma/prisma.service';
import { Prisma, profile_status, transaction, transaction_type_enum } from '@prisma/client';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { GoogleGenAI, Type } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { AccountsTotalQueryDto } from './dto/accounts-total-query.dto';
import { AccountTotalDto } from './dto/account-total.dto';
import { CategoryService } from './category.service';

export interface PaginatedTransactions {
  items: transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MonthlySummary {
  month: string; // '2024-06'
  totalIncome: number;
  totalExpense: number;
}

// Add a transaction create input interface that includes createdById
export interface TransactionCreateInput extends CreateTransactionDto {
  profileId: number;
  createdById: number;
}

// Add a batch create input interface
export interface TransactionBatchCreateInput {
  transactions: CreateTransactionDto[];
  profileId: number;
  createdById: number;
}

@Injectable()
export class TransactionService {
  private readonly genAI: GoogleGenAI;
  constructor(
    private prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly categoryService: CategoryService,
  ) {
    this.genAI = new GoogleGenAI({ apiKey: this.configService.get('GOOGLE_GENAI_API_KEY') });
  }

  async create(data: TransactionCreateInput): Promise<transaction> {
    const transaction = this.prismaService.transaction.create({
      data: {
        ...data,
        profileId: data.profileId,
        createdById: data.createdById,
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
      orderBy: [
        {
          date: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
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

  async createBatch(data: TransactionBatchCreateInput): Promise<void> {
    await this.prismaService.transaction.createMany({
      data: data.transactions.map((t) => ({
        ...t,
        profileId: data.profileId,
        createdById: data.createdById,
      })),
      skipDuplicates: false,
    });
  }

  async createFromDescription(text: string, createdById: number, profileId: number) {
    const categories = await this.categoryService.findAll(profileId);
    console.log(
      '🚀 ~ TransactionService ~ createFromDescription ~ categories:',
      categories.map((c) => c.name),
    );

    const prompt = `Hãy phân tích đoạn text sau thành danh sách các giao dịch tài chính. Mỗi giao dịch gồm: type (INCOME/EXPENSE), amount (number), description (string), date ${new Date().toISOString()}, category (string), giờ hiện tại là ${new Date().toString()}. Trả về kết quả dạng JSON array để có thể dùng js JSON.parse thành object được.\n\nText: ${text}`;
    const response = await this.genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: {
                type: Type.STRING,
                description: 'Type of the transaction',
                nullable: false,
                enum: ['INCOME', 'EXPENSE'],
              },
              amount: {
                type: Type.NUMBER,
                description: 'Amount of the transaction',
                nullable: false,
              },
              description: {
                type: Type.STRING,
                description: 'Description of the transaction',
                nullable: true,
              },
              date: {
                type: Type.STRING,
                description: `Date of the transaction in format ${new Date().toISOString()}`,
                nullable: false,
              },
              category: {
                type: Type.STRING,
                description: 'Category of the transaction',
                nullable: true,
                enum: categories.map((c) => c.name),
              },
            },
            required: ['type', 'amount', 'date', 'category'],
          },
        },
      },
    });

    const transactions = JSON.parse(response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]');

    // Add createdById to each transaction
    const categoryMap = new Map(categories.map((c) => [c.name, c]));
    return transactions.map((transaction) => {
      return {
        ...transaction,
        createdById,
        categoryId: categoryMap.get(transaction.category)?.id || null,
        category: categoryMap.get(transaction.category),
      };
    });
  }

  async getSummaryByMonth(profileId: number, months: number): Promise<MonthlySummary[]> {
    const now = new Date();
    const results: MonthlySummary[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const month = format(monthDate, 'yyyy-MM');
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const transactions = await this.prismaService.transaction.findMany({
        where: {
          profileId,
          date: {
            gte: start,
            lte: end,
          },
        },
      });
      const totalIncome = transactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpense = transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      results.push({ month, totalIncome, totalExpense });
    }
    return results;
  }

  async getProfileTotal(profileId: number) {
    const [totalIncome, totalExpense] = await Promise.all([
      this.prismaService.transaction.aggregate({
        where: {
          profileId,
          type: 'INCOME',
        },
        _sum: {
          amount: true,
        },
      }),
      this.prismaService.transaction.aggregate({
        where: {
          profileId,
          type: 'EXPENSE',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      totalIncome: Number(totalIncome._sum.amount || 0),
      totalExpense: Number(totalExpense._sum.amount || 0),
      balance: Number(totalIncome._sum.amount || 0) - Number(totalExpense._sum.amount || 0),
    };
  }

  async getProfileAccountsTotal(profileId: number) {
    // Get all transactions in the profile
    const transactions = await this.prismaService.transaction.findMany({
      where: {
        profileId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    interface AccountTotal {
      accountId: number;
      email: string;
      totalIncome: number;
      totalExpense: number;
    }

    // Group transactions by account
    const accountTotals = transactions.reduce<Record<number, AccountTotal>>((acc, transaction) => {
      const accountId = transaction.createdById;
      if (!accountId) return acc;

      if (!acc[accountId]) {
        acc[accountId] = {
          accountId,
          email: transaction.createdBy?.email || 'Unknown',
          totalIncome: 0,
          totalExpense: 0,
        };
      }

      if (transaction.type === transaction_type_enum.INCOME) {
        acc[accountId].totalIncome += Number(transaction.amount);
      } else {
        acc[accountId].totalExpense += Number(transaction.amount);
      }

      return acc;
    }, {});

    // Calculate balance for each account and convert to array
    return Object.values(accountTotals).map((account) => ({
      ...account,
      balance: account.totalIncome - account.totalExpense,
    }));
  }

  async getAccountsTotal(
    profileId: number,
    query: AccountsTotalQueryDto,
  ): Promise<AccountTotalDto[]> {
    const { startDate, endDate } = query;
    const where: Prisma.transactionWhereInput = {
      type: {
        in: [transaction_type_enum.INCOME, transaction_type_enum.EXPENSE],
      },
    };

    where.date = {
      lte: endDate ? new Date(endDate) : undefined,
      gte: startDate ? new Date(startDate) : undefined,
    };

    const accounts = await this.prismaService.account.findMany({
      where: {
        profileUsers: {
          some: {
            profileId,
            status: profile_status.ACTIVE,
          },
        },
      },
      select: {
        id: true,
        email: true,
        transactions: {
          where: {
            ...where,
            profileId,
          },
          select: {
            type: true,
            amount: true,
          },
        },
      },
    });

    return accounts.map((account) => {
      const totalIncome = account.transactions
        .filter((t) => t.type === transaction_type_enum.INCOME)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpense = account.transactions
        .filter((t) => t.type === transaction_type_enum.EXPENSE)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        accountId: account.id,
        email: account.email,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      };
    });
  }
}
