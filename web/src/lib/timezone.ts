import { startOfDay, endOfDay } from 'date-fns';
import { toZonedTime, fromZonedTime, format as formatTz } from 'date-fns-tz';
import { getUserTimezone } from '@/constants/timezone.constant';

/**
 * Frontend timezone utility functions
 */

/**
 * Convert local date to UTC with timezone consideration
 * @param date - Local date
 * @param timezone - Source timezone (defaults to user's timezone)
 * @returns UTC Date
 */
export function convertToUTC(date: Date, timezone?: string): Date {
  const tz = timezone || getUserTimezone();
  return fromZonedTime(date, tz);
}

/**
 * Convert UTC date to local timezone
 * @param utcDate - UTC date
 * @param timezone - Target timezone (defaults to user's timezone)
 * @returns Local date in timezone
 */
export function convertFromUTC(utcDate: Date, timezone?: string): Date {
  const tz = timezone || getUserTimezone();
  return toZonedTime(utcDate, tz);
}

/**
 * Get pure UTC start of day based on user's timezone date
 *
 * Example for Vietnam timezone (UTC+7):
 * Input:  new Date('2025-05-31T17:00:00.000Z') // 00:00 June 1st in VN
 * Output: '2025-06-01T00:00:00.000Z'           // 00:00 June 1st in UTC
 *
 * @param date - Date to get start of day for
 * @returns UTC ISO string for start of day in UTC timezone
 */
export function startOfDayPureUTC(date: Date): string {
  // Get the date in user's timezone first
  const userTimezone = getUserTimezone();
  const localDate = toZonedTime(date, userTimezone);

  // Extract year, month, day from user's local date
  const year = localDate.getFullYear();
  const month = localDate.getMonth();
  const day = localDate.getDate();

  // Create pure UTC date with same year/month/day
  const utcDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  return utcDate.toISOString();
}

/**
 * Get pure UTC end of day based on user's timezone date
 *
 * Example for Vietnam timezone (UTC+7):
 * Input:  new Date('2025-05-31T17:00:00.000Z') // 00:00 June 1st in VN
 * Output: '2025-06-01T23:59:59.999Z'           // 23:59 June 1st in UTC
 *
 * @param date - Date to get end of day for
 * @returns UTC ISO string for end of day in UTC timezone
 */
export function endOfDayPureUTC(date: Date): string {
  // Get the date in user's timezone first
  const userTimezone = getUserTimezone();
  const localDate = toZonedTime(date, userTimezone);

  // Extract year, month, day from user's local date
  const year = localDate.getFullYear();
  const month = localDate.getMonth();
  const day = localDate.getDate();

  // Create pure UTC date with same year/month/day
  const utcDate = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
  return utcDate.toISOString();
}

/**
 * Get start of day in user's timezone and convert to UTC ISO string
 * @param date - Date to get start of day for
 * @param timezone - Timezone (defaults to user's timezone)
 * @param pureUTC - If true, returns pure UTC start of day instead of timezone-aware
 * @returns UTC ISO string for start of day
 */
export function startOfDayUTC(date: Date, timezone?: string, pureUTC: boolean = false): string {
  if (pureUTC) {
    return startOfDayPureUTC(date);
  }

  const tz = timezone || getUserTimezone();

  // Get start of day in the user's timezone
  const zonedDate = toZonedTime(date, tz);
  const startOfDayZoned = startOfDay(zonedDate);

  // Convert back to UTC
  const utcDate = fromZonedTime(startOfDayZoned, tz);
  return utcDate.toISOString();
}

/**
 * Get end of day in user's timezone and convert to UTC ISO string
 * @param date - Date to get end of day for
 * @param timezone - Timezone (defaults to user's timezone)
 * @param pureUTC - If true, returns pure UTC end of day instead of timezone-aware
 * @returns UTC ISO string for end of day
 */
export function endOfDayUTC(date: Date, timezone?: string, pureUTC: boolean = false): string {
  if (pureUTC) {
    return endOfDayPureUTC(date);
  }

  const tz = timezone || getUserTimezone();

  // Get end of day in the user's timezone
  const zonedDate = toZonedTime(date, tz);
  const endOfDayZoned = endOfDay(zonedDate);

  // Convert back to UTC
  const utcDate = fromZonedTime(endOfDayZoned, tz);
  return utcDate.toISOString();
}

/**
 * Format date in user's timezone
 * @param date - Date to format
 * @param formatStr - Format string
 * @param timezone - Timezone (defaults to user's timezone)
 * @returns Formatted date string
 */
export function formatInUserTimezone(
  date: Date | string,
  formatStr: string = 'dd/MM/yyyy',
  timezone?: string,
): string {
  const tz = timezone || getUserTimezone();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatTz(dateObj, formatStr, { timeZone: tz });
}

/**
 * Get current timezone header value for API requests
 * @returns Timezone string for headers
 */
export function getTimezoneHeader(): string {
  return getUserTimezone();
}

/**
 * Parse date string and convert to UTC assuming it's in user's timezone
 * @param dateStr - Date string
 * @param timezone - Source timezone (defaults to user's timezone)
 * @returns UTC Date
 */
export function parseLocalDateToUTC(dateStr: string, timezone?: string): Date {
  const tz = timezone || getUserTimezone();
  const localDate = new Date(dateStr);
  return fromZonedTime(localDate, tz);
}

/**
 * Convert Date to UTC ISO string with timezone consideration
 * @param date - Date to convert
 * @param timezone - Source timezone (defaults to user's timezone)
 * @returns UTC ISO string
 */
export function toUTCISOString(date: Date, timezone?: string): string {
  return convertToUTC(date, timezone).toISOString();
}
