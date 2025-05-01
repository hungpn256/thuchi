'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useCreateProfile } from '@/hooks/use-create-profile';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getErrorMessage } from '@/utils/error';

export default function CreateProfilePage() {
  const router = useRouter();
  const createProfile = useCreateProfile();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name) {
      toast({
        title: 'Có lỗi xảy ra',
        description: 'Vui lòng nhập tên hồ sơ',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await createProfile.mutateAsync({ name });
      router.push('/profiles');
      toast({
        title: 'Thành công',
        description: 'Hồ sơ mới đã được tạo thành công',
      });
    } catch (error) {
      console.error('Lỗi khi tạo hồ sơ:', error);
      toast({
        title: 'Có lỗi xảy ra',
        description: getErrorMessage(error, 'Không thể tạo hồ sơ'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 md:px-6">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Tạo hồ sơ mới</CardTitle>
            <CardDescription>Tạo một hồ sơ mới để quản lý chi tiêu riêng biệt</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="mb-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên hồ sơ</Label>
                <Input
                  id="name"
                  placeholder="Nhập tên hồ sơ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  className="h-10"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang tạo...' : 'Tạo hồ sơ'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
