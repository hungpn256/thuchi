import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { ThemeDetector } from '@/components/theme/theme-detector';
import './globals.css';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Thu Chi App',
  description: 'Ứng dụng quản lý thu chi cá nhân',
  manifest: '/manifest.json',
  themeColor: '#18181b',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Thu Chi',
  },
  formatDetection: {
    telephone: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <Script src="/pwa-theme.js" strategy="beforeInteractive" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${inter.className} safe-bottom`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ThemeDetector />
          <QueryProvider>{children}</QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
