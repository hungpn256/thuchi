'use client';

import { TrendReport as TrendReportType } from '@/types/report';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercentage } from '@/lib/format';

interface TrendReportProps {
  data: TrendReportType;
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
    } catch (error) {
      return `${startDate} - ${endDate}`;
    }
  };

  if (isLoading) {
    return (
      <div>
        <Card className="mb-6 animate-pulse">
          <CardHeader>
            <div className="bg-muted h-5 w-64 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="bg-muted h-4 w-48 rounded"></div>
              <div className="bg-muted h-4 w-56 rounded"></div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="bg-muted h-4 w-24 rounded"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <div className="bg-muted h-6 w-24 rounded"></div>
                  <div className="bg-muted h-6 w-16 rounded"></div>
                </div>
                <div className="bg-muted h-4 w-32 rounded"></div>
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
        <CardHeader>
          <CardTitle>Không có dữ liệu</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Không có dữ liệu xu hướng trong khoảng thời gian đã chọn.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Phân tích xu hướng{' '}
            {data.type === 'INCOME' ? 'thu nhập' : data.type === 'EXPENSE' ? 'chi tiêu' : 'thu chi'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-muted-foreground">
              <strong>Kỳ hiện tại:</strong>{' '}
              {getDateRange(data.currentStartDate, data.currentEndDate)}
            </p>
            <p className="text-muted-foreground">
              <strong>Kỳ so sánh ({getPeriodLabel()}):</strong>{' '}
              {getDateRange(data.previousStartDate, data.previousEndDate)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {data.comparisons.map((item, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-2xl font-bold">{formatCurrency(item.currentValue)}</span>
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
              <p className="text-muted-foreground text-sm">
                Kỳ trước: {formatCurrency(item.previousValue)}
                {item.changeValue !== 0 && (
                  <span
                    className={
                      item.changeValue > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }
                  >
                    {' ('}
                    {item.changeValue > 0 ? '+' : ''}
                    {formatCurrency(item.changeValue)}
                    {')'}
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
