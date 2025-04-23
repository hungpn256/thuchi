'use client';

import { SummaryReport as SummaryReportType } from '@/types/report';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/format';

interface SummaryReportProps {
  data?: SummaryReportType;
  isLoading: boolean;
}

export function SummaryReport({ data, isLoading }: SummaryReportProps) {
  const chartData = useMemo(() => {
    if (!data?.monthlyData) {
      return [];
    }

    return data.monthlyData.map((item) => {
      const [year, month] = item.month.split('-');
      return {
        month: `${month}/${year}`,
        income: item.totalIncome,
        expense: item.totalExpense,
        balance: item.balance,
      };
    });
  }, [data?.monthlyData]);

  const totalIncome = data?.totalIncome ?? 0;
  const totalExpense = data?.totalExpense ?? 0;
  const balance = data?.balance ?? 0;

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="px-3 py-0.5 sm:px-4 sm:py-1">
              <div className="bg-muted h-3 w-16 rounded sm:h-4 sm:w-24"></div>
              <div className="bg-muted mt-1 h-5 w-24 rounded sm:h-6 sm:w-36"></div>
            </CardHeader>
            <CardContent className="px-3 py-1 sm:px-4 sm:py-1.5">
              <div className="bg-muted h-8 w-24 rounded sm:h-12 sm:w-32"></div>
            </CardContent>
          </Card>
        ))}
        <Card className="animate-pulse md:col-span-3">
          <CardHeader className="px-2 py-0.5 sm:px-2.5 sm:py-1">
            <div className="bg-muted h-4 w-32 rounded sm:h-5 sm:w-40"></div>
          </CardHeader>
          <CardContent className="px-2 py-1 sm:px-2.5 sm:py-1.5">
            <div className="bg-muted h-48 rounded sm:h-64"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
        <CardHeader className="px-3 py-0.5 sm:px-4 sm:py-1">
          <CardDescription className="text-xs sm:text-sm">Tổng thu</CardDescription>
          <CardTitle className="text-base font-bold text-green-600 sm:text-lg dark:text-green-400">
            {formatCurrency(totalIncome)}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 py-1 sm:px-4 sm:py-1.5">
          <p className="text-muted-foreground text-xs sm:text-sm">
            Thu nhập trong khoảng thời gian đã chọn
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
        <CardHeader className="px-3 py-0.5 sm:px-4 sm:py-1">
          <CardDescription className="text-xs sm:text-sm">Tổng chi</CardDescription>
          <CardTitle className="text-base font-bold text-red-600 sm:text-lg dark:text-red-400">
            {formatCurrency(totalExpense)}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 py-1 sm:px-4 sm:py-1.5">
          <p className="text-muted-foreground text-xs sm:text-sm">
            Chi tiêu trong khoảng thời gian đã chọn
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
        <CardHeader className="px-3 py-0.5 sm:px-4 sm:py-1">
          <CardDescription className="text-xs sm:text-sm">Chênh lệch</CardDescription>
          <CardTitle
            className={`text-base font-bold sm:text-lg ${
              balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatCurrency(balance)}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 py-1 sm:px-4 sm:py-1.5">
          <p className="text-muted-foreground text-xs sm:text-sm">
            {balance >= 0 ? 'Thặng dư (thu lớn hơn chi)' : 'Thâm hụt (chi lớn hơn thu)'}
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader className="px-2 py-0.5 sm:px-2.5 sm:py-1">
          <CardTitle className="text-base sm:text-lg">Biểu đồ thu chi theo tháng</CardTitle>
        </CardHeader>
        <CardContent className="px-2 py-1 sm:px-2.5 sm:py-1.5">
          <div className="h-56 sm:h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: window?.innerWidth < 640 ? 10 : 12 }} />
                <YAxis
                  tick={{ fontSize: window?.innerWidth < 640 ? 10 : 12 }}
                  width={window?.innerWidth < 640 ? 35 : 50}
                  tickFormatter={(value) => {
                    if (value >= 1000000) {
                      return (value / 1000000).toLocaleString('vi-VN') + 'M';
                    } else if (value >= 1000) {
                      return (value / 1000).toLocaleString('vi-VN') + 'K';
                    }
                    return value.toLocaleString('vi-VN');
                  }}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Tháng: ${label}`}
                  contentStyle={{ fontSize: window?.innerWidth < 640 ? '12px' : '14px' }}
                />
                <Legend
                  iconSize={window?.innerWidth < 640 ? 8 : 10}
                  wrapperStyle={{ fontSize: window?.innerWidth < 640 ? '11px' : '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Thu"
                  stroke="rgb(75, 192, 192)"
                  activeDot={{ r: window?.innerWidth < 640 ? 6 : 8 }}
                  strokeWidth={window?.innerWidth < 640 ? 1.5 : 2}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  name="Chi"
                  stroke="rgb(255, 99, 132)"
                  strokeWidth={window?.innerWidth < 640 ? 1.5 : 2}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  name="Chênh lệch"
                  stroke="rgb(54, 162, 235)"
                  strokeWidth={window?.innerWidth < 640 ? 1.5 : 2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
