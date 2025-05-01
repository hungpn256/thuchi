import { AxiosError } from 'axios';

interface ApiError {
  message: string;
}

export const getErrorMessage = (error: unknown, defaultMessage = 'Đã có lỗi xảy ra'): string => {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;
    return apiError?.message || defaultMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
};
