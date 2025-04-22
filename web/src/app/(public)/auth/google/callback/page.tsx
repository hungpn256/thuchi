'use client';

import axiosClient from '@/lib/axios-client';
import { useEffect } from 'react';
import { ROUTES, STORAGE_KEYS } from '@/constants/app.constant';
import { useRouter } from 'next/navigation';
import { isIOSPWA } from '@/utils/device';

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

        // Send data to parent window if in popup mode
        if (window.opener) {
          window.opener.postMessage(data, window.location.origin);
          window.close();
          return;
        }

        // Handle direct mode (PWA on iOS or when no opener)
        // Store tokens in localStorage
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);

        // Clean URL by removing the code parameter
        window.history.replaceState({}, document.title, window.location.pathname);

        // Redirect to dashboard - kiểm tra nếu là PWA trên iOS
        if (isIOSPWA()) {
          // Sử dụng window.location để đảm bảo trang được tải lại hoàn toàn
          window.location.href = ROUTES.DASHBOARD;
        } else {
          // Các thiết bị khác sử dụng router.push tiêu chuẩn
          router.push(ROUTES.DASHBOARD);
        }
      } catch (error) {
        console.error('Google authentication error:', error);

        // Send error to parent window if in popup mode
        if (window.opener) {
          window.opener.postMessage({ error: error }, window.location.origin);
          window.close();
          return;
        }

        // In direct mode, redirect to login page with error
        router.push(ROUTES.AUTH.LOGIN);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
}
