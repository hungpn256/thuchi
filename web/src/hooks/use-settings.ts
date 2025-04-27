import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settings.service';
import { toast } from '@/components/ui/use-toast';

export const SETTINGS_QUERY_KEYS = {
  all: ['settings'] as const,
  detail: () => [...SETTINGS_QUERY_KEYS.all, 'detail'] as const,
};

export const useSettings = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: SETTINGS_QUERY_KEYS.detail(),
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }
      const response = await settingsService.getSettings();
      return response;
    },
  });

  const { mutate: updateSettings, isPending: isUpdating } = useMutation({
    mutationFn: settingsService.updateSettings,
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEYS.detail(), updatedSettings);
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật cài đặt',
      });
    },
    onError: (err) => {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }
      console.error('Error updating settings:', err);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể cập nhật cài đặt',
      });
    },
  });

  const setTheme = (theme: string) => {
    updateSettings({ theme });
  };

  const setLanguage = (language: string) => {
    updateSettings({ language });
  };

  const setCurrency = (defaultCurrency: string) => {
    updateSettings({ defaultCurrency });
  };

  const setNotifications = (notificationsEnabled: boolean) => {
    updateSettings({ notificationsEnabled });
  };

  return {
    settings: data,
    isLoading,
    isUpdating,
    error,
    updateSettings,
    setTheme,
    setLanguage,
    setCurrency,
    setNotifications,
  };
};
