'use client';

import { ReportFilter } from '@/components/reports/ReportFilter';
import { CategoryReport } from '@/components/reports/CategoryReport';
import {
  ReportFilterParams,
  CategoryReportFilters,
  CategoryReport as CategoryReportType,
  CategoryReportData,
  Category,
} from '@/types/report';
import { useCategoryReport } from '@/hooks/use-reports';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useState, useMemo } from 'react';

// Hàm chuyển đổi từ CategoryReport sang CategoryReportData
const convertToReportData = (report?: CategoryReportType): CategoryReportData | undefined => {
  if (!report) return undefined;

  // Chuyển đổi CategoryReportItem[] sang Category[]
  const categories: Category[] = report.categories.map((item) => ({
    id: item.categoryId.toString(),
    name: item.categoryName,
    amount: item.amount,
  }));

  return {
    total: report.total,
    categories,
  };
};

export default function CategoryReportPage() {
  const [filter, setFilter] = useState<CategoryReportFilters>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    type: 'EXPENSE',
  });

  const { data: categoryReport, isLoading } = useCategoryReport(filter);

  // Chuyển đổi dữ liệu sang định dạng phù hợp với component
  const reportData = useMemo(() => convertToReportData(categoryReport), [categoryReport]);

  const handleFilterChange = (newFilter: ReportFilterParams) => {
    setFilter({
      startDate: new Date(newFilter.startDate),
      endDate: new Date(newFilter.endDate),
      type: newFilter.type || 'EXPENSE',
    });
  };

  return (
    <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6 md:py-8">
      <h1 className="mb-4 text-xl font-bold sm:text-2xl md:text-3xl">Báo cáo theo danh mục</h1>
      <ReportFilter onFilterChange={handleFilterChange} className="mb-3" showTypeFilter />
      <CategoryReport data={reportData} isLoading={isLoading} />
    </div>
  );
}
