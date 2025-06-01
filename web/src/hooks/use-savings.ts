import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { savingsService } from '@/services/savings.service';
import { toast } from '@/components/ui/use-toast';
import { GetSavingsParams, CreateSavingsDTO, UpdateSavingsDTO } from '@/types/savings';

export const SAVINGS_QUERY_KEYS = {
  all: ['savings'] as const,
  lists: () => [...SAVINGS_QUERY_KEYS.all, 'list'] as const,
  list: (params?: GetSavingsParams) => [...SAVINGS_QUERY_KEYS.lists(), params] as const,
  details: () => [...SAVINGS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...SAVINGS_QUERY_KEYS.details(), id] as const,
  total: () => [...SAVINGS_QUERY_KEYS.all, 'total'] as const,
};

export const useSavings = (params?: GetSavingsParams) => {
  return useQuery({
    queryKey: SAVINGS_QUERY_KEYS.list(params),
    queryFn: () => savingsService.getSavings(params),
  });
};

export const useSavingsTotal = () => {
  return useQuery({
    queryKey: SAVINGS_QUERY_KEYS.total(),
    queryFn: () => savingsService.getSavingsTotal(),
  });
};

export const useSavingsById = (id: number) => {
  return useQuery({
    queryKey: SAVINGS_QUERY_KEYS.detail(id),
    queryFn: () => savingsService.getSavingsById(id),
    enabled: !!id,
  });
};

export const useCreateSavings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSavingsDTO) => savingsService.createSavings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SAVINGS_QUERY_KEYS.all });
      toast({
        title: 'Thành công',
        description: 'Đã tạo khoản tiết kiệm mới',
      });
    },
    onError: (error) => {
      console.error('Error creating savings:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tạo khoản tiết kiệm',
      });
    },
  });
};

export const useUpdateSavings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSavingsDTO }) =>
      savingsService.updateSavings(id, data),
    onSuccess: (updatedSavings, { id }) => {
      queryClient.invalidateQueries({ queryKey: SAVINGS_QUERY_KEYS.all });
      queryClient.setQueryData(SAVINGS_QUERY_KEYS.detail(id), updatedSavings);
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật khoản tiết kiệm',
      });
    },
    onError: (error) => {
      console.error('Error updating savings:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể cập nhật khoản tiết kiệm',
      });
    },
  });
};

export const useDeleteSavings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => savingsService.deleteSavings(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SAVINGS_QUERY_KEYS.all });
      toast({
        title: 'Thành công',
        description: 'Đã xóa khoản tiết kiệm',
      });
    },
    onError: (error) => {
      console.error('Error deleting savings:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể xóa khoản tiết kiệm',
      });
    },
  });
};
