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
import { ROUTES } from "@/constants/app.constant";
import { cn } from "@/lib/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import { format, formatISO } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { useCreateEvent } from "@/hooks/use-events";

interface FormValues {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  expectedAmount?: number;
}

const formSchema = yup.object<FormValues>().shape({
  name: yup
    .string()
    .min(1, "Vui lòng nhập tên sự kiện")
    .max(255, "Tên sự kiện không được quá 255 ký tự")
    .required("Vui lòng nhập tên sự kiện"),
  description: yup
    .string()
    .max(255, "Mô tả không được quá 255 ký tự")
    .optional(),
  startDate: yup.date().required("Vui lòng chọn ngày bắt đầu"),
  endDate: yup
    .date()
    .min(yup.ref("startDate"), "Ngày kết thúc phải sau ngày bắt đầu")
    .required("Vui lòng chọn ngày kết thúc"),
  expectedAmount: yup
    .number()
    .typeError("Số tiền không hợp lệ")
    .min(0, "Số tiền phải lớn hơn 0")
    .optional(),
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

export default function NewEventPage() {
  const router = useRouter();
  const { mutate: createEvent, isPending } = useCreateEvent();

  const form = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    createEvent(
      {
        ...values,
        startDate: formatISO(values.startDate),
        endDate: formatISO(values.endDate),
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
          <h1 className="text-3xl font-bold tracking-tight">Tạo sự kiện mới</h1>
        </div>

        <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-neumorphic-dark border-white/20 border bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên sự kiện</FormLabel>
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
                      <Input placeholder="Nhập mô tả" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Ngày bắt đầu</FormLabel>
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
                                format(field.value, "EEEE, dd/MM/yyyy", {
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
                            locale={vi}
                            disabled={(date) =>
                              date < new Date("1900-01-01") ||
                              date > new Date("2100-01-01")
                            }
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
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Ngày kết thúc</FormLabel>
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
                                format(field.value, "EEEE, dd/MM/yyyy", {
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
                            locale={vi}
                            disabled={(date) =>
                              date < new Date("1900-01-01") ||
                              date > new Date("2100-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                    <FormLabel>Số tiền dự kiến</FormLabel>
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

              <Button
                type="submit"
                className="w-full relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-primary-50 font-medium shadow-lg shadow-primary-500/25 dark:shadow-none transition-all duration-300 group/button"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.07] to-transparent opacity-0 group-hover/button:opacity-100 transition-opacity" />
                {isPending ? "Đang tạo sự kiện..." : "Tạo sự kiện"}
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
