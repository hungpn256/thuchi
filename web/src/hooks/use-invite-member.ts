import { API_ENDPOINTS } from '@/constants/app.constant';
import axiosClient from '@/lib/axios-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys.constant';

interface InviteMemberDto {
  email: string;
  permission: 'ADMIN' | 'WRITE' | 'READ';
}

export const useInviteMember = (profileId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InviteMemberDto) => {
      const response = await axiosClient.post(API_ENDPOINTS.PROFILES.INVITATIONS(profileId), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILES.MEMBERS });
    },
  });
};
