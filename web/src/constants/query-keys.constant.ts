export const QUERY_KEYS = {
  TRANSACTIONS: {
    ALL: ["transactions"] as const,
    LIST: (params?: {
      startDate?: string;
      endDate?: string;
      limit?: number;
      page?: number;
    }) => ["transactions", "list", params] as const,
    SUMMARY: (params?: { startDate?: string; endDate?: string }) =>
      ["transactions", "summary", params] as const,
    DETAIL: (id: string) => ["transactions", "detail", id] as const,
    CATEGORY: (params?: { startDate?: string; endDate?: string }) =>
      ["transactions", "summary", params] as const,
  },
  CATEGORIES: {
    ALL: ["categories"] as const,
  },
  EVENTS: {
    ALL: ["events"] as const,
    LIST: () => [...QUERY_KEYS.EVENTS.ALL, "list"] as const,
    DETAIL: (id: number) => [...QUERY_KEYS.EVENTS.ALL, id] as const,
    BY_CATEGORY: (categoryId: number) =>
      [...QUERY_KEYS.EVENTS.ALL, "category", categoryId] as const,
  },
  AUTH: {
    PROFILE: ["auth", "profile"] as const,
  },
  USER: {
    ALL: ["user"],
    PROFILE: () => [...QUERY_KEYS.USER.ALL, "profile"],
  },
} as const;
