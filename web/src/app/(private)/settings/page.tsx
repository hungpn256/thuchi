'use client';

import { useSettings } from '@/hooks/use-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const validationSchema = yup.object({
  defaultCurrency: yup.string().oneOf(['VND', 'USD', 'EUR', 'JPY']).required(),
  language: yup.string().oneOf(['vi', 'en']).required(),
  theme: yup.string().oneOf(['light', 'dark']).required(),
  notificationsEnabled: yup.boolean().required(),
});

type FormValues = yup.InferType<typeof validationSchema>;

export default function SettingsPage() {
  const { settings, isLoading, isUpdating, updateSettings } = useSettings();

  const form = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      defaultCurrency: 'VND',
      language: 'vi',
      theme: 'light',
      notificationsEnabled: true,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        defaultCurrency: settings.defaultCurrency as 'VND' | 'USD' | 'EUR' | 'JPY',
        language: settings.language as 'vi' | 'en',
        theme: settings.theme as 'light' | 'dark',
        notificationsEnabled: settings.notificationsEnabled,
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: FormValues) => {
    updateSettings(data);
  };

  return (
    <div className="container py-6">
      <h1 className="mb-6 text-3xl font-bold">Cài đặt</h1>

      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Tùy chọn người dùng</CardTitle>
          <CardDescription>Thay đổi cài đặt tài khoản và tùy chọn hiển thị</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="defaultCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đơn vị tiền tệ mặc định</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn đơn vị tiền tệ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="VND">VND (₫)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="JPY">JPY (¥)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Đơn vị tiền tệ mặc định được sử dụng trong các giao dịch
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngôn ngữ</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn ngôn ngữ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vi">Tiếng Việt</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Ngôn ngữ hiển thị của ứng dụng</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notificationsEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Thông báo</FormLabel>
                        <FormDescription>Bật/tắt thông báo từ ứng dụng</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu cài đặt'
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
