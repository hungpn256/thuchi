import { Settings, UpdateSettingsRequest } from '@/types/settings';
import axiosClient from '@/lib/axios-client';

const SETTINGS_URL = 'settings';

export const settingsService = {
  /**
   * Get user settings
   */
  getSettings: async (): Promise<Settings> => {
    const response = await axiosClient.get<Settings>(SETTINGS_URL);
    return response.data;
  },

  /**
   * Update user settings
   */
  updateSettings: async (settings: UpdateSettingsRequest): Promise<Settings> => {
    const response = await axiosClient.put<Settings>(SETTINGS_URL, settings);
    return response.data;
  },
};
