'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { ReportFilter } from '@/components/reports/ReportFilter';
import { CategoryReport } from '@/components/reports/CategoryReport';
import { ReportFilterParams, CategoryReportFilters, TransactionType } from '@/types/report';
import { useCategoryReport } from '@/hooks/use-reports';
import { format, subMonths } from 'date-fns';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CategoryReportPage() {
  const [filter, setFilter] = useState<CategoryReportFilters>({
    startDate: subMonths(new Date(), 1),
    endDate: new Date(),
    type: 'EXPENSE',
  });

  const { data: categoryReport, isLoading } = useCategoryReport(filter);

  const handleFilterChange = (newFilter: ReportFilterParams) => {
    setFilter({
      startDate: new Date(newFilter.startDate),
      endDate: new Date(newFilter.endDate),
      type: newFilter.type || 'EXPENSE',
    });
  };

  return (
    <main className="container mx-auto px-4 py-6">
      <PageHeader
        title="Báo cáo theo danh mục"
        description="Phân tích chi tiêu và thu nhập theo danh mục"
      />

      <div className="space-y-6">
        <ReportFilter onFilterChange={handleFilterChange} className="mb-6" showTypeFilter />

        <Tabs
          defaultValue={filter.type}
          onValueChange={(value) => setFilter({ ...filter, type: value as TransactionType })}
        >
          <TabsList className="mb-6">
            <TabsTrigger value="EXPENSE">Chi tiêu</TabsTrigger>
            <TabsTrigger value="INCOME">Thu nhập</TabsTrigger>
          </TabsList>

          <TabsContent value="EXPENSE">
            <CategoryReport data={categoryReport} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="INCOME">
            <CategoryReport data={categoryReport} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
