import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys.constant';
import axiosClient from '@/lib/axios-client';

interface Invitation {
  id: number;
  profile: {
    id: number;
    name: string;
    user: {
      account: {
        email: string;
      };
    };
  };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export function useInvitations() {
  return useQuery({
    queryKey: QUERY_KEYS.PROFILES.INVITATIONS,
    queryFn: async () => {
      const { data } = await axiosClient.get<Invitation[]>('/profiles/invitations');
      return data;
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: number) => {
      const { data } = await axiosClient.post(`/profiles/invitations/${invitationId}/accept`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILES.INVITATIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.PROFILE });
    },
  });
}

export function useRejectInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: number) => {
      const { data } = await axiosClient.post(`/profiles/invitations/${invitationId}/reject`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILES.INVITATIONS });
    },
  });
}
