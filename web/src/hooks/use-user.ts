import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys.constant";
import { API_ENDPOINTS } from "@/constants/app.constant";
import axiosClient from "@/lib/axios-client";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

interface UpdateProfileDTO {
  name?: string;
  avatar?: string;
}

// Custom hook for fetching user profile
export const useUserProfile = () => {
  return useQuery<UserProfile>({
    queryKey: QUERY_KEYS.USER.PROFILE(),
    queryFn: async () => {
      const { data } = await axiosClient.get(API_ENDPOINTS.AUTH.PROFILE);
      return data;
    },
  });
};

// Custom hook for updating user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: UpdateProfileDTO) => {
      const { data } = await axiosClient.patch(
        API_ENDPOINTS.AUTH.PROFILE,
        updateData
      );
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.ALL });
    },
  });
};
