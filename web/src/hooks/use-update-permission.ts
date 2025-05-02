import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys.constant';
import axiosClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/constants/app.constant';
import { Permission, ProfileUser } from '@/types/auth';

export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, permission }: { userId: number; permission: Permission }) => {
      const { data } = await axiosClient.patch<ProfileUser>(API_ENDPOINTS.PROFILES.USERS(userId), {
        permission,
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate profile users query
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILES.MEMBERS });
    },
  });
}
