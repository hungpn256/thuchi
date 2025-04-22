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
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="bg-muted h-4 w-24 rounded"></div>
              <div className="bg-muted mt-1 h-6 w-36 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted h-12 w-32 rounded"></div>
            </CardContent>
          </Card>
        ))}
        <Card className="animate-pulse md:col-span-3">
          <CardHeader>
            <div className="bg-muted h-5 w-40 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted h-64 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
        <CardHeader className="pb-2">
          <CardDescription>Tổng thu</CardDescription>
          <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalIncome)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Thu nhập của bạn trong khoảng thời gian đã chọn
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
        <CardHeader className="pb-2">
          <CardDescription>Tổng chi</CardDescription>
          <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(totalExpense)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Chi tiêu của bạn trong khoảng thời gian đã chọn
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
        <CardHeader className="pb-2">
          <CardDescription>Chênh lệch</CardDescription>
          <CardTitle
            className={`text-2xl font-bold ${
              balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatCurrency(balance)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {balance >= 0 ? 'Thặng dư (thu lớn hơn chi)' : 'Thâm hụt (chi lớn hơn thu)'}
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Biểu đồ thu chi theo tháng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
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
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Thu"
                  stroke="rgb(75, 192, 192)"
                  activeDot={{ r: 8 }}
                />
                <Line type="monotone" dataKey="expense" name="Chi" stroke="rgb(255, 99, 132)" />
                <Line
                  type="monotone"
                  dataKey="balance"
                  name="Chênh lệch"
                  stroke="rgb(54, 162, 235)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
