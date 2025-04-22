import { useTheme as useNextTheme } from 'next-themes';
import { useSettings } from './use-settings';

export function useTheme() {
  const { theme, setTheme: setNextTheme } = useNextTheme();
  const { updateSettings } = useSettings();

  // Wrap the original setTheme to also update in API
  const setTheme = (newTheme: string) => {
    setNextTheme(newTheme);

    // Call API to save user preference
    updateSettings({ theme: newTheme });
  };

  return {
    theme,
    setTheme,
  };
}
