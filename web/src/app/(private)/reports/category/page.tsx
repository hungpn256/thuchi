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
import { subMonths } from 'date-fns';
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
    startDate: subMonths(new Date(), 1),
    endDate: new Date(),
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
    <div className="space-y-6">
      <ReportFilter onFilterChange={handleFilterChange} className="mb-6" showTypeFilter />
      <CategoryReport data={reportData} isLoading={isLoading} />
    </div>
  );
}
