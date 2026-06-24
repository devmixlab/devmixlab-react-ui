import React, {createContext, useContext} from 'react';
import {ThemeMode, UseThemeModeOptions, useThemeMode} from '../hooks/useThemeMode';

interface ThemeModeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

interface ThemeModeProviderProps extends UseThemeModeOptions {
  children: React.ReactNode;
}

export function ThemeModeProvider({children, ...options}: ThemeModeProviderProps) {
  const theme = useThemeMode(options);

  return <ThemeModeContext.Provider value={theme}>{children}</ThemeModeContext.Provider>;
}

export function useThemeModeCtx() {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error('useThemeModeCtx must be used within ThemeModeContext');
  }

  return context;
}
