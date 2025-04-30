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

export default function CreateProfilePage() {
  const router = useRouter();
  const createProfile = useCreateProfile();
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: 'Vui lòng nhập tên profile',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createProfile.mutateAsync({ name });
      toast({
        title: 'Tạo profile thành công',
        variant: 'default',
      });
      router.push('/');
    } catch {
      toast({
        title: 'Tạo profile thất bại',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Tạo Profile Mới</CardTitle>
            <CardDescription>Tạo một profile mới để quản lý chi tiêu riêng biệt</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên Profile</Label>
                <Input
                  id="name"
                  placeholder="Nhập tên profile"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={createProfile.isPending}
                  className="h-10"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={createProfile.isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={createProfile.isPending}>
                {createProfile.isPending ? 'Đang tạo...' : 'Tạo Profile'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
