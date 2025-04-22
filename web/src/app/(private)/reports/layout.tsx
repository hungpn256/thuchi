'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/constants/app.constant';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PageHeader } from '@/components/common/PageHeader';

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const reportLinks = [
    { href: ROUTES.REPORTS.SUMMARY, label: 'Tổng quan' },
    { href: ROUTES.REPORTS.BY_CATEGORY, label: 'Theo danh mục' },
    { href: ROUTES.REPORTS.TRENDS, label: 'Xu hướng' },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Báo cáo tài chính"
        description="Phân tích và theo dõi tình hình tài chính của bạn"
      />

      <div className="mt-6 mb-8">
        <Tabs value={pathname} className="w-full">
          <TabsList className="w-full justify-start">
            {reportLinks.map((link) => (
              <Link key={link.href} href={link.href} passHref>
                <TabsTrigger value={link.href} className="cursor-pointer">
                  {link.label}
                </TabsTrigger>
              </Link>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {children}
    </div>
  );
}
