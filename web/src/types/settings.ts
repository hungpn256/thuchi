export interface Settings {
  id: number;
  userId: number;
  defaultCurrency: string;
  language: string;
  theme: string;
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateSettingsRequest {
  defaultCurrency?: string;
  language?: string;
  theme?: string;
  notificationsEnabled?: boolean;
}
