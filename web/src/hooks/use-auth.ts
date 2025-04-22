/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import axiosClient from '@/lib/axios-client';
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  UseAuthReturn,
  RefreshTokenRequest,
} from '@/types/auth';
import { STORAGE_KEYS, ROUTES, API_ENDPOINTS } from '@/constants/app.constant';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Interface cho window.navigator bổ sung với thuộc tính standalone
interface SafariNavigator extends Navigator {
  standalone?: boolean;
}

// Interface bổ sung cho window object
interface WindowWithMSStream extends Window {
  MSStream?: any;
}

// Hàm kiểm tra liệu ứng dụng có đang chạy trong PWA trên iOS hay không
const isIOSPWA = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Kiểm tra iOS
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as WindowWithMSStream).MSStream;

  // Kiểm tra PWA mode - chế độ standalone hoặc fullscreen
  const isPWA =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as SafariNavigator).standalone === true;

  return isIOS && isPWA;
};

// Hàm lưu trạng thái đăng nhập cho chế độ redirect
const saveAuthState = (redirectUrl: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_redirect_pending', 'true');
    localStorage.setItem('auth_redirect_url', redirectUrl);
    localStorage.setItem('auth_redirect_timestamp', Date.now().toString());
  }
};

// Hàm kiểm tra nếu có redirect trở lại từ quá trình đăng nhập
const checkAuthRedirect = async (): Promise<AuthResponse | null> => {
  if (typeof window === 'undefined') return null;

  const isPending = localStorage.getItem('auth_redirect_pending') === 'true';
  if (!isPending) return null;

  // Xóa trạng thái để tránh xử lý nhiều lần
  localStorage.removeItem('auth_redirect_pending');

  // Kiểm tra thời gian (để tránh xử lý các trạng thái cũ)
  const timestamp = parseInt(localStorage.getItem('auth_redirect_timestamp') || '0', 10);
  if (Date.now() - timestamp > 5 * 60 * 1000) {
    // 5 phút timeout
    localStorage.removeItem('auth_redirect_url');
    localStorage.removeItem('auth_redirect_timestamp');
    return null;
  }

  // Nếu có code trong URL, xử lý callback
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (code) {
    try {
      const { data } = await axiosClient.get<AuthResponse>(`/auth/login/google/callback`, {
        params: { code },
      });

      localStorage.removeItem('auth_redirect_url');
      localStorage.removeItem('auth_redirect_timestamp');

      // Xóa code từ URL
      window.history.replaceState({}, document.title, window.location.pathname);

      return data;
    } catch (error) {
      console.error('Error handling auth redirect:', error);
      localStorage.removeItem('auth_redirect_url');
      localStorage.removeItem('auth_redirect_timestamp');
      return null;
    }
  }

  return null;
};

export const useAuth = (): UseAuthReturn => {
  const router = useRouter();
  const [error, setError] = useState<Error | null>(null);

  const { mutateAsync: login, isPending: isLoginLoading } = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        const { data } = await axiosClient.post<AuthResponse>(
          API_ENDPOINTS.AUTH.LOGIN,
          credentials,
        );

        // Store both tokens in localStorage
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);

        // Redirect to dashboard
        router.push(ROUTES.DASHBOARD);
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      }
    },
  });

  const { mutateAsync: register, isPending: isRegisterLoading } = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      try {
        const { data } = await axiosClient.post<AuthResponse>(
          API_ENDPOINTS.AUTH.REGISTER,
          credentials,
        );

        // Store both tokens in localStorage
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);

        // Redirect to dashboard
        router.push(ROUTES.DASHBOARD);
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      }
    },
  });

  // Kiểm tra auth redirect khi trang load
  const { mutateAsync: checkPendingAuth, isPending: isCheckingAuth } = useMutation({
    mutationFn: async () => {
      const authData = await checkAuthRedirect();
      if (authData) {
        // Lưu token và redirect
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken);
        router.push(ROUTES.DASHBOARD);
      }
    },
  });

  // Google login
  const { mutateAsync: loginWithGoogle, isPending: isGoogleLoading } = useMutation({
    mutationFn: async () => {
      try {
        // Get Google login URL
        const {
          data: { url },
        } = await axiosClient.get<{ url: string }>(API_ENDPOINTS.AUTH.LOGIN_GOOGLE);

        // Kiểm tra xem có đang chạy trong PWA trên iOS hay không
        if (isIOSPWA()) {
          // Trên iOS PWA: Dùng redirect toàn trang thay vì popup
          saveAuthState(url);
          window.location.href = url;
          return;
        }

        // Trên các môi trường khác: Dùng popup như bình thường
        const popup = window.open(url, 'Google Login', 'width=500,height=600,left=400,top=100');

        if (!popup) {
          throw new Error('Popup bị chặn. Vui lòng cho phép popup cho trang web này.');
        }

        // Listen for messages from the popup
        const response = await new Promise<AuthResponse>((resolve, reject) => {
          const handleMessage = (event: MessageEvent) => {
            // Verify origin
            if (event.origin !== window.location.origin) return;

            // Handle error
            if (event.data.error) {
              reject(new Error(event.data.error));
              return;
            }

            // Handle success
            if (event.data.accessToken) {
              resolve(event.data);
              return;
            }
          };

          window.addEventListener('message', handleMessage);

          // Check if popup is closed before authentication
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              window.removeEventListener('message', handleMessage);
              reject(new Error('Đăng nhập bị hủy'));
            }
          }, 1000);
        });

        // Store both tokens and redirect
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
        router.push(ROUTES.DASHBOARD);
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      }
    },
  });

  const { mutateAsync: refreshToken, isPending: isRefreshTokenLoading } = useMutation({
    mutationFn: async () => {
      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const { data } = await axiosClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
          refreshToken,
        } as RefreshTokenRequest);

        // Update both tokens in localStorage
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);

        return data;
      } catch (err) {
        const error = err as Error;
        setError(error);

        // If refresh token is invalid, logout
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        router.push(ROUTES.AUTH.LOGIN);

        throw error;
      }
    },
  });

  const logout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

    // Redirect to login page
    router.push(ROUTES.AUTH.LOGIN);
  };

  return {
    login,
    register,
    loginWithGoogle,
    checkPendingAuth,
    refreshToken,
    logout,
    isLoading:
      isLoginLoading ||
      isRegisterLoading ||
      isGoogleLoading ||
      isRefreshTokenLoading ||
      isCheckingAuth,
    error,
  };
};
