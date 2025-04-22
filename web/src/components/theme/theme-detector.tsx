'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface ThemeColors {
  light: string;
  dark: string;
}

// Define colors for each theme
const themeColors: ThemeColors = {
  light: '#ffffff', // Light background color
  dark: '#18181b', // Dark background color
};

// Define transition durations
const TRANSITION_DURATION = 300; // ms

export function ThemeDetector() {
  const { theme, resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Handle initial client-side mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Add class to prevent flash during theme change
    document.documentElement.classList.add('changing-theme');

    // Set CSS variable for consistent transition duration
    document.documentElement.style.setProperty(
      '--theme-transition-duration',
      `${TRANSITION_DURATION}ms`,
    );

    // Determine current theme (prioritize resolvedTheme as it accounts for system preferences)
    const currentTheme = resolvedTheme || theme || 'light';
    const themeColor = themeColors[currentTheme as keyof ThemeColors] || themeColors.light;

    // Update theme-color meta tag
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }

    metaThemeColor.setAttribute('content', themeColor);

    // Store theme color for PWA use
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      localStorage.setItem('thuchi-theme-color', themeColor);
    }

    // Remove transition class after change is complete
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('changing-theme');
    }, TRANSITION_DURATION);

    return () => clearTimeout(timer);
  }, [theme, resolvedTheme, isMounted]);

  // This component doesn't render anything visible
  return null;
}
