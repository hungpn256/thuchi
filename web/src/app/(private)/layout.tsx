'use client';

import { ROUTES, STORAGE_KEYS } from '@/constants/app.constant';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useUserProfile } from '@/hooks/use-user';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CaslProvider } from '@/contexts/casl-context';
import { NotificationPermissionRequest } from '@/components/common/NotificationPermissionRequest';

interface PrivateLayoutProps {
  children: React.ReactNode;
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if we're on mobile view initially
    const isCurrentlyMobile = window.innerWidth < 1024;
    setIsMobile(isCurrentlyMobile);

    // Set sidebar state based on device type
    setSidebarOpen(!isCurrentlyMobile);

    // Update on window resize
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 1024;
      setIsMobile(newIsMobile);

      // Auto-collapse on mobile, auto-expand on desktop
      if (newIsMobile !== isMobile) {
        setSidebarOpen(!newIsMobile);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) : null;

  const { isLoading, error } = useUserProfile();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  if (error || !token) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <CaslProvider>
      <div className="flex min-h-screen">
        {/* Mobile overlay when sidebar is open */}
        {isMobile && sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-10 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar with responsive behavior */}
        <div
          ref={sidebarRef}
          className={`bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-20 h-full flex-col border-r shadow-sm transition-all duration-300 ease-in-out ${
            isMobile
              ? sidebarOpen
                ? 'w-64 translate-x-0'
                : 'w-64 -translate-x-full'
              : sidebarOpen
                ? 'w-64 translate-x-0'
                : 'w-16 translate-x-0'
          }`}
        >
          <Sidebar isCollapsed={!isMobile && !sidebarOpen} setIsCollapsed={setSidebarOpen} />
        </div>

        {/* Mobile toggle button (bottom left) */}
        {isMobile && (
          <div
            className={`fixed bottom-8 left-4 z-30 ${
              sidebarOpen ? 'left-64 ml-4' : 'left-4'
            } transition-all duration-300`}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSidebar}
              className="bg-background hover:bg-primary hover:text-primary-foreground h-12 w-12 rounded-full shadow-md"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        )}

        {/* Desktop toggle button (on sidebar) */}
        {!isMobile && (
          <div
            className={`fixed top-4 ${
              sidebarOpen ? 'left-56' : 'left-8'
            } z-30 transition-all duration-300`}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 w-8 rounded-full"
            >
              {sidebarOpen ? <ChevronsLeft size={16} /> : <ChevronsRight size={16} />}
            </Button>
          </div>
        )}

        {/* Main content with responsive padding */}
        <div
          className={`flex flex-1 flex-col transition-all duration-300 ${
            isMobile ? 'pl-0' : sidebarOpen ? 'pl-64' : 'pl-16'
          }`}
        >
          <Header />
          {children}
        </div>
      </div>
      <NotificationPermissionRequest />
    </CaslProvider>
  );
}
