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
  SAVINGS: {
    LIST: '/savings',
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
  SAVINGS: {
    LIST: '/savings',
    TOTAL: '/savings/total',
    CREATE: '/savings',
    UPDATE: '/savings',
    DELETE: '/savings',
    DETAIL: '/savings',
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

export const ASSET_TYPES = {
  MONEY: 'MONEY',
  GOLD: 'GOLD',
  LAND: 'LAND',
  STOCK: 'STOCK',
  CRYPTO: 'CRYPTO',
  PROPERTY: 'PROPERTY',
  JEWELRY: 'JEWELRY',
  OTHER: 'OTHER',
} as const;

export const ASSET_TYPE_LABELS = {
  [ASSET_TYPES.MONEY]: 'Tiền mặt',
  [ASSET_TYPES.GOLD]: 'Vàng',
  [ASSET_TYPES.LAND]: 'Đất đai',
  [ASSET_TYPES.STOCK]: 'Cổ phiếu',
  [ASSET_TYPES.CRYPTO]: 'Tiền điện tử',
  [ASSET_TYPES.PROPERTY]: 'Bất động sản',
  [ASSET_TYPES.JEWELRY]: 'Trang sức',
  [ASSET_TYPES.OTHER]: 'Khác',
} as const;

export const ASSET_UNITS = {
  MONEY: ['VND', 'USD', 'EUR', 'JPY'],
  GOLD: ['chỉ', 'lượng', 'oz'],
  LAND: ['m²', 'ha', 'sào'],
  STOCK: ['cổ phiếu', 'lot'],
  CRYPTO: ['coin', 'token'],
  PROPERTY: ['căn', 'tòa', 'dự án'],
  JEWELRY: ['chiếc', 'bộ', 'gram'],
  OTHER: ['đơn vị', 'cái', 'chiếc'],
} as const;

export const DEFAULT_UNITS = {
  [ASSET_TYPES.MONEY]: 'VND',
  [ASSET_TYPES.GOLD]: 'chỉ',
  [ASSET_TYPES.LAND]: 'm²',
  [ASSET_TYPES.STOCK]: 'cổ phiếu',
  [ASSET_TYPES.CRYPTO]: 'coin',
  [ASSET_TYPES.PROPERTY]: 'căn',
  [ASSET_TYPES.JEWELRY]: 'chiếc',
  [ASSET_TYPES.OTHER]: 'đơn vị',
} as const;
