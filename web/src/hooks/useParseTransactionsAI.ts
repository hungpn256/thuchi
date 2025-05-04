import { API_ENDPOINTS } from '@/constants/app.constant';
import axiosClient from '@/lib/axios-client';
import { useMutation } from '@tanstack/react-query';

export interface AIParsedTransaction {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  date: string;
}

interface UseParseTransactionsAIResult {
  parseTransactions: (text: string) => Promise<AIParsedTransaction[]>;
  isLoading: boolean;
  error: string | null;
}

async function aiParseTransactions(text: string): Promise<AIParsedTransaction[]> {
  const response = await axiosClient.post(API_ENDPOINTS.TRANSACTIONS.PREVIEW, {
    text,
  });

  return response.data;
}

export function useParseTransactionsAI(): UseParseTransactionsAIResult {
  const { mutateAsync, isPending, error } = useMutation<AIParsedTransaction[], unknown, string>({
    mutationFn: aiParseTransactions,
  });

  return {
    parseTransactions: mutateAsync,
    isLoading: isPending,
    error: error instanceof Error ? error.message : error ? String(error) : null,
  };
}
