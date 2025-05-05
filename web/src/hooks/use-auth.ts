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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { clearTokens, updateTokens } from '@/lib/auth';
import { registerWebPush, unregisterWebPush } from '@/utils/web-push';

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
  const client = useQueryClient();

  const { mutateAsync: login, isPending: isLoginLoading } = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        const { data } = await axiosClient.post<AuthResponse>(
          API_ENDPOINTS.AUTH.LOGIN,
          credentials,
        );

        // Store both tokens in localStorage
        updateTokens(data.accessToken, data.refreshToken);

        // Đăng ký push notification
        try {
          await registerWebPush();
        } catch (pushErr) {
          // eslint-disable-next-line no-console
          console.warn('Push registration failed:', pushErr);
        }

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
        updateTokens(data.accessToken, data.refreshToken);

        // Đăng ký push notification
        try {
          await registerWebPush();
        } catch (pushErr) {
          // eslint-disable-next-line no-console
          console.warn('Push registration failed:', pushErr);
        }

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
        updateTokens(authData.accessToken, authData.refreshToken);
        // Đăng ký push notification
        try {
          await registerWebPush();
        } catch (pushErr) {
          // eslint-disable-next-line no-console
          console.warn('Push registration failed:', pushErr);
        }
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

        // Lưu trạng thái và chuyển hướng
        saveAuthState(url);
        window.location.href = url;
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
        updateTokens(data.accessToken, data.refreshToken);

        return data;
      } catch (err) {
        const error = err as Error;
        setError(error);
        client.clear();

        // If refresh token is invalid, logout
        clearTokens();
        router.push(ROUTES.AUTH.LOGIN);

        throw error;
      }
    },
  });

  const logout = () => {
    // Clear tokens from localStorage
    unregisterWebPush()
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('Push unregister failed:', err);
      })
      .finally(() => {
        clearTokens();
      });

    client.clear();

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
