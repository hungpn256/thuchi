import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys.constant';
import axiosClient from '@/lib/axios-client';
import { API_ENDPOINTS } from '@/constants/app.constant';

export interface ProfileUser {
  id: number;
  account?: {
    id: number;
    email: string;
  };
  profile?: {
    id: number;
    name: string;
  };
  status: 'ACTIVE' | 'PENDING';
  permission: 'ADMIN' | 'WRITE' | 'READ';
}

export function useProfileMembers(profileId?: number, config?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.PROFILES.MEMBERS,
    queryFn: async () => {
      if (!profileId) {
        return [];
      }

      const { data } = await axiosClient.get<ProfileUser[]>(
        `${API_ENDPOINTS.PROFILES.MEMBERS(profileId)}`,
      );
      return data;
    },
    ...config,
  });
}
