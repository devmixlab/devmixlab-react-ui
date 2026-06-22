import { useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface UseThemeModeOptions {
    storageKey?: string;
    attribute?: string;
}

const isThemeMode = (value: string | null): value is ThemeMode => {
    return value === 'light' || value === 'dark' || value === 'system';
};

export function useThemeMode({
    storageKey = 'mode',
    attribute = 'data-theme',
}: UseThemeModeOptions = {}) {
    const [mode, setModeState] = useState<ThemeMode>('system');
    const [isDark, setIsDark] = useState(false);

    const applyTheme = (theme: ThemeMode) => {
        const resolvedTheme =
            theme === 'system'
                ? window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light'
                : theme;

        const root = document.documentElement;

        root.classList.toggle('dark', resolvedTheme === 'dark');
        root.setAttribute(attribute, resolvedTheme);

        setIsDark(resolvedTheme === 'dark');
    };

    const setMode = (newMode: ThemeMode) => {
        localStorage.setItem(storageKey, newMode);

        setModeState(newMode);
        applyTheme(newMode);
    };

    useEffect(() => {
        const storedValue = localStorage.getItem(storageKey);

        const stored = isThemeMode(storedValue) ? storedValue : 'system';

        setModeState(stored);
        applyTheme(stored);

        const media = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = () => {
            if (localStorage.getItem(storageKey) === 'system') {
                applyTheme('system');
            }
        };

        media.addEventListener('change', handleChange);

        return () => {
            media.removeEventListener('change', handleChange);
        };
    }, [storageKey]);

    return {
        mode,
        setMode,
        isDark,
    };
}
