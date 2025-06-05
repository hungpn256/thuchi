import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { DEFAULT_TIMEZONE, TIMEZONE_HEADER_PRIORITY } from '../constants/timezone.constant';

/**
 * Custom decorator to extract timezone from request headers
 *
 * Searches for timezone in headers with priority:
 * 1. x-timezone
 * 2. timezone
 * 3. time-zone
 *
 * @example
 * // Extract timezone from headers
 * @Get('/transactions')
 * async getTransactions(@Timezone() timezone: string) {
 *   // timezone will be 'Asia/Ho_Chi_Minh' if sent in header, or 'UTC' as default
 * }
 *
 * @example
 * // With validation
 * @Get('/reports')
 * async getReports(@Timezone() timezone: string) {
 *   const isValidTimezone = Intl.supportedValuesOf('timeZone').includes(timezone);
 *   // Use timezone for date processing
 * }
 */
export const Timezone = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<Request>();

  // Search for timezone in headers with priority
  for (const headerName of TIMEZONE_HEADER_PRIORITY) {
    const timezone = request.headers[headerName] as string;
    if (timezone && typeof timezone === 'string') {
      // Basic validation - check if it looks like a valid timezone
      if (isValidTimezoneFormat(timezone)) {
        return timezone;
      }
    }
  }

  // Return default timezone if not found or invalid
  return DEFAULT_TIMEZONE;
});

/**
 * Basic timezone format validation
 * Accepts formats like: UTC, Asia/Ho_Chi_Minh, America/New_York, etc.
 */
function isValidTimezoneFormat(timezone: string): boolean {
  // Allow UTC
  if (timezone === 'UTC') return true;

  // Check basic format: Area/City or Area/Subarea/City
  const timezoneRegex = /^[A-Z][a-z]+\/[A-Z][a-z_]+(?:\/[A-Z][a-z_]+)?$/;
  return timezoneRegex.test(timezone);
}
