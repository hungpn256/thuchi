import { useMutation } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/constants/app.constant';
import axiosClient from '@/lib/axios-client';
import { AuthResponse } from '@/types/auth';
import { useUserProfile } from './use-user';

interface CreateProfileData {
  name: string;
}

export const useCreateProfile = () => {
  const { refetch } = useUserProfile();
  return useMutation({
    mutationFn: async (data: CreateProfileData) => {
      const { data: response } = await axiosClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.CREATE_PROFILE,
        data,
      );
      return response;
    },
    onSuccess: () => {
      refetch();
    },
  });
};
