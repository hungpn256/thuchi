/**
 * Timezone related constants
 */

export const TIMEZONE_HEADERS = {
  X_TIMEZONE: 'x-timezone',
  TIMEZONE: 'timezone',
  TIME_ZONE: 'time-zone',
} as const;

export const DEFAULT_TIMEZONE = 'UTC';

export const COMMON_TIMEZONES = {
  UTC: 'UTC',
  VIETNAM: 'Asia/Ho_Chi_Minh',
  SINGAPORE: 'Asia/Singapore',
  THAILAND: 'Asia/Bangkok',
  JAPAN: 'Asia/Tokyo',
  CHINA: 'Asia/Shanghai',
  KOREA: 'Asia/Seoul',
} as const;

export const TIMEZONE_HEADER_PRIORITY = [
  TIMEZONE_HEADERS.X_TIMEZONE,
  TIMEZONE_HEADERS.TIMEZONE,
  TIMEZONE_HEADERS.TIME_ZONE,
] as const;
