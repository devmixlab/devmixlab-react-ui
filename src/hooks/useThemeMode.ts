import {useEffect, useState} from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UseThemeModeOptions {
  storageKey?: string;
  attribute?: string | null;
  defaultTheme?: ThemeMode;
}

const isThemeMode = (value: string | null): value is ThemeMode => {
  return value === 'light' || value === 'dark' || value === 'system';
};

const resolveTheme = (theme: ThemeMode) => {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return theme;
};

export function useThemeMode({
                               storageKey = 'mode',
                               attribute,
                               defaultTheme = 'light',
                             }: UseThemeModeOptions = {}) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(false);

  const applyTheme = (theme: ThemeMode) => {
    const resolvedTheme = resolveTheme(theme);

    const root = document.documentElement;

    root.classList.toggle('dark', resolvedTheme === 'dark');

    if (attribute != null) {
      root.setAttribute(attribute, resolvedTheme);
    }

    setIsDark(resolvedTheme === 'dark');
  };

  const setMode = (newMode: ThemeMode) => {
    localStorage.setItem(storageKey, newMode);

    setModeState(newMode);
    applyTheme(newMode);
  };

  useEffect(() => {
    const storedValue = localStorage.getItem(storageKey);

    const stored = isThemeMode(storedValue) ? storedValue : (defaultTheme ?? 'system');

    setModeState(stored);
    applyTheme(stored);

    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const storageValue = localStorage.getItem(storageKey);
      const themeValue = storageValue ?? defaultTheme;

      if (themeValue === 'system') {
        applyTheme('system');
      }
    };

    media.addEventListener('change', handleChange);

    return () => {
      media.removeEventListener('change', handleChange);
    };
  }, [storageKey, defaultTheme]);

  return {
    mode,
    setMode,
    isDark,
  };
}
