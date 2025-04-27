'use client';

import { Button } from '@/components/ui/button';
import { ROUTES, STORAGE_KEYS } from '@/constants/app.constant';
import { cn } from '@/lib/utils';
import {
  Calendar,
  CreditCard,
  Home,
  LayoutDashboard,
  LineChart,
  LogOut,
  PieChart,
  Plus,
  Settings,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '../theme/theme-toggle';
import { useUserProfile } from '@/hooks/use-user';
import { AnimatePresence, motion } from 'framer-motion';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  isCollapsed?: boolean;
  setIsCollapsed?: (isCollapsed: boolean) => void;
}

export function Sidebar({
  isCollapsed: propIsCollapsed,
  setIsCollapsed: propSetIsCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { data: profile } = useUserProfile();

  // Use prop if provided, otherwise detect if sidebar is in collapsed state
  useEffect(() => {
    if (propIsCollapsed !== undefined) {
      setIsCollapsed(propIsCollapsed);
    } else {
      const checkIfCollapsed = () => {
        const sidebarElement = document.querySelector('[data-sidebar]');
        if (sidebarElement) {
          setIsCollapsed(sidebarElement.clientWidth < 64);
        }
      };

      checkIfCollapsed();

      // Use ResizeObserver to detect changes in sidebar width
      const resizeObserver = new ResizeObserver(() => {
        checkIfCollapsed();
      });

      const sidebarElement = document.querySelector('[data-sidebar]');
      if (sidebarElement) {
        resizeObserver.observe(sidebarElement);
      }

      return () => {
        if (sidebarElement) {
          resizeObserver.unobserve(sidebarElement);
        }
      };
    }
  }, [propIsCollapsed]);

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

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

  function handleLogout(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    router.push(ROUTES.AUTH.LOGIN);
  }

  const handleCreateTransaction = () => {
    router.push(ROUTES.TRANSACTIONS.NEW);
  };

  useEffect(() => {
    if (isMobile) {
      propSetIsCollapsed?.(false);
    }
  }, [pathname, propSetIsCollapsed]);

  // Animation variants for sidebar
  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 30,
      },
    },
    closed: {
      x: '-100%',
      opacity: 0.5,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
      },
    },
  };

  // Animation variants for sidebar items
  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.07, delayChildren: 0.2 },
    },
    closed: {
      opacity: 0,
      y: 20,
      transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
  };

  // Animation variants for sidebar item children
  const childVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        y: { stiffness: 1000, velocity: -100 },
      },
    },
    closed: {
      y: 50,
      opacity: 0,
      transition: {
        y: { stiffness: 1000 },
      },
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="flex h-full flex-col"
        data-sidebar
        initial={isMobile ? 'closed' : 'open'}
        animate={isMobile && isCollapsed ? 'closed' : 'open'}
        variants={isMobile ? sidebarVariants : {}}
      >
        <div
          className={cn(
            'flex h-14 items-center border-b px-6',
            isCollapsed && 'justify-center px-0',
          )}
        >
          <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
            {!isCollapsed && (
              <span className="text-sidebar-foreground text-xl font-bold">Thu Chi</span>
            )}
          </Link>

          {/* Show theme toggle only on mobile in expanded sidebar */}
          {isMobile && !isCollapsed && (
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          )}
        </div>

        {!isCollapsed && (
          <motion.div className="px-4 pt-4" variants={itemVariants}>
            <motion.div variants={childVariants}>
              <Button
                onClick={handleCreateTransaction}
                className="from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary w-full gap-2 bg-gradient-to-r"
              >
                <Plus className="h-4 w-4" />
                Tạo giao dịch mới
              </Button>
            </motion.div>
          </motion.div>
        )}

        {isCollapsed && (
          <div className="flex justify-center py-4">
            <Button
              size="icon"
              onClick={handleCreateTransaction}
              className="bg-primary text-primary-foreground h-10 w-10 rounded-full"
              title="Tạo giao dịch mới"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        )}

        <motion.nav className="flex-1 overflow-y-auto py-4" variants={itemVariants}>
          <ul className={cn('space-y-1', isCollapsed ? 'px-0' : 'px-2')}>
            {sidebarItems.map((item) => (
              <motion.li
                key={item.href}
                className={isCollapsed ? 'flex justify-center' : ''}
                variants={childVariants}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-3 rounded-md transition-colors',
                    isCollapsed ? 'h-10 w-10 justify-center p-0' : 'px-3 py-2',
                    pathname === item.href
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground/80',
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.nav>

        {/* Mobile Collapsed - User Profile & Logout at bottom */}
        {isMobile && isCollapsed && (
          <div className="mt-auto flex flex-col items-center gap-3 border-t py-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              title="Thông tin cá nhân"
              onClick={() => router.push('/profile')}
            >
              <User className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-10 w-10 rounded-full"
              title="Đăng xuất"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Expanded - User Profile & Logout at bottom */}
        {!isCollapsed && (
          <motion.div className="mt-auto border-t pt-2" variants={itemVariants}>
            {!isMobile && (
              <div className="px-4 py-2">
                <motion.div
                  className="bg-sidebar-accent/50 rounded-md p-3 text-center text-sm"
                  variants={childVariants}
                >
                  <p className="mb-1 font-medium">Thu Chi App</p>
                  <p className="text-sidebar-foreground/70 text-xs">Phiên bản 1.0.0</p>
                </motion.div>
              </div>
            )}

            <motion.div className="px-4 py-2" variants={childVariants}>
              <div className="flex items-center gap-3 px-2 py-2">
                <User className="h-5 w-5" />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">{profile?.email}</p>
                  <Link href="/profile" className="text-muted-foreground text-xs hover:underline">
                    Thông tin cá nhân
                  </Link>
                </div>
                {isMobile && <ThemeToggle />}
              </div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button variant="destructive" onClick={handleLogout} className="mt-2 w-full gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
