import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys.constant";
import { API_ENDPOINTS } from "@/constants/app.constant";
import axiosClient from "@/lib/axios-client";

export interface Category {
  id: number;
  name: string;
}

export interface CreateCategoryDTO {
  name: string;
}

export const useCategories = () => {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES.ALL],
    queryFn: async () => {
      const { data } = await axiosClient.get<Category[]>(
        API_ENDPOINTS.CATEGORIES.LIST
      );
      return data;
    },
  });

  const createCategory = useMutation({
    mutationFn: async (newCategory: CreateCategoryDTO) => {
      const { data } = await axiosClient.post<Category>(
        API_ENDPOINTS.CATEGORIES.CREATE,
        newCategory
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES.ALL] });
    },
  });

  return {
    categories,
    isLoading,
    createCategory,
  };
};
