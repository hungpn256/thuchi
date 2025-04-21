import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatAmount = (value: string) => {
  // Remove all non-digit characters
  const number = value.replace(/\D/g, '');
  // Format with thousand separators
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const unFormatAmount = (value: string) => {
  // Remove all non-digit characters and convert to number
  return Number(value.replace(/\D/g, ''));
};
