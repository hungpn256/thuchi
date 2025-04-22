/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ReactElement, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPWA(): ReactElement | null {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [installed, setInstalled] = useState<boolean>(false);
  const [hasBeenShown, setHasBeenShown] = useState<boolean>(true); // Default to true to prevent flash

  useEffect(() => {
    // Kiểm tra localStorage chỉ trên client-side
    const checkLocalStorage = () => {
      // Kiểm tra xem đã cài đặt PWA chưa
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

      // Kiểm tra xem đã hiển thị thông báo PWA chưa
      const shown = localStorage.getItem('pwa-prompt-shown') === 'true';

      setInstalled(isStandalone);
      setHasBeenShown(shown);
    };

    checkLocalStorage();
  }, []);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);

      // Chỉ mở nếu chưa hiển thị trước đó
      if (!hasBeenShown && !installed) {
        setIsOpen(true);
        // Đánh dấu đã hiển thị
        localStorage.setItem('pwa-prompt-shown', 'true');
        setHasBeenShown(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler as any);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as any);
    };
  }, [hasBeenShown, installed]);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const choiceResult = await installPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      setInstalled(true);
      setInstallPrompt(null);
    }
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('pwa-prompt-shown', 'true');
  };

  // Không hiển thị gì nếu đã cài đặt hoặc đã được hiển thị trước đó
  if (installed || hasBeenShown) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
        setIsOpen(open);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cài đặt ứng dụng Thu Chi</DialogTitle>
          <DialogDescription>
            Cài đặt ứng dụng Thu Chi để có trải nghiệm tốt hơn. Bạn có thể sử dụng ứng dụng ngay cả
            khi offline.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            <p className="text-muted-foreground text-sm">
              Cài đặt ứng dụng để dễ dàng truy cập từ màn hình chính của thiết bị.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Để sau
          </Button>
          <Button type="submit" onClick={handleInstall}>
            Cài đặt ngay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
