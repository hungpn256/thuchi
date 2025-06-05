/**
 * Timezone related constants for frontend
 */

export const TIMEZONE_HEADERS = {
  X_TIMEZONE: 'x-timezone',
  TIMEZONE: 'timezone',
  TIME_ZONE: 'time-zone',
} as const;

export const DEFAULT_TIMEZONE = 'UTC';

export const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

export const COMMON_TIMEZONES = {
  UTC: 'UTC',
  VIETNAM: 'Asia/Ho_Chi_Minh',
  SINGAPORE: 'Asia/Singapore',
  THAILAND: 'Asia/Bangkok',
  JAPAN: 'Asia/Tokyo',
  CHINA: 'Asia/Shanghai',
  KOREA: 'Asia/Seoul',
} as const;

/**
 * Get user's current timezone
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}
