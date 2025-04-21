'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { CalendarIcon, SearchIcon } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ComparisonPeriod, TransactionType, TrendFilterParams } from '@/types/report';

interface TrendFilterProps {
  onFilterChange: (filter: TrendFilterParams) => void;
  showTypeFilter?: boolean;
  className?: string;
}

export function TrendFilter({
  onFilterChange,
  showTypeFilter = false,
  className,
}: TrendFilterProps) {
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [type, setType] = useState<TransactionType | undefined>(
    showTypeFilter ? 'EXPENSE' : undefined,
  );
  const [compareWith, setCompareWith] = useState<ComparisonPeriod>(ComparisonPeriod.PREVIOUS_MONTH);
  const [compareStartDate, setCompareStartDate] = useState<Date | undefined>();
  const [compareEndDate, setCompareEndDate] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState<string>('preset');

  const handleApplyFilter = () => {
    const filter: TrendFilterParams = {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      type,
      compareWith,
    };

    if (compareWith === ComparisonPeriod.CUSTOM && compareStartDate && compareEndDate) {
      filter.compareStartDate = format(compareStartDate, 'yyyy-MM-dd');
      filter.compareEndDate = format(compareEndDate, 'yyyy-MM-dd');
    }

    onFilterChange(filter);
  };

  return (
    <Card className={cn('shadow-sm', className)}>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Từ ngày</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, 'dd/MM/yyyy', { locale: vi })
                  ) : (
                    <span>Chọn ngày</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => setStartDate(date || subMonths(new Date(), 1))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Đến ngày</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'dd/MM/yyyy', { locale: vi }) : <span>Chọn ngày</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => setEndDate(date || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {showTypeFilter && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Loại giao dịch</label>
              <Select value={type} onValueChange={(value) => setType(value as TransactionType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Loại giao dịch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Thu</SelectItem>
                  <SelectItem value="EXPENSE">Chi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-end">
            <Button onClick={handleApplyFilter} className="w-full md:w-auto">
              <SearchIcon className="mr-2 h-4 w-4" />
              Áp dụng
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="mb-2 text-sm font-medium">So sánh với:</h3>
          <Tabs
            defaultValue="preset"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="preset">Mặc định</TabsTrigger>
              <TabsTrigger value="custom">Tùy chỉnh</TabsTrigger>
            </TabsList>
            <TabsContent value="preset" className="space-y-4">
              <Select
                value={compareWith}
                onValueChange={(value) => {
                  setCompareWith(value as ComparisonPeriod);
                  if (value === ComparisonPeriod.CUSTOM) {
                    setActiveTab('custom');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kỳ so sánh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ComparisonPeriod.PREVIOUS_WEEK}>Tuần trước</SelectItem>
                  <SelectItem value={ComparisonPeriod.PREVIOUS_MONTH}>Tháng trước</SelectItem>
                  <SelectItem value={ComparisonPeriod.PREVIOUS_YEAR}>Năm trước</SelectItem>
                  <SelectItem value={ComparisonPeriod.CUSTOM}>Tùy chỉnh...</SelectItem>
                </SelectContent>
              </Select>
            </TabsContent>
            <TabsContent value="custom" className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Từ ngày (kỳ so sánh)</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !compareStartDate && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {compareStartDate ? (
                        format(compareStartDate, 'dd/MM/yyyy', { locale: vi })
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={compareStartDate}
                      onSelect={(date) => {
                        setCompareStartDate(date);
                        setCompareWith(ComparisonPeriod.CUSTOM);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Đến ngày (kỳ so sánh)</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !compareEndDate && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {compareEndDate ? (
                        format(compareEndDate, 'dd/MM/yyyy', { locale: vi })
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={compareEndDate}
                      onSelect={(date) => {
                        setCompareEndDate(date);
                        setCompareWith(ComparisonPeriod.CUSTOM);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
