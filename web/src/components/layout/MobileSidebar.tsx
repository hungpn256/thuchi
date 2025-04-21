'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ROUTES } from '@/constants/app.constant';
import { cn } from '@/lib/utils';
import {
  Calendar,
  CreditCard,
  Home,
  LayoutDashboard,
  LineChart,
  Menu,
  PieChart,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const sidebarItems: SidebarItem[] = [
    {
      name: 'Tổng quan',
      href: ROUTES.DASHBOARD,
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: 'Giao dịch',
      href: ROUTES.TRANSACTIONS.LIST,
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      name: 'Sự kiện',
      href: ROUTES.EVENTS.LIST,
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: 'Lịch',
      href: ROUTES.EVENTS.CALENDAR,
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: 'Báo cáo',
      href: '/reports',
      icon: <PieChart className="h-5 w-5" />,
    },
    {
      name: 'Phân tích',
      href: '/analytics',
      icon: <LineChart className="h-5 w-5" />,
    },
    {
      name: 'Cài đặt',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="px-2 lg:hidden" aria-label="Open sidebar">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-72 border-r p-0 sm:max-w-sm">
        <SheetHeader className="flex h-14 items-center justify-start border-b px-6">
          <SheetTitle className="text-xl font-bold">Thu Chi</SheetTitle>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {sidebarItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'hover:bg-accent flex items-center gap-3 rounded-md px-3 py-2 transition-colors',
                    pathname === item.href
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-foreground/80',
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t p-4">
          <div className="bg-muted rounded-md p-3 text-center text-sm">
            <p className="mb-1 font-medium">Thu Chi App</p>
            <p className="text-muted-foreground text-xs">Phiên bản 1.0.0</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
