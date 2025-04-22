'use client';

import { useEffect, useState } from 'react';
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

export function InstallPWA(): JSX.Element {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [installed, setInstalled] = useState<boolean>(false);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsOpen(true);
    };

    // Check if already installed
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handler as any);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as any);
    };
  }, []);

  // Hide modal if already installed
  useEffect(() => {
    if (installed) {
      setIsOpen(false);
    }
  }, [installed]);

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
          <Button variant="outline" onClick={() => setIsOpen(false)}>
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
