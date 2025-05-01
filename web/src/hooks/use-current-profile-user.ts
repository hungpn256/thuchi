import { useQuery } from '@tanstack/react-query';
import { ProfileUser } from './use-profile-members';
import axiosClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/constants/app.constant';
import { QUERY_KEYS } from '@/constants/query-keys.constant';

export function useCurrentProfileUser() {
  return useQuery<ProfileUser, Error>({
    queryKey: [QUERY_KEYS.AUTH.CURRENT_PROFILE_USER],
    queryFn: async () => {
      const res = await axiosClient.get(API_ENDPOINTS.AUTH.CURRENT_PROFILE_USER);
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}
