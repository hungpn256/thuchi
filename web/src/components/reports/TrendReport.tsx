'use client';

import { TrendReport as TrendReportType } from '@/types/report';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercentage } from '@/lib/format';

interface TrendReportProps {
  data?: TrendReportType;
  isLoading: boolean;
}

export function TrendReport({ data, isLoading }: TrendReportProps) {
  const getPeriodLabel = () => {
    if (data) {
      if (data.comparisonPeriod === 'PREVIOUS_WEEK') {
        return 'tuần trước';
      } else if (data.comparisonPeriod === 'PREVIOUS_MONTH') {
        return 'tháng trước';
      } else if (data.comparisonPeriod === 'PREVIOUS_YEAR') {
        return 'năm trước';
      } else {
        return 'kỳ trước';
      }
    }
    return '';
  };

  const getDateRange = (startDate: string, endDate: string) => {
    try {
      return `${format(parseISO(startDate), 'dd/MM/yyyy', { locale: vi })} - ${format(
        parseISO(endDate),
        'dd/MM/yyyy',
        { locale: vi },
      )}`;
    } catch {
      return `${startDate} - ${endDate}`;
    }
  };

  if (isLoading) {
    return (
      <div>
        <Card className="mb-4 animate-pulse">
          <CardHeader className="px-2 py-0.5 sm:px-2.5 sm:py-1">
            <div className="bg-muted h-5 w-64 rounded"></div>
          </CardHeader>
          <CardContent className="px-2 py-0.5 sm:px-2.5 sm:py-1">
            <div className="space-y-1">
              <div className="bg-muted h-4 w-48 rounded"></div>
              <div className="bg-muted h-4 w-56 rounded"></div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="px-3 py-0.5 sm:px-4 sm:py-1">
                <div className="bg-muted h-4 w-24 rounded"></div>
              </CardHeader>
              <CardContent className="px-3 py-1 sm:px-4 sm:py-1.5">
                <div className="flex justify-between">
                  <div className="bg-muted h-6 w-24 rounded"></div>
                  <div className="bg-muted h-6 w-16 rounded"></div>
                </div>
                <div className="bg-muted mt-0.5 h-4 w-32 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data || !data.comparisons || data.comparisons.length === 0) {
    return (
      <Card>
        <CardHeader className="px-2 py-0.5 sm:px-2.5 sm:py-1">
          <CardTitle>Không có dữ liệu</CardTitle>
        </CardHeader>
        <CardContent className="px-2 py-0.5 sm:px-2.5 sm:py-1">
          <p className="text-muted-foreground">
            Không có dữ liệu xu hướng trong khoảng thời gian đã chọn.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card className="mb-4">
        <CardHeader className="px-2 py-0.5 sm:px-2.5 sm:py-1">
          <CardTitle className="text-base sm:text-lg">
            Phân tích xu hướng{' '}
            {data.type === 'INCOME' ? 'thu nhập' : data.type === 'EXPENSE' ? 'chi tiêu' : 'thu chi'}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 py-0.5 sm:px-2.5 sm:py-1">
          <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 sm:gap-1">
            <p className="text-muted-foreground text-xs sm:text-sm">
              <span className="font-semibold">Kỳ hiện tại:</span>{' '}
              {getDateRange(data.currentStartDate, data.currentEndDate)}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">
              <span className="font-semibold">Kỳ so sánh ({getPeriodLabel()}):</span>{' '}
              {getDateRange(data.previousStartDate, data.previousEndDate)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
        {data.comparisons.map((item, index) => {
          // Determine background color based on item name
          const bgClass = item.name.includes('Tổng thu')
            ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
            : item.name.includes('Tổng chi')
              ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20'
              : 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20';

          // Determine text color based on item name
          const titleColorClass = item.name.includes('Tổng thu')
            ? 'text-green-600 dark:text-green-400'
            : item.name.includes('Tổng chi')
              ? 'text-red-600 dark:text-red-400'
              : item.changeValue >= 0
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-red-600 dark:text-red-400';

          return (
            <Card key={index} className={bgClass}>
              <CardHeader className="px-3 py-0.5 sm:px-4 sm:py-1">
                <CardDescription className="text-xs sm:text-sm">{item.name}</CardDescription>
                <CardTitle className={`text-base font-bold sm:text-lg ${titleColorClass}`}>
                  {formatCurrency(item.currentValue)}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 py-1 sm:px-4 sm:py-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Kỳ trước: {formatCurrency(item.previousValue)}
                  </p>
                  <Badge
                    className={
                      item.changePercentage > 0
                        ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/30'
                        : item.changePercentage < 0
                          ? 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/30'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-800'
                    }
                  >
                    <span className="flex items-center gap-1">
                      {item.changePercentage > 0 ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : item.changePercentage < 0 ? (
                        <ArrowDown className="h-3 w-3" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                      {formatPercentage(item.changePercentage)}
                    </span>
                  </Badge>
                </div>
                {item.changeValue !== 0 && (
                  <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
                    <span
                      className={
                        item.changeValue > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      {item.changeValue > 0 ? '▲ +' : '▼ '}
                      {formatCurrency(item.changeValue)}
                    </span>
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
