import { DateRangeQueryDto } from '@/shared/dto/date-range-query.dto';
import { PaginationQueryDto } from '@/shared/dto/pagination-query.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { TransactionType } from '@/constants/transaction.enum';

export interface PaginatedTransactions {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async create(data: CreateTransactionDto & { userId: number }): Promise<Transaction> {
    const transaction = this.transactionRepository.create(data);
    return await this.transactionRepository.save(transaction);
  }

  async findAll(
    userId: number,
    query: PaginationQueryDto & DateRangeQueryDto,
  ): Promise<PaginatedTransactions> {
    const { page = 1, limit = 10, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('transaction.userId = :userId', { userId });

    if (startDate && endDate) {
      queryBuilder.andWhere('transaction.date BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    const [items, total] = await queryBuilder
      .orderBy('transaction.date', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async update(id: number, data: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.findOne(id);
    Object.assign(transaction, data);
    return this.transactionRepository.save(transaction);
  }

  async remove(id: number): Promise<void> {
    const result = await this.transactionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Transaction not found');
    }
  }

  async getSummary(userId: number, query: DateRangeQueryDto) {
    const { startDate, endDate } = query;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId });

    if (startDate && endDate) {
      queryBuilder.andWhere('transaction.date BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    const transactions = await queryBuilder.getMany();

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
    userId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ categoryid: number; categoryname: string; total: number }[]> {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .select([
        'category.id as categoryId',
        'category.name as categoryName',
        'SUM(transaction.amount) as total',
      ])
      .leftJoin('transaction.category', 'category')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
      .groupBy('category.id')
      .orderBy('total', 'DESC');

    if (startDate) {
      query.andWhere('transaction.date >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('transaction.date <= :endDate', { endDate });
    }

    return query.getRawMany();
  }
}
