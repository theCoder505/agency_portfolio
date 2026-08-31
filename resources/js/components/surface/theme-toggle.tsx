import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

interface ThemeToggleProps {
    className?: string;
    isHeroMode?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', isHeroMode = false }) => {
    const { appearance, updateAppearance } = useAppearance();

    const isDark = appearance !== 'light';

    const toggleTheme = () => {
        updateAppearance(isDark ? 'light' : 'dark');
    };

    const baseClasses = isHeroMode
        ? 'border-slate-700/60 bg-slate-900/60 text-slate-200 hover:bg-slate-800/80 hover:text-white'
        : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800';

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle Dark/Light Mode"
            className={`relative flex items-center justify-center p-2 rounded-xl border backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 ${baseClasses} ${className}`}
        >
            {isDark ? (
                <Sun className="h-4 w-4 text-amber-400 animate-in spin-in-90 duration-300" />
            ) : (
                <Moon className={`h-4 w-4 animate-in spin-in-90 duration-300 ${isHeroMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            )}
        </button>
    );
};
