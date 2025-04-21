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
import { cn } from '@/lib/utils';
import { CalendarIcon, SearchIcon } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ReportFilterParams, TransactionType } from '@/types/report';

interface ReportFilterProps {
  onFilterChange: (filter: ReportFilterParams) => void;
  showTypeFilter?: boolean;
  className?: string;
}

export function ReportFilter({
  onFilterChange,
  showTypeFilter = false,
  className,
}: ReportFilterProps) {
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [type, setType] = useState<TransactionType | undefined>(
    showTypeFilter ? 'EXPENSE' : undefined,
  );

  const handleApplyFilter = () => {
    onFilterChange({
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      type,
    });
  };

  return (
    <Card className={cn('shadow-sm', className)}>
      <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-4">
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
      </CardContent>
    </Card>
  );
}
