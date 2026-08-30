import React, { useState, useMemo } from 'react';
import { router, Link } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { VisitorLog, PaginatedData } from '@/types';
import { DateRangeFilter } from '@/components/admin/date-range-filter';
import { Pagination } from '@/components/ui/pagination';
import { useClientDataTable } from '@/hooks/use-client-data-table';
import {
    Search,
    Trash2,
    X
} from 'lucide-react';
import { confirmAction } from '@/lib/swal';

interface VisitorLogIndexProps {
    logs: VisitorLog[] | PaginatedData<VisitorLog>;
}

export default function VisitorLogIndex({ logs }: VisitorLogIndexProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [device, setDevice] = useState('all');
    const [browser, setBrowser] = useState('all');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const allLogsList = useMemo(() => {
        return Array.isArray(logs) ? logs : logs?.data || [];
    }, [logs]);

    // Multi-criteria filter
    const filteredByFilters = useMemo(() => {
        return allLogsList.filter((log) => {
            if (device !== 'all' && log.device_type !== device) return false;
            if (browser !== 'all' && log.browser !== browser) return false;

            if (fromDate && toDate && log.created_at) {
                const logDate = new Date(log.created_at).getTime();
                const start = new Date(fromDate + ' 00:00:00').getTime();
                const end = new Date(toDate + ' 23:59:59').getTime();
                if (logDate < start || logDate > end) return false;
            }
            return true;
        });
    }, [allLogsList, device, browser, fromDate, toDate]);

    // Instant Frontend Search & Pagination
    const {
        search,
        setSearch,
        clearSearch,
        handleImmediateSearch,
        currentPage,
        setCurrentPage,
        totalPages,
        totalItems,
        from,
        to,
        paginatedItems,
    } = useClientDataTable<VisitorLog>({
        items: filteredByFilters,
        pageSize: 20,
        searchFields: ['ip_address', 'url', 'referer', 'device_type', 'browser', 'platform', 'portfolio.title'],
    });

    const handleDeviceChange = (dev: string) => {
        setDevice(dev);
        setCurrentPage(1);
    };

    const handleBrowserChange = (br: string) => {
        setBrowser(br);
        setCurrentPage(1);
    };

    const handleDateApply = (fromVal: string, toVal: string) => {
        setFromDate(fromVal);
        setToDate(toVal);
        setCurrentPage(1);
    };

    const handleDateClear = () => {
        setFromDate('');
        setToDate('');
        setCurrentPage(1);
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedItems.length && paginatedItems.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedItems.map((l) => l.id));
        }
    };

    const handleDelete = async (log: VisitorLog) => {
        const confirmed = await confirmAction({
            title: 'Delete this log entry?',
            text: 'This log entry will be removed.',
            confirmButtonText: 'Yes, delete',
        });

        if (confirmed) {
            router.delete(`/admin/visitor-logs/${log.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds((prev) => prev.filter((id) => id !== log.id));
                },
            });
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        const confirmed = await confirmAction({
            title: `Delete ${selectedIds.length} Selected Logs?`,
            text: 'Are you sure you want to delete these log records?',
            confirmButtonText: `Delete ${selectedIds.length} Logs`,
        });

        if (confirmed) {
            router.post(
                '/admin/visitor-logs/bulk-delete',
                { ids: selectedIds },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSelectedIds([]);
                    },
                }
            );
        }
    };

    const handleClearAll = async () => {
        const confirmed = await confirmAction({
            title: 'Clear ALL Visitor Logs?',
            text: 'This will purge all recorded visitor telemetry logs from the database.',
            confirmButtonText: 'Yes, purge all logs',
        });

        if (confirmed) {
            router.post('/admin/visitor-logs/clear-all', {}, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout
            title="Visitor Logs & Telemetry"
            breadcrumbs={[{ title: 'Visitor Logs' }]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Visitor Traffic & Access Logs
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Real-time recorded IPs, devices, browsers, and project visit events.
                        </p>
                    </div>

                    <button
                        onClick={handleClearAll}
                        className="px-4 py-2 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white border border-red-500/20 text-xs font-bold transition-all self-start sm:self-auto"
                    >
                        Purge All Logs
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <form onSubmit={handleImmediateSearch} className="relative w-full sm:w-72">
                            <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by IP, URL, or referer..."
                                className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </form>

                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                value={device ?? 'all'}
                                onChange={(e) => handleDeviceChange(e.target.value)}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold"
                            >
                                <option value="all">All Devices</option>
                                <option value="Desktop">Desktop</option>
                                <option value="Mobile">Mobile</option>
                                <option value="Tablet">Tablet</option>
                            </select>

                            <select
                                value={browser ?? 'all'}
                                onChange={(e) => handleBrowserChange(e.target.value)}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold"
                            >
                                <option value="all">All Browsers</option>
                                <option value="Chrome">Chrome</option>
                                <option value="Safari">Safari</option>
                                <option value="Firefox">Firefox</option>
                                <option value="Edge">Edge</option>
                            </select>

                            <DateRangeFilter
                                fromDate={fromDate ?? ''}
                                toDate={toDate ?? ''}
                                onApply={handleDateApply}
                                onClear={handleDateClear}
                            />
                        </div>
                    </div>

                    {/* Bulk Selection Bar */}
                    {selectedIds.length > 0 && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-xs animate-in fade-in">
                            <span className="font-bold text-indigo-900 dark:text-indigo-200">
                                {selectedIds.length} log(s) selected
                            </span>
                            <button
                                onClick={handleBulkDelete}
                                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Bulk Delete</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Logs Table */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === paginatedItems.length && paginatedItems.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </th>
                                    <th className="p-4">IP Address</th>
                                    <th className="p-4">Requested URL / Page</th>
                                    <th className="p-4">Project Associated</th>
                                    <th className="p-4">Device & Browser</th>
                                    <th className="p-4">OS / Platform</th>
                                    <th className="p-4">Timestamp</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {paginatedItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-12 text-slate-400">
                                            No visitor logs recorded.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedItems.map((log) => {
                                        const isSelected = selectedIds.includes(log.id);

                                        return (
                                            <tr
                                                key={log.id}
                                                className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                                                    isSelected ? 'bg-indigo-50/60 dark:bg-indigo-950/40' : ''
                                                }`}
                                            >
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelect(log.id)}
                                                        className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                </td>

                                                {/* IP Address */}
                                                <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                                                    {log.ip_address}
                                                </td>

                                                {/* URL */}
                                                <td className="p-4 max-w-xs font-mono text-[11px] text-slate-500 truncate" title={log.url || ''}>
                                                    {log.url}
                                                </td>

                                                {/* Project */}
                                                <td className="p-4">
                                                    {log.portfolio ? (
                                                        <div className="px-2 py-0.5 text-center rounded bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-cyan-400 font-bold text-[11px]">
                                                            {log.portfolio.title}
                                                        </div>
                                                    ) : (
                                                        <div className="text-slate-400 text-[11px] text-center">—</div>
                                                    )}
                                                </td>

                                                {/* Device & Browser */}
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-1.5">
                                                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                            {log.device_type}
                                                        </span>
                                                        <span className="text-slate-400">•</span>
                                                        <span className="text-slate-500">{log.browser}</span>
                                                    </div>
                                                </td>

                                                {/* Platform */}
                                                <td className="p-4 text-slate-500">
                                                    {log.platform}
                                                </td>

                                                {/* Date */}
                                                <td className="p-4 text-slate-500 whitespace-nowrap">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </td>

                                                {/* Delete Single */}
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(log)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                                        title="Delete log"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <Pagination
                        from={from}
                        to={to}
                        total={totalItems}
                        currentPage={currentPage}
                        lastPage={totalPages}
                        onPageChange={setCurrentPage}
                        itemLabel="visitor logs"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
