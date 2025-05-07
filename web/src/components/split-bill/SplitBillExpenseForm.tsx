import { Button } from '@/components/ui/button';
import { SplitBillMember, SplitBillExpense } from '@/hooks/use-split-bill-groups';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatAmount, unFormatAmount } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

const expenseSchema = yup.object({
  payerId: yup.string().required('Chọn người chi').min(1, 'Chọn người chi'),
  amount: yup
    .number()
    .typeError('Nhập số tiền hợp lệ')
    .positive('Nhập số tiền hợp lệ')
    .required('Nhập số tiền hợp lệ'),
  description: yup.string().required('').default(''),
});

type ExpenseFormValues = yup.InferType<typeof expenseSchema>;

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface SplitBillExpenseFormProps {
  members: SplitBillMember[];
  onSubmit: (expense: SplitBillExpense) => void;
}

export function SplitBillExpenseForm({ members, onSubmit }: SplitBillExpenseFormProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: yupResolver(expenseSchema),
    defaultValues: {
      payerId: members[0]?.id || '',
      amount: 0,
      description: '',
    },
  });

  const handleSubmit = (values: ExpenseFormValues) => {
    onSubmit({
      id: genId(),
      payerId: values.payerId,
      amount: values.amount,
      description: values.description?.trim() || '',
      createdAt: new Date().toISOString(),
    });
    form.reset();
    toast({
      title: 'Đã thêm khoản chi',
      description: 'Khoản chi đã được thêm vào nhóm.',
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="payerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Người chi</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn thành viên" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    min={0}
                    step={1000}
                    placeholder="0"
                    {...field}
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
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Input placeholder="Ví dụ: Tiền taxi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="default" className="w-full">
          Thêm khoản chi
        </Button>
      </form>
    </Form>
  );
}
