"use client";

import { ROUTES } from "@/constants/app.constant";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CreditCard,
  Home,
  LayoutDashboard,
  LineChart,
  PieChart,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  isCollapsed?: boolean;
}

export function Sidebar({ isCollapsed: propIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Use prop if provided, otherwise detect if sidebar is in collapsed state
  useEffect(() => {
    if (propIsCollapsed !== undefined) {
      setIsCollapsed(propIsCollapsed);
    } else {
      const checkIfCollapsed = () => {
        const sidebarElement = document.querySelector("[data-sidebar]");
        if (sidebarElement) {
          setIsCollapsed(sidebarElement.clientWidth < 64);
        }
      };

      checkIfCollapsed();

      // Use ResizeObserver to detect changes in sidebar width
      const resizeObserver = new ResizeObserver(() => {
        checkIfCollapsed();
      });

      const sidebarElement = document.querySelector("[data-sidebar]");
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

  const sidebarItems: SidebarItem[] = [
    {
      name: "Tổng quan",
      href: ROUTES.DASHBOARD,
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Giao dịch",
      href: ROUTES.TRANSACTIONS,
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      name: "Sự kiện",
      href: ROUTES.EVENTS.LIST,
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: "Lịch",
      href: ROUTES.EVENTS.CALENDAR,
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      name: "Báo cáo",
      href: "/reports",
      icon: <PieChart className="w-5 h-5" />,
    },
    {
      name: "Phân tích",
      href: "/analytics",
      icon: <LineChart className="w-5 h-5" />,
    },
    {
      name: "Cài đặt",
      href: "/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <div className="flex h-full flex-col" data-sidebar>
      <div
        className={cn(
          "flex h-14 items-center border-b px-6",
          isCollapsed && "justify-center px-0"
        )}
      >
        <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
          {!isCollapsed && (
            <span className="text-xl font-bold text-sidebar-foreground">
              Thu Chi
            </span>
          )}
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className={cn("space-y-1", isCollapsed ? "px-0" : "px-2")}>
          {sidebarItems.map((item) => (
            <li
              key={item.href}
              className={isCollapsed ? "flex justify-center" : ""}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isCollapsed ? "w-10 h-10 justify-center p-0" : "px-3 py-2",
                  pathname === item.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/80"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                {item.icon}
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {!isCollapsed && (
        <div className="border-t p-4">
          <div className="rounded-md bg-sidebar-accent/50 p-3 text-center text-sm">
            <p className="mb-1 font-medium">Thu Chi App</p>
            <p className="text-xs text-sidebar-foreground/70">
              Phiên bản 1.0.0
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
