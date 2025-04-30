import { useMutation } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/constants/app.constant';
import { AuthResponse } from '@/types/auth';
import { updateTokens } from '@/lib/auth';
import axiosClient from '@/lib/axios-client';

interface SwitchProfileData {
  profileId: number;
}

export function useSwitchProfile() {
  return useMutation<AuthResponse, Error, SwitchProfileData>({
    mutationFn: async (data) => {
      const response = await axiosClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.SWITCH_PROFILE,
        data,
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Update tokens in local storage
      updateTokens(data.accessToken, data.refreshToken);

      document.location.reload();
    },
  });
}
