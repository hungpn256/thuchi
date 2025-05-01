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
import { ROUTES } from '@/constants/app.constant';
import { useUserProfile } from '@/hooks/use-user';
import { useSwitchProfile } from '@/hooks/use-switch-profile';
import { LogOut, User, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '../theme/theme-toggle';
import { isIOS } from '@/utils/device';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
  const { data: user } = useUserProfile();
  const switchProfile = useSwitchProfile();
  const router = useRouter();
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const { logout } = useAuth();

  // Check if device is iOS
  useEffect(() => {
    setIsIOSDevice(isIOS());
  }, []);

  function handleLogout(): void {
    logout();
    router.push(ROUTES.AUTH.LOGIN);
  }

  const handleSwitchProfile = async (profileId: number) => {
    try {
      await switchProfile.mutateAsync({ profileId });
    } catch (error) {
      console.error('Failed to switch profile:', error);
    }
  };

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
                  <span className="hidden md:inline-block">{user?.account?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">{user?.account?.email}</p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {user?.profile?.name}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user?.account?.profileUsers?.map((profileUser) => (
                  <DropdownMenuItem
                    key={profileUser.id}
                    className={cn(
                      'cursor-pointer',
                      profileUser.profileId === user?.profile?.id && 'bg-accent',
                    )}
                    onClick={() => handleSwitchProfile(Number(profileUser.profileId))}
                  >
                    {profileUser.profile?.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push('/profiles/create')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Tạo hồ sơ mới</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={handleLogout}
                >
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
