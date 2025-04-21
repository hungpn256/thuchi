'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { ReportFilter } from '@/components/reports/ReportFilter';
import { SummaryReport } from '@/components/reports/SummaryReport';
import { ReportFilterParams } from '@/types/report';
import { useSummaryReport } from '@/hooks/use-reports';
import { format, subMonths } from 'date-fns';
import { useState } from 'react';

export default function ReportsPage() {
  const [filter, setFilter] = useState<ReportFilterParams>({
    startDate: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: summaryReport, isLoading } = useSummaryReport(filter);

  return (
    <main className="container mx-auto px-4 py-6">
      <PageHeader
        title="Báo cáo tổng quan"
        description="Xem tổng quan thu chi và phân tích theo thời gian"
      />

      <div className="space-y-6">
        <ReportFilter onFilterChange={setFilter} className="mb-6" />

        <SummaryReport data={summaryReport} isLoading={isLoading} />
      </div>
    </main>
  );
}
