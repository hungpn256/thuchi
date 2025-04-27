import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

type NotificationPermissionType = 'default' | 'granted' | 'denied';

interface NotificationState {
  permission: NotificationPermissionType;
  isSupported: boolean;
}

export const useNotifications = () => {
  const [notificationState, setNotificationState] = useState<NotificationState>({
    permission: 'default',
    isSupported: false,
  });

  useEffect(() => {
    // Kiểm tra xem trình duyệt có hỗ trợ notifications không
    const isSupported = 'Notification' in window;
    setNotificationState({
      permission: isSupported ? (Notification.permission as NotificationPermissionType) : 'denied',
      isSupported,
    });
  }, []);

  const requestPermission = async () => {
    if (!notificationState.isSupported) {
      toast({
        title: 'Không hỗ trợ',
        description: 'Trình duyệt của bạn không hỗ trợ thông báo',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationState((prev) => ({
        ...prev,
        permission: permission as NotificationPermissionType,
      }));

      if (permission === 'granted') {
        toast({
          title: 'Thành công',
          description: 'Đã bật thông báo cho ứng dụng',
        });
        return true;
      } else {
        toast({
          title: 'Thông báo bị từ chối',
          description: 'Vui lòng bật thông báo trong cài đặt của trình duyệt',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể yêu cầu quyền thông báo',
        variant: 'destructive',
      });
      return false;
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!notificationState.isSupported || notificationState.permission !== 'granted') {
      return;
    }

    try {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        ...options,
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  return {
    isSupported: notificationState.isSupported,
    permission: notificationState.permission,
    requestPermission,
    showNotification,
  };
};
