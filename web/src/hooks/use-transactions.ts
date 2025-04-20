import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys.constant";
import { API_ENDPOINTS } from "@/constants/app.constant";
import axiosClient from "@/lib/axios-client";
import { TransactionType } from "@/types/transaction";

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  categoryId: number;
  category: {
    id: number;
    name: string;
  };
}

interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

interface TransactionListParams {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  page?: number;
}

interface TransactionSummaryParams {
  startDate?: Date;
  endDate?: Date;
}

interface CreateTransactionDTO {
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  categoryId: number;
}

export interface CategoryExpense {
  categoryId: number;
  categoryName: string;
  total: number;
}

// Custom hook for fetching transaction list
export const useTransactionList = (params?: TransactionListParams) => {
  const queryParams = {
    startDate: params?.startDate?.toISOString(),
    endDate: params?.endDate?.toISOString(),
    limit: params?.limit || 10,
    page: params?.page || 1,
  };

  return useQuery<{ items: Transaction[] }>({
    queryKey: QUERY_KEYS.TRANSACTIONS.LIST(queryParams),
    queryFn: async () => {
      const { data } = await axiosClient.get(API_ENDPOINTS.TRANSACTIONS.LIST, {
        params: queryParams,
      });
      return data;
    },
    enabled: !!params?.startDate && !!params?.endDate,
  });
};

// Custom hook for fetching transaction summary
export const useTransactionSummary = (params?: TransactionSummaryParams) => {
  const queryParams = {
    startDate: params?.startDate?.toISOString(),
    endDate: params?.endDate?.toISOString(),
  };

  return useQuery<TransactionSummary>({
    queryKey: QUERY_KEYS.TRANSACTIONS.SUMMARY(queryParams),
    queryFn: async () => {
      const { data } = await axiosClient.get(
        API_ENDPOINTS.TRANSACTIONS.SUMMARY,
        {
          params: queryParams,
        }
      );
      return data;
    },
    enabled: !!params?.startDate && !!params?.endDate,
  });
};

// Custom hook for creating a transaction
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTransaction: CreateTransactionDTO) => {
      const { data } = await axiosClient.post(
        API_ENDPOINTS.TRANSACTIONS.CREATE,
        newTransaction
      );
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch transactions list and summary
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS.ALL });
    },
  });
};

// Custom hook for updating a transaction
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateTransactionDTO>;
    }) => {
      const response = await axiosClient.put(
        `${API_ENDPOINTS.TRANSACTIONS.UPDATE}/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS.ALL });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.TRANSACTIONS.DETAIL(id),
      });
    },
  });
};

// Custom hook for deleting a transaction
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosClient.delete(
        `${API_ENDPOINTS.TRANSACTIONS.DELETE}/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TRANSACTIONS.ALL],
      });
    },
  });
};

export function useExpensesByCategory(params?: {
  startDate?: Date;
  endDate?: Date;
}) {
  const queryParams = {
    startDate: params?.startDate?.toISOString(),
    endDate: params?.endDate?.toISOString(),
  };
  return useQuery<CategoryExpense[]>({
    queryKey: [QUERY_KEYS.TRANSACTIONS.CATEGORY(queryParams)],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.startDate) {
        searchParams.append("startDate", params.startDate.toISOString());
      }
      if (params?.endDate) {
        searchParams.append("endDate", params.endDate.toISOString());
      }

      const { data } = await axiosClient.get<CategoryExpense[]>(
        `/transactions/expenses-by-category?${searchParams.toString()}`
      );
      return data;
    },
  });
}
