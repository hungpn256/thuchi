import axiosClient from '@/lib/axios-client';
import { PushSubscriptionPayload } from '@/types/push-subscription';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const SERVICE_WORKER_PATH = '/sw.js';
const DEVICE_ID_KEY = 'web_push_device_id';

export function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export async function getOrCreateSubscription(): Promise<PushSubscriptionPayload | null> {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
  ) {
    return null;
  }
  // Đăng ký service worker nếu chưa có
  const reg = await navigator.serviceWorker.register(SERVICE_WORKER_PATH);
  // Lấy subscription hiện tại hoặc tạo mới
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }
  const raw = sub.toJSON();
  if (!raw.endpoint || !raw.keys) throw new Error('Push subscription missing endpoint or keys');
  const keys = raw.keys as Record<string, string>;
  if (!keys.p256dh || !keys.auth) throw new Error('Push subscription keys missing p256dh or auth');
  return {
    deviceId: getDeviceId(),
    deviceType: 'web',
    endpoint: raw.endpoint,
    expirationTime: raw.expirationTime ? String(raw.expirationTime) : null,
    keys: { p256dh: keys.p256dh, auth: keys.auth },
    // Có thể bổ sung deviceName, deviceModel, osVersion, appVersion nếu muốn
  };
}

export async function registerWebPush(): Promise<void> {
  const payload = await getOrCreateSubscription();
  console.log('🚀 ~ registerWebPush ~ payload:', payload);
  if (!payload) return;
  await axiosClient.post('/notifications/subscribe', payload);
}

export async function unregisterWebPush(): Promise<void> {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
  ) {
    return;
  }
  const reg = await navigator.serviceWorker.getRegistration(SERVICE_WORKER_PATH);
  const sub = reg && (await reg.pushManager.getSubscription());
  if (sub) {
    const deviceId = getDeviceId();
    await axiosClient.delete(`/notifications/unsubscribe/${deviceId}`);
    await sub.unsubscribe();
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
