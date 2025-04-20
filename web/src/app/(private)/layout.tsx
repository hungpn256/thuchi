"use client";

import { ROUTES, STORAGE_KEYS } from "@/constants/app.constant";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUserProfile } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface PrivateLayoutProps {
  children: React.ReactNode;
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if we're on mobile view initially
    setIsMobile(window.innerWidth < 1024);

    // Update on window resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      : null;

  const { isLoading, error } = useUserProfile();

  if (error || !token) {
    router.push(ROUTES.AUTH.LOGIN);
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar with responsive behavior */}
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-20 h-full flex-col border-r bg-sidebar text-sidebar-foreground shadow-sm transition-all duration-300 ease-in-out 
          ${
            isMobile
              ? sidebarOpen
                ? "translate-x-0 w-64"
                : "-translate-x-full w-64"
              : sidebarOpen
                ? "translate-x-0 w-64"
                : "translate-x-0 w-16"
          }`}
      >
        <Sidebar isCollapsed={!isMobile && !sidebarOpen} />
      </div>

      {/* Mobile toggle button (bottom left) */}
      {isMobile && (
        <div
          className={`fixed bottom-4 left-4 z-30 ${sidebarOpen ? "left-64 ml-4" : "left-4"} transition-all duration-300`}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="h-10 w-10 rounded-full bg-background shadow-md hover:bg-primary hover:text-primary-foreground"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>
      )}

      {/* Desktop toggle button (on sidebar) */}
      {!isMobile && (
        <div
          className={`fixed top-4 ${sidebarOpen ? "left-56" : "left-8"} z-30 transition-all duration-300`}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 rounded-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {sidebarOpen ? (
              <ChevronsLeft size={16} />
            ) : (
              <ChevronsRight size={16} />
            )}
          </Button>
        </div>
      )}

      {/* Main content with responsive padding */}
      <div
        className={`flex-1 transition-all duration-300
          ${isMobile ? "pl-0" : sidebarOpen ? "pl-64" : "pl-16"}`}
      >
        {children}
      </div>
    </div>
  );
}
