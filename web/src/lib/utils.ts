import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(amount);
};

export const formatAmount = (value: string): string => {
  // Tách phần nguyên và phần thập phân
  const [integerPart, decimalPart] = value.split('.');
  // Format phần nguyên với dấu phẩy
  const formattedInteger = integerPart.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  // Ghép lại với phần thập phân nếu có
  return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

export const unFormatAmount = (value: string): number => {
  // Loại bỏ dấu phẩy, giữ dấu chấm thập phân
  const normalized = value.replace(/,/g, '');
  return Number(normalized);
};
