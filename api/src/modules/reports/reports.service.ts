import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma/prisma.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { SummaryReportResponseDto, MonthlyData } from './dto/summary-report-response.dto';
import { CategoryReportItem, CategoryReportResponseDto } from './dto/category-report-response.dto';
import { TrendFilterDto, ComparisonPeriod } from './dto/trend-filter.dto';
import { TrendComparisonItem, TrendReportResponseDto } from './dto/trend-report-response.dto';
import { Prisma, transaction_type_enum } from '@prisma/client';
import { addMonths, addWeeks, addYears, format, parseISO, subDays } from 'date-fns';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lấy báo cáo tổng quan thu chi trong khoảng thời gian
   */
  async getSummaryReport(
    userId: number,
    filter: ReportFilterDto,
  ): Promise<SummaryReportResponseDto> {
    // Parse ngày từ string sang Date
    const startDate = new Date(filter.startDate);
    const endDate = new Date(filter.endDate);

    // Lấy tổng thu
    const totalIncome = await this.getTotalAmount(
      userId,
      startDate,
      endDate,
      transaction_type_enum.INCOME,
    );

    // Lấy tổng chi
    const totalExpense = await this.getTotalAmount(
      userId,
      startDate,
      endDate,
      transaction_type_enum.EXPENSE,
    );

    // Tính chênh lệch
    const balance = totalIncome - totalExpense;

    // Lấy dữ liệu theo tháng
    const monthlyData = await this.getMonthlyData(userId, startDate, endDate);

    return {
      totalIncome,
      totalExpense,
      balance,
      monthlyData,
    };
  }

  /**
   * Lấy báo cáo chi tiết theo danh mục
   */
  async getCategoryReport(
    userId: number,
    filter: ReportFilterDto,
  ): Promise<CategoryReportResponseDto> {
    // Parse ngày từ string sang Date
    const startDate = new Date(filter.startDate);
    const endDate = new Date(filter.endDate);

    // Nếu không chỉ định loại giao dịch, sử dụng EXPENSE làm mặc định
    const type = filter.type || transaction_type_enum.EXPENSE;

    // Lấy tổng số tiền theo loại giao dịch
    const total = await this.getTotalAmount(userId, startDate, endDate, type);

    // Lấy dữ liệu chi tiết theo danh mục
    const categoryData = await this.prisma.$queryRaw<
      Array<{
        categoryId: number;
        categoryName: string;
        amount: number;
      }>
    >`
      SELECT 
        c.id as "categoryId", 
        c.name as "categoryName", 
        SUM(t.amount::numeric) as amount
      FROM transaction t
      LEFT JOIN category c ON t."categoryId" = c.id
      WHERE t."userId" = ${userId}
        AND t.date BETWEEN ${startDate} AND ${endDate}
        AND t.type = ${type}
      GROUP BY c.id, c.name
      ORDER BY amount DESC
    `;

    // Tính phần trăm cho từng danh mục
    const categories: CategoryReportItem[] = categoryData.map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName || 'Không có danh mục',
      amount: Number(item.amount),
      percentage: total > 0 ? Number(((Number(item.amount) / total) * 100).toFixed(1)) : 0,
    }));

    return {
      type,
      total,
      categories,
    };
  }

  /**
   * Lấy báo cáo xu hướng (so sánh 2 kỳ)
   */
  async getTrendReport(userId: number, filter: TrendFilterDto): Promise<TrendReportResponseDto> {
    // Parse ngày từ string sang Date
    const currentStartDate = new Date(filter.startDate);
    const currentEndDate = new Date(filter.endDate);

    // Tính ngày của kỳ so sánh dựa vào ComparisonPeriod
    let previousStartDate: Date;
    let previousEndDate: Date;

    if (
      filter.compareWith === ComparisonPeriod.CUSTOM &&
      filter.compareStartDate &&
      filter.compareEndDate
    ) {
      previousStartDate = new Date(filter.compareStartDate);
      previousEndDate = new Date(filter.compareEndDate);
    } else {
      // Tính thời gian kỳ so sánh dựa vào loại
      const { previousPeriod } = this.getComparisonPeriod(
        currentStartDate,
        currentEndDate,
        filter.compareWith,
      );

      previousStartDate = previousPeriod.startDate;
      previousEndDate = previousPeriod.endDate;
    }

    const comparisons: TrendComparisonItem[] = [];

    // Thêm các chỉ số so sánh
    // 1. Tổng thu
    const currentTotalIncome = await this.getTotalAmount(
      userId,
      currentStartDate,
      currentEndDate,
      transaction_type_enum.INCOME,
    );

    const previousTotalIncome = await this.getTotalAmount(
      userId,
      previousStartDate,
      previousEndDate,
      transaction_type_enum.INCOME,
    );

    comparisons.push(
      this.createComparisonItem('Tổng thu', currentTotalIncome, previousTotalIncome),
    );

    // 2. Tổng chi
    const currentTotalExpense = await this.getTotalAmount(
      userId,
      currentStartDate,
      currentEndDate,
      transaction_type_enum.EXPENSE,
    );

    const previousTotalExpense = await this.getTotalAmount(
      userId,
      previousStartDate,
      previousEndDate,
      transaction_type_enum.EXPENSE,
    );

    comparisons.push(
      this.createComparisonItem('Tổng chi', currentTotalExpense, previousTotalExpense),
    );

    // 3. Chênh lệch
    const currentBalance = currentTotalIncome - currentTotalExpense;
    const previousBalance = previousTotalIncome - previousTotalExpense;

    comparisons.push(
      this.createComparisonItem('Chênh lệch (thu - chi)', currentBalance, previousBalance),
    );

    // Thêm các chỉ số khác nếu cần...

    return {
      type: filter.type,
      comparisonPeriod: filter.compareWith,
      currentStartDate: format(currentStartDate, 'yyyy-MM-dd'),
      currentEndDate: format(currentEndDate, 'yyyy-MM-dd'),
      previousStartDate: format(previousStartDate, 'yyyy-MM-dd'),
      previousEndDate: format(previousEndDate, 'yyyy-MM-dd'),
      comparisons,
    };
  }

  /**
   * Tính tổng số tiền theo loại giao dịch và khoảng thời gian
   */
  private async getTotalAmount(
    userId: number,
    startDate: Date,
    endDate: Date,
    type: transaction_type_enum,
  ): Promise<number> {
    const result = await this.prisma.transaction.aggregate({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        type,
      },
      _sum: {
        amount: true,
      },
    });

    return Number(result._sum.amount || 0);
  }

  /**
   * Lấy dữ liệu thu chi theo tháng
   */
  private async getMonthlyData(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<MonthlyData[]> {
    // SQL query để lấy dữ liệu theo tháng
    const monthlyTransactions = await this.prisma.$queryRaw<
      Array<{
        month: string;
        type: transaction_type_enum;
        amount: number;
      }>
    >`
      SELECT 
        to_char(date, 'YYYY-MM') as month,
        type,
        SUM(amount::numeric) as amount
      FROM transaction
      WHERE "userId" = ${userId}
        AND date BETWEEN ${startDate} AND ${endDate}
      GROUP BY month, type
      ORDER BY month
    `;

    // Tạo map để lưu trữ dữ liệu theo tháng
    const monthDataMap = new Map<string, { income: number; expense: number }>();

    // Duyệt qua kết quả và cập nhật Map
    monthlyTransactions.forEach((item) => {
      if (!monthDataMap.has(item.month)) {
        monthDataMap.set(item.month, { income: 0, expense: 0 });
      }

      const monthData = monthDataMap.get(item.month);

      if (item.type === transaction_type_enum.INCOME) {
        monthData.income = Number(item.amount);
      } else {
        monthData.expense = Number(item.amount);
      }
    });

    // Chuyển đổi Map thành mảng kết quả
    const monthlyData: MonthlyData[] = Array.from(monthDataMap.entries()).map(([month, data]) => ({
      month,
      totalIncome: data.income,
      totalExpense: data.expense,
      balance: data.income - data.expense,
    }));

    return monthlyData;
  }

  /**
   * Tạo item so sánh cho báo cáo xu hướng
   */
  private createComparisonItem(
    name: string,
    currentValue: number,
    previousValue: number,
  ): TrendComparisonItem {
    let changePercentage = 0;
    if (previousValue !== 0) {
      changePercentage = Number(
        (((currentValue - previousValue) / Math.abs(previousValue)) * 100).toFixed(1),
      );
    } else if (currentValue !== 0) {
      changePercentage = 100;
    }

    return {
      name,
      currentValue,
      previousValue,
      changeValue: currentValue - previousValue,
      changePercentage,
    };
  }

  /**
   * Tính toán kỳ so sánh dựa vào loại ComparisonPeriod
   */
  private getComparisonPeriod(
    currentStartDate: Date,
    currentEndDate: Date,
    compareWith: ComparisonPeriod,
  ): {
    currentPeriod: { startDate: Date; endDate: Date };
    previousPeriod: { startDate: Date; endDate: Date };
  } {
    // Tính độ dài của kỳ hiện tại (số ngày)
    const periodLength = Math.ceil(
      (currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    let previousStartDate: Date;
    let previousEndDate: Date;

    switch (compareWith) {
      case ComparisonPeriod.PREVIOUS_WEEK:
        previousStartDate = addWeeks(currentStartDate, -1);
        previousEndDate = addWeeks(currentEndDate, -1);
        break;

      case ComparisonPeriod.PREVIOUS_MONTH:
        previousStartDate = addMonths(currentStartDate, -1);
        previousEndDate = addMonths(currentEndDate, -1);
        break;

      case ComparisonPeriod.PREVIOUS_YEAR:
        previousStartDate = addYears(currentStartDate, -1);
        previousEndDate = addYears(currentEndDate, -1);
        break;

      default:
        // Mặc định lấy kỳ trước đó có cùng độ dài
        previousEndDate = subDays(currentStartDate, 1);
        previousStartDate = subDays(previousEndDate, periodLength - 1);
    }

    return {
      currentPeriod: { startDate: currentStartDate, endDate: currentEndDate },
      previousPeriod: { startDate: previousStartDate, endDate: previousEndDate },
    };
  }
}
