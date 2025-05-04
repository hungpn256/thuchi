export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionPayload {
  deviceId: string;
  deviceType: 'web';
  deviceName?: string;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  endpoint: string;
  expirationTime?: string | null;
  keys: PushSubscriptionKeys;
}
