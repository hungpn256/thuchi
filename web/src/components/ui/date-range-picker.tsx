import * as React from 'react';
import { endOfDay, format, startOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMediaQuery } from '@/hooks/use-media-query';

interface DatePickerWithRangeProps {
  className?: string;
  date?: DateRange;
  setDate: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({ className, date, setDate }: DatePickerWithRangeProps) {
  const isMobile = useMediaQuery('(max-width: 640px)');

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'justify-start text-left font-normal',
              isMobile ? 'w-full' : 'w-[300px]',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'dd/MM/yyyy', { locale: vi })} -{' '}
                  {format(date.to, 'dd/MM/yyyy', { locale: vi })}
                </>
              ) : (
                format(date.from, 'dd/MM/yyyy', { locale: vi })
              )
            ) : (
              <span>Chọn khoảng thời gian</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(range) => {
              setDate({
                from: range?.from ? startOfDay(range?.from) : undefined,
                to: range?.to ? endOfDay(range?.to) : undefined,
              });
            }}
            numberOfMonths={isMobile ? 1 : 2}
            locale={vi}
            classNames={{
              day_selected: 'bg-primary text-primary-foreground',
              day_today: 'bg-accent text-accent-foreground',
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
