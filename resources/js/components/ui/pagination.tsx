import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationLink } from '@/types';

interface PaginationProps {
    links?: PaginationLink[];
    from?: number | null;
    to?: number | null;
    total?: number;
    currentPage?: number;
    lastPage?: number;
    onPageChange?: (page: number) => void;
    className?: string;
    itemLabel?: string;
}

export function Pagination({
    links,
    from,
    to,
    total,
    currentPage,
    lastPage,
    onPageChange,
    className = '',
    itemLabel = 'entries',
}: PaginationProps) {
    // If no records or only 1 page with no items, don't show pagination
    const totalCount = total ?? 0;
    const fromCount = from ?? (totalCount > 0 ? 1 : 0);
    const toCount = to ?? totalCount;

    if (totalCount === 0) {
        return null;
    }

    // Determine if we are using Inertia links or client-side onPageChange
    const hasInertiaLinks = links && links.length > 0;
    const totalPages = lastPage ?? (hasInertiaLinks ? links.length - 2 : 1);

    return (
        <div className={`p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${className}`}>
            <span className="text-slate-500 dark:text-slate-400 font-medium">
                Showing <strong className="text-slate-800 dark:text-slate-200">{fromCount}</strong> to{' '}
                <strong className="text-slate-800 dark:text-slate-200">{toCount}</strong> of{' '}
                <strong className="text-slate-800 dark:text-slate-200">{totalCount}</strong> {itemLabel}
            </span>

            <div className="flex items-center space-x-1 flex-wrap gap-y-1 justify-center">
                {hasInertiaLinks ? (
                    links.map((link, idx) => {
                        const isPrev = link.label.includes('Previous') || link.label.includes('&laquo;') || link.label.includes('‹');
                        const isNext = link.label.includes('Next') || link.label.includes('&raquo;') || link.label.includes('›');
                        const isNumber = !isPrev && !isNext;

                        if (!link.url && !link.active) {
                            return (
                                <span
                                    key={idx}
                                    className="px-2.5 py-1.5 rounded-lg text-slate-300 dark:text-slate-700 text-xs font-bold cursor-not-allowed select-none"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        }

                        return (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                preserveScroll
                                preserveState
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    link.active
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    })
                ) : totalPages > 1 ? (
                    <>
                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => onPageChange && currentPage && onPageChange(currentPage - 1)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            title="Previous Page"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                            const isCurrent = pageNum === currentPage;
                            // Show first, last, current, and adjacent pages
                            const shouldShow =
                                totalPages <= 7 ||
                                pageNum === 1 ||
                                pageNum === totalPages ||
                                (currentPage && Math.abs(pageNum - currentPage) <= 1);

                            if (!shouldShow) {
                                if (
                                    (pageNum === 2 && currentPage && currentPage > 3) ||
                                    (pageNum === totalPages - 1 && currentPage && currentPage < totalPages - 2)
                                ) {
                                    return (
                                        <span key={pageNum} className="px-1.5 text-slate-400">
                                            ...
                                        </span>
                                    );
                                }
                                return null;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => onPageChange && onPageChange(pageNum)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        isCurrent
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() => onPageChange && currentPage && onPageChange(currentPage + 1)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            title="Next Page"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </>
                ) : null}
            </div>
        </div>
    );
}
