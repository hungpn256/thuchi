/**
 * Formats a number as a currency string using VND format
 * @param value - The numeric value to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

/**
 * Formats a number as a percentage with one decimal place
 * @param value - The numeric value to format as percentage
 * @param includePlus - Whether to include a plus sign for positive values
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, includePlus = true): string {
  return `${value > 0 && includePlus ? '+' : ''}${value.toFixed(1)}%`;
}
