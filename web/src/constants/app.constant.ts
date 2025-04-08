export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
} as const;

export const ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
  },
  DASHBOARD: "/",
  TRANSACTIONS: "/transactions",
  LOGIN: "/login",
  REGISTER: "/register",
} as const;

export const API_ENDPOINTS = {
  TRANSACTIONS: {
    LIST: "/transactions",
    SUMMARY: "/transactions/summary",
    CREATE: "/transactions",
    UPDATE: "/transactions",
    DELETE: "/transactions",
    DETAIL: "/transactions",
  },
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    PROFILE: "/auth/profile",
    LOGIN_GOOGLE: "/auth/login/google",
  },
} as const;
