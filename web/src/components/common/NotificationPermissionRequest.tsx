'use client';

import { useEffect, useState } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

export function NotificationPermissionRequest() {
  const { isSupported, permission, requestPermission } = useNotifications();
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    // Kiểm tra xem đã request permission chưa
    const hasRequestedBefore = localStorage.getItem('notification_permission_requested') === 'true';
    setHasRequested(hasRequestedBefore);
  }, [isSupported, permission]);

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      // Lưu trạng thái đã request
      localStorage.setItem('notification_permission_requested', 'true');
      setHasRequested(true);

      // Gửi thông báo test
      new Notification('Thông báo test', {
        body: 'Bạn đã bật thông báo thành công!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
      });
    }
  };

  // Không hiển thị gì nếu:
  // 1. Trình duyệt không hỗ trợ notifications
  // 2. Đã request permission trước đó
  // 3. Đã được cấp quyền hoặc bị từ chối
  if (!isSupported || hasRequested || permission !== 'default') {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
      <div className="bg-background border-border max-w-sm rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <Bell className="text-primary mt-0.5 h-5 w-5" />
          <div className="flex-1">
            <h3 className="font-medium">Bật thông báo</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Bật thông báo để nhận thông tin về các giao dịch và sự kiện quan trọng.
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.setItem('notification_permission_requested', 'true');
              setHasRequested(true);
            }}
          >
            Để sau
          </Button>
          <Button size="sm" onClick={handleRequestPermission}>
            Bật ngay
          </Button>
        </div>
      </div>
    </div>
  );
}
