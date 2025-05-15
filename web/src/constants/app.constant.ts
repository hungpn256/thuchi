export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  TRANSACTION_INPUT_PREFERENCE: 'transaction-input-preference',
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
  },
  REPORTS: {
    ROOT: '/reports',
    SUMMARY: '/reports',
    BY_CATEGORY: '/reports/category',
    TRENDS: '/reports/trends',
  },
  SETTINGS: '/settings',
  PROFILES: {
    LIST: '/profiles',
  },
  SPLIT_BILL: {
    LIST: '/split-bill',
  },
} as const;

export const API_ENDPOINTS = {
  TRANSACTIONS: {
    LIST: '/transactions',
    SUMMARY: '/transactions/summary',
    CREATE: '/transactions',
    CREATE_BATCH: '/transactions/batch',
    UPDATE: '/transactions',
    DELETE: '/transactions',
    DETAIL: '/transactions',
    PREVIEW: '/transactions/preview',
    ACCOUNTS_TOTAL: '/transactions/accounts-total',
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
    SWITCH_PROFILE: '/auth/switch-profile',
    CREATE_PROFILE: '/auth/profiles',
    CURRENT_PROFILE_USER: '/auth/current-profile-user',
  },
  EVENTS: {
    LIST: '/events',
    CREATE: '/events',
    UPDATE: '/events',
    DELETE: '/events',
    DETAIL: '/events',
    BY_CATEGORY: '/events/category',
  },
  REPORTS: {
    SUMMARY: '/reports/summary',
    CATEGORIES: '/reports/categories',
    TRENDS: '/reports/trends',
  },
  PROFILES: {
    MEMBERS: (profileId: number) => `/profiles/${profileId}/members`,
    INVITATIONS: (profileId: number) => `/profiles/${profileId}/invitations`,
    USERS: (userId: number) => `/profiles/users/${userId}`,
  },
} as const;

export const TRANSACTION_INPUT_METHODS = {
  FORM: 'form',
  TEXT: 'text',
  VOICE: 'voice',
} as const;

export const TRANSACTION_REGEX = {
  AMOUNT: /(\d+(?:[,.]\d+)?(?:\s*(?:k|m|nghìn|nghin|triệu|trieu))?)/i,
  DATE: /(\d{1,2}\/\d{1,2}(?:\/\d{4})?)/,
  INCOME_INDICATORS: /^\+|^thêm/i,
  EXPENSE_INDICATORS: /chi|tiêu/i,
} as const;
