import {
  keepPreviousData,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
export const queryClient = new QueryClient({
  queryCache: new QueryCache(),
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: true,
      placeholderData: keepPreviousData,
    },
    mutations: {
      retry: 1,
    },
  },
});
