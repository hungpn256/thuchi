'use client';

import axiosClient from '@/lib/axios-client';
import { useEffect } from 'react';
import { ROUTES, STORAGE_KEYS } from '@/constants/app.constant';
import { useRouter } from 'next/navigation';

export default function GoogleCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (!code) {
          throw new Error('Không nhận được mã xác thực từ Google');
        }

        // Exchange code for tokens
        const { data } = await axiosClient.get(`/auth/login/google/callback`, {
          params: { code },
        });

        // Store tokens in localStorage
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);

        // Clean URL by removing the code parameter
        window.history.replaceState({}, document.title, window.location.pathname);

        // Redirect to dashboard
        router.push(ROUTES.DASHBOARD);
      } catch (error) {
        console.error('Google authentication error:', error);
        router.push(ROUTES.AUTH.LOGIN);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="border-primary mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted-foreground">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
}
