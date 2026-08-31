import { useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const applyTheme = (appearance: Appearance) => {
    // If explicitly set to 'light', use light mode. Otherwise (dark, system, or unset), default to dark.
    const isDark = appearance === 'system'
        ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        : appearance !== 'light';

    if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', isDark);
    }
};

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    if (currentAppearance === 'system') {
        applyTheme('system');
    }
};

export function initializeTheme() {
    if (typeof window === 'undefined') return;
    const savedAppearance = (localStorage.getItem('appearance') as Appearance) || 'dark';

    applyTheme(savedAppearance);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('appearance') as Appearance) || 'dark';
        }
        return 'dark';
    });

    const updateAppearance = (mode: Appearance) => {
        setAppearance(mode);
        if (typeof window !== 'undefined') {
            localStorage.setItem('appearance', mode);
        }
        applyTheme(mode);
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const savedAppearance = (localStorage.getItem('appearance') as Appearance | null) || 'dark';
        setAppearance(savedAppearance);
        applyTheme(savedAppearance);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', handleSystemThemeChange);
        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }, []);

    return { appearance, updateAppearance };
}
