'use client';

import { TrendFilter } from '@/components/reports/TrendFilter';
import { TrendReport } from '@/components/reports/TrendReport';
import { TrendFilterParams } from '@/types/report';
import { useTrendReport } from '@/hooks/use-reports';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useState, useEffect } from 'react';

export default function TrendReportPage() {
  const [filter, setFilter] = useState<TrendFilterParams>({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);

  const { data: trendReport, isLoading } = useTrendReport(filter);

  // Save collapsed state to localStorage
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem('trendsFilterCollapsed');
    if (savedCollapsedState !== null) {
      setIsFilterCollapsed(savedCollapsedState === 'true');
    }
  }, []);

  const handleCollapsedChange = (collapsed: boolean) => {
    setIsFilterCollapsed(collapsed);
    localStorage.setItem('trendsFilterCollapsed', String(collapsed));
  };

  const handleFilterChange = (newFilter: TrendFilterParams) => {
    setFilter(newFilter);
  };

  return (
    <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6 md:py-8">
      <h1 className="mb-4 text-xl font-bold sm:text-2xl md:text-3xl">Xu hướng thu chi</h1>
      <div className="space-y-4 sm:space-y-6">
        <TrendFilter
          onFilterChange={handleFilterChange}
          className="mb-4 sm:mb-6"
          isCollapsed={isFilterCollapsed}
          onCollapsedChange={handleCollapsedChange}
        />
        <TrendReport data={trendReport} isLoading={isLoading} />
      </div>
    </div>
  );
}
