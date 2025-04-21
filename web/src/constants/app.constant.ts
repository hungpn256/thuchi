export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  DASHBOARD: '/',
  TRANSACTIONS: {
    LIST: '/transactions',
    NEW: '/transactions/new',
  },
  EVENTS: {
    LIST: '/events',
    NEW: '/events/new',
    CALENDAR: '/events/calendar',
    DETAIL: '/events',
  },
  LOGIN: '/login',
  REGISTER: '/register',
} as const;

export const API_ENDPOINTS = {
  TRANSACTIONS: {
    LIST: '/transactions',
    SUMMARY: '/transactions/summary',
    CREATE: '/transactions',
    UPDATE: '/transactions',
    DELETE: '/transactions',
    DETAIL: '/transactions',
  },
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
  },
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    PROFILE: '/auth/profile',
    LOGIN_GOOGLE: '/auth/login/google',
    GOOGLE: '/auth/google',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  EVENTS: {
    LIST: '/events',
    CREATE: '/events',
    UPDATE: '/events',
    DELETE: '/events',
    DETAIL: '/events',
    BY_CATEGORY: '/events/category',
  },
} as const;
