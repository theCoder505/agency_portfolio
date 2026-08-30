import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { CustomOrder, PaginatedData } from '@/types';
import {
    FolderGit2,
    Plus,
    PlusCircle,
    Search,
    Edit2,
    Trash2,
    Eye,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Layers,
    DollarSign,
    Calendar,
    ArrowRight,
    TrendingUp,
    FileText,
    Percent,
    ExternalLink,
    Briefcase,
    ShieldAlert,
    Coins,
    Mail,
    X
} from 'lucide-react';
import { showConfirmDialog, showToast } from '@/lib/swal';
import { Pagination } from '@/components/ui/pagination';
import { useClientDataTable } from '@/hooks/use-client-data-table';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { getCustomOrderUrl } from '@/lib/utils';

interface CustomOrderIndexProps {
    orders: CustomOrder[] | PaginatedData<CustomOrder>;
    kpis: {
        total: number;
        pending: number;
        in_progress: number;
        completed: number;
        overdue?: number;
        denied: number;
        total_agreed?: number;
        total_collected?: number;
        collected_by_currency?: {
            BDT?: number;
            USD?: number;
            EUR?: number;
        };
    };
    currencySymbol?: string;
}

export default function CustomOrderAdminIndex({
    orders,
    kpis,
    currencySymbol = '৳',
}: CustomOrderIndexProps) {
    const [activeStatus, setActiveStatus] = useState('all');

    const allOrdersList = useMemo(() => {
        return Array.isArray(orders) ? orders : orders?.data || [];
    }, [orders]);

    // Status filter
    const filteredByStatus = useMemo(() => {
        if (activeStatus === 'all') return allOrdersList;
        if (activeStatus === 'in_progress') {
            return allOrdersList.filter((o) => o.status === 'accepted' || o.status === 'in_progress');
        }
        if (activeStatus === 'overdue') {
            return allOrdersList.filter((o) => o.is_late && !['completed', 'cancelled', 'denied'].includes(o.status));
        }
        return allOrdersList.filter((o) => o.status === activeStatus);
    }, [allOrdersList, activeStatus]);

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
    } = useClientDataTable<CustomOrder>({
        items: filteredByStatus,
        pageSize: 15,
        searchFields: ['order_number', 'title', 'category', 'requirements', 'client_email', 'client_whatsapp', 'user.name', 'user.email', 'user.phone'],
    });

    const handleStatusFilter = (st: string) => {
        setActiveStatus(st);
        setCurrentPage(1);
    };

    const handleDelete = async (order: CustomOrder) => {
        const confirmed = await showConfirmDialog(
            'Delete Custom Order?',
            `Are you sure you want to permanently delete order #${order.order_number}? All milestones and payment records will be removed.`,
            'Delete Order'
        );
        if (confirmed) {
            router.delete(`/admin/custom-orders/${order.id}`, { preserveScroll: true });
        }
    };

    const statusTabs = [
        { label: 'All Orders', value: 'all', count: kpis?.total ?? allOrdersList.length },
        { label: 'Pending Review', value: 'pending', count: kpis?.pending ?? allOrdersList.filter(o => o.status === 'pending').length, badgeColor: 'bg-amber-500 text-slate-950' },
        { label: 'Active Development', value: 'in_progress', count: kpis?.in_progress ?? allOrdersList.filter(o => o.status === 'accepted' || o.status === 'in_progress').length },
        { label: 'Completed', value: 'completed', count: kpis?.completed ?? allOrdersList.filter(o => o.status === 'completed').length },
        { label: 'Overdue / Late', value: 'overdue', count: kpis?.overdue || 0, badgeColor: 'bg-rose-500 text-white' },
        { label: 'Denied', value: 'denied', count: kpis?.denied ?? allOrdersList.filter(o => o.status === 'denied').length },
    ];

    return (
        <AdminLayout
            title="Custom Product Orders"
            breadcrumbs={[{ title: 'Custom Orders' }]}
        >
            <div className="space-y-8 max-w-7xl mx-auto">
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Custom Product Orders & Milestones
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Review custom project proposals, structure payment milestones, track settled payments, and deliver source code.
                        </p>
                    </div>

                    <Link
                        href="/admin/custom-orders/create"
                        className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all shrink-0"
                    >
                        <PlusCircle className="h-4 w-4" />
                        <span>Create Custom Order</span>
                    </Link>
                </div>

                {/* KPI METRIC CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                            <span>Total Orders</span>
                            <FolderGit2 className="h-4 w-4 text-indigo-500" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                            {kpis?.total ?? allOrdersList.length}
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                            <span>Pending Review</span>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </div>
                        <p className="text-2xl font-black text-amber-500 mt-2">
                            {kpis?.pending ?? 0}
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                            <span>In Development</span>
                            <Layers className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-black text-blue-500 mt-2">
                            {kpis?.in_progress ?? 0}
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                            <span>Late / Overdue</span>
                            <AlertTriangle className="h-4 w-4 text-rose-500" />
                        </div>
                        <p className="text-2xl font-black text-rose-500 mt-2">
                            {kpis?.overdue || 0}
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                            <span>Delivered / Done</span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-black text-emerald-500 mt-2">
                            {kpis?.completed ?? 0}
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                            <span>Revenue Settled</span>
                            <DollarSign className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="space-y-1 mt-1">
                            <div className="flex justify-between items-baseline text-xs">
                                <span className="font-bold text-slate-400">USD:</span>
                                <span className="font-black font-mono text-emerald-600 dark:text-emerald-400">
                                    ${(kpis?.collected_by_currency?.USD ?? 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-baseline text-xs">
                                <span className="font-bold text-slate-400">EUR:</span>
                                <span className="font-black font-mono text-blue-600 dark:text-cyan-400">
                                    €{(kpis?.collected_by_currency?.EUR ?? 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-baseline text-xs">
                                <span className="font-bold text-slate-400">BDT:</span>
                                <span className="font-black font-mono text-indigo-600 dark:text-indigo-400">
                                    ৳{(kpis?.collected_by_currency?.BDT ?? 0).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEARCH & FILTERS */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Filter Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                            {statusTabs.map((tab) => {
                                const active = activeStatus === tab.value;
                                return (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        onClick={() => handleStatusFilter(tab.value)}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                                            active
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        <span>{tab.label}</span>
                                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                            active ? 'bg-white/20 text-white' : tab.badgeColor || 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={handleImmediateSearch} className="relative w-full md:w-80">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search order #, client, title..."
                                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </form>
                    </div>

                    {/* TABLE */}
                    {paginatedItems.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 space-y-2">
                            <FolderGit2 className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
                            <p className="text-sm font-semibold">No custom orders found matching criteria.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                                        <th className="py-3 px-3">Order #</th>
                                        <th className="py-3 px-3">Project Title & Category</th>
                                        <th className="py-3 px-3">Client</th>
                                        <th className="py-3 px-3">Agreed / Budget</th>
                                        <th className="py-3 px-3">Milestones & Settlement</th>
                                        <th className="py-3 px-3">Status</th>
                                        <th className="py-3 px-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {paginatedItems.map((order) => {
                                        const badge = order.status_badge || { label: order.status, color: 'slate' };
                                        const agreedPrice = order.agreed_price || order.estimated_budget || 0;
                                        const collected = order.total_collected_amount || 0;
                                        const milestonesCount = order.milestones?.length || 0;
                                        const progress = order.progress_percentage ?? (agreedPrice > 0 ? Math.min(100, Math.round((collected / agreedPrice) * 100)) : 0);
                                        const orderShowUrl = order.admin_show_url || getCustomOrderUrl(order, 'admin');

                                        return (
                                            <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                                {/* Order # */}
                                                <td className="py-3.5 px-3 font-mono font-bold text-indigo-600 dark:text-cyan-400">
                                                    <Link href={orderShowUrl} className="hover:underline">
                                                        #{order.order_number}
                                                    </Link>
                                                    <span className="block text-[10px] font-normal text-slate-400">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </span>
                                                    {order.has_pending_budget_request && (
                                                        <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 font-bold text-[10px] mt-1 border border-amber-500/20">
                                                             <Coins className="h-3 w-3" />
                                                             <span>Budget Req</span>
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Project Title */}
                                                <td className="py-3.5 px-3">
                                                    <Link
                                                        href={orderShowUrl}
                                                        className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors block max-w-xs truncate"
                                                    >
                                                        {order.title}
                                                    </Link>
                                                    <div className="flex items-center space-x-1 text-[11px] text-slate-500 dark:text-slate-400">
                                                        <span>{order.category || 'Custom Software'}</span>
                                                        {order.is_late && (
                                                            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-1 rounded">
                                                                Overdue {order.days_overdue}d
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Client & Fast Chat */}
                                                <td className="py-3.5 px-3">
                                                    {(() => {
                                                        const clientWhatsapp = order.client_whatsapp || order.user?.whatsapp_number || order.user?.phone || '';
                                                        const clientEmail = order.client_email || order.user?.email || '';
                                                        const cleanWhatsapp = clientWhatsapp.replace(/[^0-9]/g, '');
                                                        const whatsappPrompt = `Hello ${order.user?.name || 'Client'}, this is CodeVenture Tech regarding your project #${order.order_number} (${order.title}).`;
                                                        const whatsappUrl = cleanWhatsapp ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(whatsappPrompt)}` : '';

                                                        return (
                                                            <div className="space-y-1">
                                                                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                                                    {order.user?.name || 'Guest / Direct'}
                                                                </span>
                                                                <div className="flex items-center space-x-1.5">
                                                                    {clientEmail && (
                                                                        <a
                                                                            href={`mailto:${clientEmail}?subject=${encodeURIComponent(`[CodeVenture Tech] Project #${order.order_number}`)}`}
                                                                            className="text-[11px] text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 font-mono truncate max-w-[130px] inline-flex items-center space-x-1"
                                                                            title={`Email: ${clientEmail}`}
                                                                        >
                                                                            <Mail className="h-3 w-3 shrink-0" />
                                                                            <span className="truncate">{clientEmail}</span>
                                                                        </a>
                                                                    )}
                                                                    {whatsappUrl && (
                                                                        <a
                                                                            href={whatsappUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs"
                                                                            title={`WhatsApp: ${clientWhatsapp}`}
                                                                        >
                                                                            <WhatsAppIcon className="h-3.5 w-3.5" />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </td>

                                                {/* Agreed / Budget */}
                                                <td className="py-3.5 px-3">
                                                    <span className="font-black text-slate-900 dark:text-white text-sm block font-mono">
                                                        {order.currency} {agreedPrice.toLocaleString()}
                                                    </span>
                                                    {order.target_deadline && (
                                                        <span className="text-[10px] text-indigo-500 font-semibold block">
                                                            Target: {new Date(order.target_deadline).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Milestones & Progress */}
                                                <td className="py-3.5 px-3 space-y-1">
                                                    <div className="flex items-center justify-between text-[11px]">
                                                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                            {milestonesCount} Milestones
                                                        </span>
                                                        <span className="font-mono text-emerald-500 font-bold">
                                                            {progress}% Paid
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 w-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-500 rounded-full transition-all"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </td>

                                                {/* Status Badge */}
                                                <td className="py-3.5 px-3">
                                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                        badge.color === 'emerald'
                                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                            : badge.color === 'amber'
                                                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                            : badge.color === 'indigo' || badge.color === 'blue'
                                                            ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                                                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                                    }`}>
                                                        {badge.label}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3.5 px-3 text-right">
                                                    <div className="flex items-center justify-end space-x-1.5">
                                                        <Link
                                                            href={orderShowUrl}
                                                            className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                                                            title="Manage Order & Milestones"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(order)}
                                                            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                                            title="Delete Order"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* PAGINATION */}
                    <Pagination
                        from={from}
                        to={to}
                        total={totalItems}
                        currentPage={currentPage}
                        lastPage={totalPages}
                        onPageChange={setCurrentPage}
                        itemLabel="custom orders"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
