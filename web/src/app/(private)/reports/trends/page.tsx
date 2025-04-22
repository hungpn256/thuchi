'use client';

import { TrendFilter } from '@/components/reports/TrendFilter';
import { TrendReport } from '@/components/reports/TrendReport';
import { TrendFilterParams } from '@/types/report';
import { useTrendReport } from '@/hooks/use-reports';
import { format, subMonths } from 'date-fns';
import { useState } from 'react';

export default function TrendReportPage() {
  const [filter, setFilter] = useState<TrendFilterParams>({
    startDate: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: trendReport, isLoading } = useTrendReport(filter);

  const handleFilterChange = (newFilter: TrendFilterParams) => {
    setFilter(newFilter);
  };

  return (
    <div className="space-y-6">
      <TrendFilter onFilterChange={handleFilterChange} className="mb-6" />

      <TrendReport data={trendReport} isLoading={isLoading} />
    </div>
  );
}
