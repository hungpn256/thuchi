'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useQuery } from '@tanstack/react-query';
import { yupResolver } from '@hookform/resolvers/yup';
import { format, formatISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArrowDownCircle, ArrowUpCircle, CalendarIcon } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import * as yup from 'yup';
import { CategoryCombobox } from '@/components/category-combobox';
import { QUERY_KEYS } from '@/constants/query-keys.constant';
import axiosClient from '@/lib/axios-client';
import { cn } from '@/lib/utils';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/use-transactions';
import { API_ENDPOINTS } from '@/constants/app.constant';

interface FormValues {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  date: Date;
  categoryId: number;
}

interface TransactionFormProps {
  transactionId?: number;
  onSuccess?: () => void;
  mode?: 'create' | 'update';
}

const formSchema = yup.object<FormValues>().shape({
  type: yup
    .string()
    .oneOf(['INCOME', 'EXPENSE'] as const, 'Vui lòng chọn loại giao dịch')
    .required('Vui lòng chọn loại giao dịch'),
  amount: yup
    .number()
    .typeError('Số tiền không hợp lệ')
    .min(0, 'Số tiền phải lớn hơn 0')
    .required('Vui lòng nhập số tiền'),
  description: yup
    .string()
    .min(1, 'Vui lòng nhập mô tả')
    .max(255, 'Mô tả không được quá 255 ký tự')
    .required('Vui lòng nhập mô tả'),
  date: yup.date().required('Vui lòng chọn ngày'),
  categoryId: yup.number().required('Vui lòng chọn danh mục'),
});

const formatAmount = (value: string) => {
  // Remove all non-digit characters
  const number = value.replace(/\D/g, '');
  // Format with thousand separators
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const unformatAmount = (value: string) => {
  // Remove all non-digit characters and convert to number
  return Number(value.replace(/\D/g, ''));
};

export function TransactionForm({
  transactionId,
  onSuccess,
  mode = 'create',
}: TransactionFormProps) {
  const { mutate: createTransaction, isPending: isCreating } = useCreateTransaction();
  const { mutate: updateTransaction, isPending: isUpdating } = useUpdateTransaction();

  const isPending = isCreating || isUpdating;

  const { data: transaction, isLoading } = useQuery({
    queryKey: QUERY_KEYS.TRANSACTIONS.DETAIL(transactionId),
    queryFn: async () => {
      if (typeof transactionId !== 'number') return null;
      const { data } = await axiosClient.get(
        `${API_ENDPOINTS.TRANSACTIONS.DETAIL}/${transactionId}`,
      );
      return data;
    },
    enabled: mode === 'update' && !!transactionId,
  });

  const form = useForm<FormValues>({
    resolver: yupResolver(formSchema),
    defaultValues: {
      type: 'EXPENSE',
      date: new Date(),
      amount: 0,
      description: '',
    },
  });

  // Cập nhật form values khi data được load
  React.useEffect(() => {
    if (transaction) {
      form.reset({
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        date: new Date(transaction.date),
        categoryId: transaction.categoryId,
      });
    }
  }, [transaction, form]);

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    const formattedValues = {
      ...values,
      date: formatISO(values.date),
    };

    if (mode === 'update' && transactionId) {
      updateTransaction(
        {
          id: transactionId,
          data: formattedValues,
        },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        },
      );
    } else {
      createTransaction(formattedValues, {
        onSuccess: () => {
          onSuccess?.();
        },
      });
    }
  };

  if (mode === 'update' && isLoading) {
    return <div className="p-4 text-center">Đang tải...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Loại giao dịch</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem value="EXPENSE" id="expense" className="peer sr-only" />
                    </FormControl>
                    <FormLabel
                      htmlFor="expense"
                      className="border-muted hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary flex flex-col items-center justify-between rounded-md border-2 bg-transparent p-4"
                    >
                      <ArrowDownCircle className="mb-3 h-6 w-6 text-rose-500" />
                      Chi tiêu
                    </FormLabel>
                  </FormItem>
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem value="INCOME" id="income" className="peer sr-only" />
                    </FormControl>
                    <FormLabel
                      htmlFor="income"
                      className="border-muted hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary flex flex-col items-center justify-between rounded-md border-2 bg-transparent p-4"
                    >
                      <ArrowUpCircle className="mb-3 h-6 w-6 text-emerald-500" />
                      Thu nhập
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số tiền</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    inputMode="numeric"
                    placeholder="Nhập số tiền"
                    {...field}
                    value={formatAmount(field.value?.toString() || '')}
                    onChange={(e) => {
                      const value = unformatAmount(e.target.value);
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

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Input placeholder="Nhập mô tả giao dịch" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Danh mục</FormLabel>
              <FormControl>
                <CategoryCombobox
                  value={field.value ? Number(field.value) : undefined}
                  onValueChange={(value) => field.onChange(Number(value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Ngày giao dịch</FormLabel>
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
                        format(field.value, 'dd/MM/yyyy', { locale: vi })
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
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(date);
                      }
                    }}
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onSuccess}>
            Hủy
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Đang lưu...' : mode === 'update' ? 'Lưu thay đổi' : 'Tạo giao dịch'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
