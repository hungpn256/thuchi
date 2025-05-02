'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ReportFilterParams, TransactionType } from '@/types/report';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon, Filter, SearchIcon } from 'lucide-react';
import { useState } from 'react';

interface ReportFilterProps {
  onFilterChange: (filter: ReportFilterParams) => void;
  showTypeFilter?: boolean;
  className?: string;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function ReportFilter({
  onFilterChange,
  showTypeFilter = false,
  className,
  isCollapsed = false,
  onCollapsedChange,
}: ReportFilterProps) {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [type, setType] = useState<TransactionType | undefined>(
    showTypeFilter ? 'EXPENSE' : undefined,
  );
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  // Determine if component is controlled or uncontrolled
  const collapsed = onCollapsedChange !== undefined ? isCollapsed : internalCollapsed;

  const toggleCollapsed = () => {
    if (onCollapsedChange) {
      onCollapsedChange(!collapsed);
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  const handleApplyFilter = () => {
    onFilterChange({
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      type,
    });
  };

  return (
    <div className={className}>
      <Button variant="outline" onClick={toggleCollapsed} className="gap-2" size="sm">
        <Filter className="h-4 w-4" />
        <span className="hidden sm:inline">Bộ lọc</span>
      </Button>

      {!collapsed && (
        <Card className="mt-3 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4 md:gap-3">
              <div className="flex flex-col gap-1 sm:gap-2">
                <label className="text-xs font-medium sm:text-sm">Từ ngày</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        'h-8 w-full justify-start text-left text-xs font-normal sm:h-9 sm:text-sm',
                        !startDate && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
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
                      onSelect={(date) => setStartDate(date || startOfMonth(new Date()))}
                      initialFocus
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-1 sm:gap-2">
                <label className="text-xs font-medium sm:text-sm">Đến ngày</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        'h-8 w-full justify-start text-left text-xs font-normal sm:h-9 sm:text-sm',
                        !endDate && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                      {endDate ? (
                        format(endDate, 'dd/MM/yyyy', { locale: vi })
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => setEndDate(date || endOfMonth(new Date()))}
                      initialFocus
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {showTypeFilter && (
                <div className="flex flex-col gap-1 sm:gap-2">
                  <label className="text-xs font-medium sm:text-sm">Loại giao dịch</label>
                  <Select value={type} onValueChange={(value) => setType(value as TransactionType)}>
                    <SelectTrigger className="h-8 text-xs sm:h-9 sm:text-sm">
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
                <Button
                  onClick={handleApplyFilter}
                  className="h-8 w-full text-xs sm:h-9 sm:text-sm"
                  size="sm"
                >
                  <SearchIcon className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                  Áp dụng
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
