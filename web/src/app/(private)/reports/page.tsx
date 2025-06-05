'use client';

import { ReportFilter } from '@/components/reports/ReportFilter';
import { SummaryReport } from '@/components/reports/SummaryReport';
import { ReportFilterParams } from '@/types/report';
import { useSummaryReport } from '@/hooks/use-reports';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useState, useEffect } from 'react';

export default function ReportsPage() {
  const [filter, setFilter] = useState<ReportFilterParams>({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);

  const { data: summaryReport, isLoading } = useSummaryReport(filter);

  // Save collapsed state to localStorage
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem('reportsFilterCollapsed');
    if (savedCollapsedState !== null) {
      setIsFilterCollapsed(savedCollapsedState === 'true');
    }
  }, []);

  const handleCollapsedChange = (collapsed: boolean) => {
    setIsFilterCollapsed(collapsed);
    localStorage.setItem('reportsFilterCollapsed', String(collapsed));
  };

  return (
    <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6 md:py-8">
      <h1 className="mb-4 text-xl font-bold sm:text-2xl md:text-3xl">Báo cáo tổng quan</h1>
      <div className="space-y-4 sm:space-y-6">
        <ReportFilter
          onFilterChange={setFilter}
          className="mb-4 sm:mb-6"
          isCollapsed={isFilterCollapsed}
          onCollapsedChange={handleCollapsedChange}
        />
        <SummaryReport data={summaryReport} isLoading={isLoading} />
      </div>
    </div>
  );
}
