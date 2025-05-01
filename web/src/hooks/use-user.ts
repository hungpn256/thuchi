import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys.constant';
import { API_ENDPOINTS } from '@/constants/app.constant';
import axiosClient from '@/lib/axios-client';
import { Account, Profile } from '@/types/auth';

interface UserProfile {
  account: Account;
  profile: Profile;
}

interface UpdateProfileDTO {
  name?: string;
  avatar?: string;
}

// Custom hook for fetching user profile
export const useUserProfile = (config?: { enabled?: boolean }) => {
  return useQuery<UserProfile>({
    queryKey: QUERY_KEYS.AUTH.PROFILE,
    queryFn: async () => {
      const { data } = await axiosClient.get(API_ENDPOINTS.AUTH.PROFILE);
      return data;
    },
    ...config,
  });
};

// Custom hook for updating user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: UpdateProfileDTO) => {
      const { data } = await axiosClient.patch(API_ENDPOINTS.AUTH.PROFILE, updateData);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.PROFILE });
    },
  });
};
