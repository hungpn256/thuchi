/* eslint-disable @typescript-eslint/no-explicit-any */

// Interface cho window.navigator bổ sung với thuộc tính standalone
export interface SafariNavigator extends Navigator {
  standalone?: boolean;
}

// Interface bổ sung cho window object
export interface WindowWithMSStream extends Window {
  MSStream?: unknown;
}

/**
 * Hàm kiểm tra liệu ứng dụng có đang chạy trong PWA trên iOS hay không
 * @returns true nếu đang chạy trong PWA trên iOS, ngược lại là false
 */
export const isIOSPWA = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Kiểm tra iOS
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as WindowWithMSStream).MSStream;

  // Kiểm tra PWA mode - chế độ standalone hoặc fullscreen
  const isPWA =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as SafariNavigator).standalone === true;

  return isIOS && isPWA;
};

/**
 * Kiểm tra xem ứng dụng có đang chạy trong chế độ PWA (Progressive Web App) không
 * @returns true nếu đang chạy trong PWA, ngược lại là false
 */
export const isPWA = (): boolean => {
  if (typeof window === 'undefined') return false;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as SafariNavigator).standalone === true
  );
};

/**
 * Kiểm tra xem thiết bị có phải là iOS không
 * @returns true nếu là thiết bị iOS, ngược lại là false
 */
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;

  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as WindowWithMSStream).MSStream;
};
