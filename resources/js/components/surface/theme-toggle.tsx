import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { appearance, updateAppearance } = useAppearance();

    const isDark =
        appearance === 'dark' ||
        (appearance === 'system' &&
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

    const toggleTheme = () => {
        updateAppearance(isDark ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle Dark/Light Mode"
            className={`relative flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
        >
            {isDark ? (
                <Sun className="h-4 w-4 text-amber-400 animate-in spin-in-90 duration-300" />
            ) : (
                <Moon className="h-4 w-4 text-indigo-600 animate-in spin-in-90 duration-300" />
            )}
        </button>
    );
};
