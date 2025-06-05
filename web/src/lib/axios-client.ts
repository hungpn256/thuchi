import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { STORAGE_KEYS, ROUTES, API_ENDPOINTS } from '@/constants/app.constant';
import { AuthResponse, RefreshTokenRequest } from '@/types/auth';
import { clearTokens, updateTokens } from './auth';
import { getTimezoneHeader } from './timezone';
import { TIMEZONE_HEADERS } from '@/constants/timezone.constant';

// Extended request config with _retry property
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    [TIMEZONE_HEADERS.X_TIMEZONE]: getTimezoneHeader(),
  },
});

// Add request interceptor for authentication and timezone
axiosClient.interceptors.request.use(
  (config) => {
    // Add authentication token
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add timezone header (always get latest timezone)

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
// Queue of failed requests to retry after token refresh
let failedQueue: Array<{
  resolve: (value: string | null) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Add response interceptor for error handling
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig | undefined;

    // If the error is not 401 or the original request already attempted a refresh
    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    if (originalRequest) {
      // Mark to avoid infinite loop
      originalRequest._retry = true;

      // If token refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      // If no refresh token, logout and redirect
      if (!refreshToken) {
        clearTokens();
        window.location.href = ROUTES.AUTH.LOGIN;
        return Promise.reject(error);
      }

      try {
        // Try to refresh the token
        const response = await axios.post<AuthResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
          { refreshToken } as RefreshTokenRequest,
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update tokens in localStorage
        updateTokens(accessToken, newRefreshToken);

        // Update Authorization header for the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Process any queued requests
        processQueue(null, accessToken);

        return axiosClient(originalRequest);
      } catch (refreshError) {
        // If refresh token is invalid, clear tokens and redirect to login
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

        // Process queued requests with the error
        processQueue(refreshError, null);

        // Redirect to login page
        window.location.href = ROUTES.AUTH.LOGIN;
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
