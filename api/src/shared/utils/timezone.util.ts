import { toZonedTime, fromZonedTime, format as formatTz } from 'date-fns-tz';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { DEFAULT_TIMEZONE } from '../constants/timezone.constant';

/**
 * Timezone utility functions for date manipulation
 */

/**
 * Convert a local date to UTC based on timezone
 * @param date - Local date
 * @param timezone - Target timezone (e.g., 'Asia/Ho_Chi_Minh')
 * @returns UTC Date
 */
export function toUTC(date: Date | string, timezone: string = DEFAULT_TIMEZONE): Date {
  const localDate = typeof date === 'string' ? new Date(date) : date;
  return fromZonedTime(localDate, timezone);
}

/**
 * Convert UTC date to local time in specified timezone
 * @param utcDate - UTC date
 * @param timezone - Target timezone (e.g., 'Asia/Ho_Chi_Minh')
 * @returns Local date in specified timezone
 */
export function fromUTC(utcDate: Date | string, timezone: string = DEFAULT_TIMEZONE): Date {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  return toZonedTime(date, timezone);
}

/**
 * Get start of day in specified timezone and convert to UTC
 * @param date - Input date
 * @param timezone - Target timezone
 * @returns UTC Date representing start of day in timezone
 */
export function startOfDayInTimezone(date: Date, timezone: string = DEFAULT_TIMEZONE): Date {
  const zonedDate = toZonedTime(date, timezone);
  const startOfDayZoned = startOfDay(zonedDate);
  return fromZonedTime(startOfDayZoned, timezone);
}

/**
 * Get end of day in specified timezone and convert to UTC
 * @param date - Input date
 * @param timezone - Target timezone
 * @returns UTC Date representing end of day in timezone
 */
export function endOfDayInTimezone(date: Date, timezone: string = DEFAULT_TIMEZONE): Date {
  const zonedDate = toZonedTime(date, timezone);
  const endOfDayZoned = endOfDay(zonedDate);
  return fromZonedTime(endOfDayZoned, timezone);
}

/**
 * Get start of month in specified timezone and convert to UTC
 * @param date - Input date
 * @param timezone - Target timezone
 * @returns UTC Date representing start of month in timezone
 */
export function startOfMonthInTimezone(date: Date, timezone: string = DEFAULT_TIMEZONE): Date {
  const zonedDate = toZonedTime(date, timezone);
  const startOfMonthZoned = startOfMonth(zonedDate);
  return fromZonedTime(startOfMonthZoned, timezone);
}

/**
 * Get end of month in specified timezone and convert to UTC
 * @param date - Input date
 * @param timezone - Target timezone
 * @returns UTC Date representing end of month in timezone
 */
export function endOfMonthInTimezone(date: Date, timezone: string = DEFAULT_TIMEZONE): Date {
  const zonedDate = toZonedTime(date, timezone);
  const endOfMonthZoned = endOfMonth(zonedDate);
  return fromZonedTime(endOfMonthZoned, timezone);
}

/**
 * Format date in specified timezone
 * @param date - Date to format
 * @param formatString - Format pattern
 * @param timezone - Target timezone
 * @returns Formatted date string
 */
export function formatInTimezone(
  date: Date,
  formatString: string,
  timezone: string = DEFAULT_TIMEZONE,
): string {
  return formatTz(date, formatString, { timeZone: timezone });
}

/**
 * Parse date string as if it's in the specified timezone
 * @param dateStr - Date string (e.g., '2024-01-01 10:30:00')
 * @param timezone - Timezone to interpret the date in
 * @returns UTC Date
 */
export function parseDateInTimezone(dateStr: string, timezone: string = DEFAULT_TIMEZONE): Date {
  // Create a date assuming it's in the local timezone first
  const localDate = new Date(dateStr);

  // Then interpret it as if it was in the specified timezone
  return fromZonedTime(localDate, timezone);
}

/**
 * Get current time in specified timezone
 * @param timezone - Target timezone
 * @returns Current time in the specified timezone
 */
export function nowInTimezone(timezone: string = DEFAULT_TIMEZONE): Date {
  return toZonedTime(new Date(), timezone);
}

/**
 * Check if timezone string is valid
 * @param timezone - Timezone string to validate
 * @returns boolean
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

// Re-export for convenience
export { DEFAULT_TIMEZONE };
