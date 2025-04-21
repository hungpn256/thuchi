'use client';

import { CategoryReport as CategoryReportType } from '@/types/report';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryReportData } from '@/types/report';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/format';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CategoryReportProps {
  data?: CategoryReportData;
  isLoading: boolean;
}

// Array of colors for the chart
const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#A259FF',
  '#FF5733',
  '#4BC0C0',
  '#E7E9ED',
  '#36A2EB',
];

export function CategoryReport({ data, isLoading }: CategoryReportProps) {
  // Function to get color based on index
  const getColor = (index: number) => {
    return COLORS[index % COLORS.length];
  };

  if (isLoading) {
    return <CategoryReportSkeleton />;
  }

  if (!data || data.categories.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-muted-foreground text-center">Không có dữ liệu để hiển thị</div>
        </CardContent>
      </Card>
    );
  }

  // Sort categories by amount (descending)
  const sortedCategories = [...data.categories].sort((a, b) => b.amount - a.amount);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Biểu đồ phân bổ theo danh mục</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sortedCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {sortedCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(index)} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(name) => `Danh mục: ${name}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết theo danh mục</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Danh mục</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead className="text-right">Tỷ lệ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCategories.map((category, index) => (
                <TableRow key={category.id || index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: getColor(index) }}
                      />
                      {category.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(category.amount)}</TableCell>
                  <TableCell className="text-right">
                    {((category.amount / data.total) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold">
                <TableCell>Tổng cộng</TableCell>
                <TableCell className="text-right">{formatCurrency(data.total)}</TableCell>
                <TableCell className="text-right">100%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryReportSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Biểu đồ phân bổ theo danh mục</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết theo danh mục</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-2 h-6 w-full" />
          <Skeleton className="mb-2 h-6 w-full" />
          <Skeleton className="mb-2 h-6 w-full" />
          <Skeleton className="mb-2 h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
