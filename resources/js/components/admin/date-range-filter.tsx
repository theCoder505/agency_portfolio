import React, { useState } from 'react';
import { Calendar, Filter, X } from 'lucide-react';

interface DateRangeFilterProps {
    fromDate?: string;
    toDate?: string;
    onApply: (from: string, to: string) => void;
    onClear?: () => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
    fromDate = '',
    toDate = '',
    onApply,
    onClear,
}) => {
    const [from, setFrom] = useState(fromDate);
    const [to, setTo] = useState(toDate);

    const handleApply = (e: React.FormEvent) => {
        e.preventDefault();
        onApply(from, to);
    };

    const handleReset = () => {
        setFrom('');
        setTo('');
        if (onClear) onClear();
    };

    const hasFilter = Boolean(from || to);

    return (
        <form onSubmit={handleApply} className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs shadow-sm">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">From:</span>
                <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="bg-transparent text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                />
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs shadow-sm">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">To:</span>
                <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="bg-transparent text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                />
            </div>

            <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1"
            >
                <Filter className="h-3 w-3" />
                <span>Filter</span>
            </button>

            {hasFilter && (
                <button
                    type="button"
                    onClick={handleReset}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Clear Date Filter"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </form>
    );
};
