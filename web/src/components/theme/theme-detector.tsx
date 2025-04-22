'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

// Định nghĩa màu cho từng theme
const themeColors = {
  light: '#ffffff', // Màu nền sáng
  dark: '#18181b', // Màu nền tối
};

export function ThemeDetector() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    // Xác định theme hiện tại (ưu tiên resolvedTheme vì nó đã tính đến system preference)
    const currentTheme = resolvedTheme || theme || 'light';
    const themeColor = themeColors[currentTheme as keyof typeof themeColors] || themeColors.light;

    // Cập nhật thẻ meta theme-color
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }

    metaThemeColor.setAttribute('content', themeColor);

    // Lưu lại nếu người dùng sử dụng PWA
    if ('localStorage' in window) {
      localStorage.setItem('thuchi-theme-color', themeColor);
    }
  }, [theme, resolvedTheme]);

  // Component này không render gì cả
  return null;
}
