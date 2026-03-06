'use client';

import { useTheme } from 'next-themes';
import { useCallback } from 'react';

export const useThemeSwitch = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Use resolvedTheme for accurate current theme detection
  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  const updateTheme = useCallback(() => {
    if (theme === 'system') {
      // Toggle between light/dark based on current resolved theme
      if (resolvedTheme === 'dark') {
        setTheme('light');
      } else {
        setTheme('dark');
      }
    } else {
      // Toggle based on current explicit theme
      if (theme === 'dark') {
        setTheme('light');
      } else {
        setTheme('dark');
      }
    }
  }, [theme, resolvedTheme, setTheme]);

  const setCurrentTheme = useCallback(
    (newTheme: string) => {
      setTheme(newTheme);
    },
    [setTheme],
  );

  return {
    currentTheme,
    updateTheme,
    setCurrentTheme,
  };
};

export default useThemeSwitch;
