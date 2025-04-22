import { useQuery } from '@tanstack/react-query';
import axiosClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/constants/app.constant';
import { QUERY_KEYS } from '@/constants/query-keys.constant';
import {
  ReportFilterParams,
  SummaryReport,
  CategoryReport,
  TrendReport,
  TrendFilterParams,
  CategoryReportFilters,
} from '@/types/report';
import { format } from 'date-fns';

const formatDateIfNeeded = (date: Date | string): string => {
  if (date instanceof Date) {
    return format(date, 'yyyy-MM-dd');
  }
  return date;
};

export const useSummaryReport = (filter: ReportFilterParams) => {
  const formattedFilter = {
    ...filter,
    startDate: formatDateIfNeeded(filter.startDate),
    endDate: formatDateIfNeeded(filter.endDate),
  };

  return useQuery<SummaryReport>({
    queryKey: QUERY_KEYS.REPORTS.SUMMARY(formattedFilter),
    queryFn: async () => {
      const { data } = await axiosClient.get(API_ENDPOINTS.REPORTS.SUMMARY, {
        params: formattedFilter,
      });
      return data;
    },
  });
};

export function useCategoryReport(filter: CategoryReportFilters) {
  const formattedFilter = {
    startDate: formatDateIfNeeded(filter.startDate),
    endDate: formatDateIfNeeded(filter.endDate),
  };

  return useQuery<CategoryReport>({
    queryKey: QUERY_KEYS.REPORTS.CATEGORIES(formattedFilter),
    queryFn: async () => {
      const { data } = await axiosClient.get(API_ENDPOINTS.REPORTS.CATEGORIES, {
        params: {
          ...formattedFilter,
          type: filter.type,
        },
      });
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export const useTrendReport = (filter: TrendFilterParams) => {
  const formattedFilter = {
    ...filter,
    startDate: formatDateIfNeeded(filter.startDate),
    endDate: formatDateIfNeeded(filter.endDate),
    compareStartDate: filter.compareStartDate
      ? formatDateIfNeeded(filter.compareStartDate)
      : undefined,
    compareEndDate: filter.compareEndDate ? formatDateIfNeeded(filter.compareEndDate) : undefined,
  };

  return useQuery<TrendReport>({
    queryKey: QUERY_KEYS.REPORTS.TRENDS(formattedFilter),
    queryFn: async () => {
      const { data } = await axiosClient.get(API_ENDPOINTS.REPORTS.TRENDS, {
        params: formattedFilter,
      });
      return data;
    },
  });
};
