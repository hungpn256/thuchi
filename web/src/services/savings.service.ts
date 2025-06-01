import {
  Savings,
  CreateSavingsDTO,
  UpdateSavingsDTO,
  GetSavingsParams,
  PaginatedSavingsResult,
  SavingsTotal,
} from '@/types/savings';
import axiosClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/constants/app.constant';

export const savingsService = {
  /**
   * Get paginated list of savings
   */
  getSavings: async (params?: GetSavingsParams): Promise<PaginatedSavingsResult> => {
    const response = await axiosClient.get<PaginatedSavingsResult>(API_ENDPOINTS.SAVINGS.LIST, {
      params,
    });
    return response.data;
  },

  /**
   * Get savings total amount and count
   */
  getSavingsTotal: async (): Promise<SavingsTotal> => {
    const response = await axiosClient.get<SavingsTotal>(API_ENDPOINTS.SAVINGS.TOTAL);
    return response.data;
  },

  /**
   * Get savings by ID
   */
  getSavingsById: async (id: number): Promise<Savings> => {
    const response = await axiosClient.get<Savings>(`${API_ENDPOINTS.SAVINGS.DETAIL}/${id}`);
    return response.data;
  },

  /**
   * Create new savings
   */
  createSavings: async (data: CreateSavingsDTO): Promise<Savings> => {
    const response = await axiosClient.post<Savings>(API_ENDPOINTS.SAVINGS.CREATE, data);
    return response.data;
  },

  /**
   * Update savings
   */
  updateSavings: async (id: number, data: UpdateSavingsDTO): Promise<Savings> => {
    const response = await axiosClient.put<Savings>(`${API_ENDPOINTS.SAVINGS.UPDATE}/${id}`, data);
    return response.data;
  },

  /**
   * Delete savings
   */
  deleteSavings: async (id: number): Promise<void> => {
    await axiosClient.delete(`${API_ENDPOINTS.SAVINGS.DELETE}/${id}`);
  },
};
