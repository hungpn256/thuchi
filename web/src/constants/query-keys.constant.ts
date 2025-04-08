export const QUERY_KEYS = {
  TRANSACTIONS: {
    ALL: ["transactions"],
    LIST: (params?: {
      startDate?: string;
      endDate?: string;
      limit?: number;
      page?: number;
    }) => [...QUERY_KEYS.TRANSACTIONS.ALL, "list", params],
    SUMMARY: (params?: { startDate?: string; endDate?: string }) => [
      ...QUERY_KEYS.TRANSACTIONS.ALL,
      "summary",
      params,
    ],
    DETAIL: (id: string) => [...QUERY_KEYS.TRANSACTIONS.ALL, "detail", id],
  },
  USER: {
    ALL: ["user"],
    PROFILE: () => [...QUERY_KEYS.USER.ALL, "profile"],
  },
} as const;
