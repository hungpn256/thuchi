'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES, STORAGE_KEYS } from '@/constants/app.constant';
import { useUserProfile } from '@/hooks/use-user';
import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '../theme/theme-toggle';
import { isIOS } from '@/utils/device';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function Header() {
  const { data: profile } = useUserProfile();
  const router = useRouter();
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  // Check if device is iOS
  useEffect(() => {
    setIsIOSDevice(isIOS());
  }, []);

  function handleLogout(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    router.push(ROUTES.AUTH.LOGIN);
  }

  return (
    <header
      className={cn(
        'bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 hidden w-full border-b backdrop-blur lg:block',
        isIOSDevice && 'pt-safe',
      )}
    >
      <div className="container mx-auto">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-2"></div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative">
                  <User className="mr-2 h-5 w-5" />
                  <span className="hidden md:inline-block">{profile?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Thông tin cá nhân</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
