export type TransactionType = 'INCOME' | 'EXPENSE';

export interface ReportFilterParams {
  startDate: string;
  endDate: string;
  type?: TransactionType;
}

export interface TrendFilterParams extends ReportFilterParams {
  compareWith?: ComparisonPeriod;
  compareStartDate?: string;
  compareEndDate?: string;
}

export enum ComparisonPeriod {
  PREVIOUS_WEEK = 'PREVIOUS_WEEK',
  PREVIOUS_MONTH = 'PREVIOUS_MONTH',
  PREVIOUS_YEAR = 'PREVIOUS_YEAR',
  CUSTOM = 'CUSTOM',
}

// Summary Report
export interface MonthlyData {
  month: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface SummaryReport {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyData: MonthlyData[];
}

// Category Report
export interface CategoryReportItem {
  categoryId: number;
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface CategoryReport {
  type: TransactionType;
  total: number;
  categories: CategoryReportItem[];
}

// Trend Report
export interface TrendComparisonItem {
  name: string;
  currentValue: number;
  previousValue: number;
  changePercentage: number;
  changeValue: number;
}

export interface TrendReport {
  type?: TransactionType;
  comparisonPeriod: ComparisonPeriod;
  currentStartDate: string;
  currentEndDate: string;
  previousStartDate: string;
  previousEndDate: string;
  comparisons: TrendComparisonItem[];
}

export interface Category {
  id: string;
  name: string;
  amount: number;
}

export interface CategoryReportData {
  total: number;
  categories: Category[];
}

export interface CategoryReportFilters {
  startDate: Date;
  endDate: Date;
  type: TransactionType;
  walletId?: string;
}
