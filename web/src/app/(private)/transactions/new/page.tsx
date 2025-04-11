"use client";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ROUTES } from "@/constants/app.constant";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { cn } from "@/lib/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import { format, formatISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowDownCircle,
  ArrowLeft,
  ArrowUpCircle,
  CalendarIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { CategoryCombobox } from "@/components/category-combobox";

interface FormValues {
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string;
  date: Date;
  categoryId: number;
}

const formSchema = yup.object<FormValues>().shape({
  type: yup
    .string()
    .oneOf(["INCOME", "EXPENSE"] as const, "Vui lòng chọn loại giao dịch")
    .required("Vui lòng chọn loại giao dịch"),
  amount: yup
    .number()
    .typeError("Số tiền không hợp lệ")
    .min(0, "Số tiền phải lớn hơn 0")
    .required("Vui lòng nhập số tiền"),
  description: yup
    .string()
    .min(1, "Vui lòng nhập mô tả")
    .max(255, "Mô tả không được quá 255 ký tự")
    .required("Vui lòng nhập mô tả"),
  date: yup.date().required("Vui lòng chọn ngày"),
  categoryId: yup.number().required("Vui lòng chọn danh mục"),
});

const formatAmount = (value: string) => {
  // Remove all non-digit characters
  const number = value.replace(/\D/g, "");
  // Format with thousand separators
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const unformatAmount = (value: string) => {
  // Remove all non-digit characters and convert to number
  return Number(value.replace(/\D/g, ""));
};

export default function NewTransactionPage() {
  const router = useRouter();
  const { mutate: createTransaction, isPending } = useCreateTransaction();

  const form = useForm<FormValues>({
    resolver: yupResolver(formSchema),
    defaultValues: {
      type: "EXPENSE",
      date: new Date(),
      amount: 0,
      description: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    createTransaction(
      {
        ...values,
        date: formatISO(values.date),
      },
      {
        onSuccess: () => {
          router.push(ROUTES.DASHBOARD);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/10 via-background/50 to-background/80">
      <Header />
      <div className="container mx-auto max-w-2xl py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Tạo giao dịch mới
          </h1>
        </div>

        <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-neumorphic-dark border-white/20 border bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6">
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
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              value="EXPENSE"
                              id="expense"
                              className="peer sr-only"
                            />
                          </FormControl>
                          <FormLabel
                            htmlFor="expense"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <ArrowDownCircle className="mb-3 h-6 w-6 text-rose-500" />
                            Chi tiêu
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              value="INCOME"
                              id="income"
                              className="peer sr-only"
                            />
                          </FormControl>
                          <FormLabel
                            htmlFor="income"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
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
                          placeholder="Nhập số tiền"
                          {...field}
                          value={formatAmount(field.value?.toString() || "")}
                          onChange={(e) => {
                            const value = unformatAmount(e.target.value);
                            field.onChange(value);
                          }}
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground">
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
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd MMMM, yyyy", {
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
                          disabled={(date: Date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Đang xử lý..." : "Tạo giao dịch"}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
