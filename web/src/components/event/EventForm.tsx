'use client';

import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn, formatAmount, unFormatAmount } from '@/lib/utils';
import { DialogFooter } from '@/components/ui/dialog';
import { EventEntity } from '@/types/event';

// Form data type
export interface EventFormValues {
  id?: number;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  expectedAmount: number;
  date: Date;
}

interface EventFormProps {
  defaultValues?: Partial<EventFormValues>;
  onSubmit: (data: EventFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  isEditing?: boolean;
}

export function EventForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  isEditing = false,
}: EventFormProps) {
  const form = useForm<EventFormValues>({
    defaultValues: {
      startTime: '08:00',
      endTime: '17:00',
      date: new Date(),
      name: '',
      description: '',
      expectedAmount: 0,
      ...defaultValues,
    },
  });

  const handleSubmit = async (data: EventFormValues) => {
    // Kiểm tra thời gian kết thúc phải sau thời gian bắt đầu
    if (data.endTime <= data.startTime) {
      form.setError('endTime', {
        type: 'custom',
        message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
      });
      return;
    }

    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Ngày sự kiện</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'EEEE, dd MMMM, yyyy', {
                            locale: vi,
                          })
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            rules={{ required: 'Tên sự kiện không được để trống' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tên sự kiện <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tên sự kiện" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập mô tả (tùy chọn)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    Thời gian bắt đầu
                  </FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    Thời gian kết thúc
                  </FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="expectedAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số tiền dự kiến (VND)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Nhập số tiền"
                      value={formatAmount(field.value?.toString() || '')}
                      onChange={(e) => {
                        const value = unFormatAmount(e.target.value);
                        field.onChange(value);
                      }}
                    />
                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      VND
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                {isEditing ? 'Đang cập nhật...' : 'Đang tạo...'}
              </>
            ) : (
              <>{isEditing ? 'Cập nhật sự kiện' : 'Tạo sự kiện'}</>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Hàm tiện ích để chuyển đổi sự kiện thành dữ liệu form
export function eventToFormValues(event: EventEntity): EventFormValues {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const startHours = startDate.getHours().toString().padStart(2, '0');
  const startMinutes = startDate.getMinutes().toString().padStart(2, '0');
  const startTime = `${startHours}:${startMinutes}`;

  const endHours = endDate.getHours().toString().padStart(2, '0');
  const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
  const endTime = `${endHours}:${endMinutes}`;

  return {
    id: event.id,
    name: event.name,
    description: event.description || '',
    startTime,
    endTime,
    date: startDate,
    expectedAmount: event.expectedAmount || 0,
  };
}

// Hàm tiện ích để chuyển đổi dữ liệu form thành dữ liệu sự kiện
export function formValuesToEventData(data: EventFormValues) {
  try {
    // Kiểm tra giá trị thời gian có đúng định dạng không
    if (!data.startTime || !data.endTime) {
      console.error('Missing time values:', { startTime: data.startTime, endTime: data.endTime });
      throw new Error('Missing time values');
    }

    // Tạo ngày bắt đầu từ date và startTime
    const startDate = new Date(data.date);
    const [startHour, startMinute] = data.startTime.split(':').map(Number);

    if (isNaN(startHour) || isNaN(startMinute)) {
      console.error('Invalid start time format:', data.startTime);
      throw new Error('Invalid start time format');
    }

    startDate.setHours(startHour, startMinute, 0, 0);
    console.log(`Setting start time to ${startHour}:${startMinute}`, {
      before: startDate.toISOString(),
      jsDate: startDate,
    });

    // Tạo ngày kết thúc từ date và endTime
    const endDate = new Date(data.date);
    const [endHour, endMinute] = data.endTime.split(':').map(Number);

    if (isNaN(endHour) || isNaN(endMinute)) {
      console.error('Invalid end time format:', data.endTime);
      throw new Error('Invalid end time format');
    }

    endDate.setHours(endHour, endMinute, 0, 0);
    console.log(`Setting end time to ${endHour}:${endMinute}`, {
      after: endDate.toISOString(),
      jsDate: endDate,
    });

    // Log để kiểm tra xem thời gian đã được set đúng chưa
    console.log('Form values:', {
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
    });

    console.log('Dates after setting hours/minutes:', {
      startDate: startDate.toLocaleString(),
      endDate: endDate.toLocaleString(),
    });

    // Đảm bảo chuỗi ISO có thời gian chính xác
    const startDateISO = startDate.toISOString();
    const endDateISO = endDate.toISOString();

    return {
      name: data.name,
      description: data.description,
      startDate: startDateISO,
      endDate: endDateISO,
      expectedAmount: data.expectedAmount || undefined,
    };
  } catch (error) {
    console.error('Error converting form values to event data:', error);

    // Fallback: tạo startDate và endDate với default time values
    const startDate = new Date(data.date);
    startDate.setHours(8, 0, 0, 0);

    const endDate = new Date(data.date);
    endDate.setHours(17, 0, 0, 0);

    return {
      name: data.name,
      description: data.description,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      expectedAmount: data.expectedAmount || undefined,
    };
  }
}
