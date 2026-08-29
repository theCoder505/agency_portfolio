import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { CustomOrder, PaginatedData } from '@/types';
import {
    FolderGit2,
    PlusCircle,
    Search,
    Clock,
    CheckCircle2,
    AlertCircle,
    Eye,
    Trash2,
    DollarSign,
    Layers,
    Calendar,
    User,
    Mail,
    ArrowUpRight,
    Filter,
    XCircle
} from 'lucide-react';
import { showConfirmDialog, showToast } from '@/lib/swal';

interface CustomOrderIndexProps {
    orders: PaginatedData<CustomOrder>;
    kpis: {
        total: number;
        pending: number;
        in_progress: number;
        completed: number;
        denied: number;
        total_collected: number;
    };
    filters: {
        search: string;
        status: string;
    };
    currencySymbol: string;
}

export default function CustomOrderAdminIndex({
    orders,
    kpis,
    filters,
    currencySymbol = '$',
}: CustomOrderIndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/custom-orders', { search, status: filters.status }, { preserveState: true });
    };

    const handleStatusFilter = (st: string) => {
        router.get('/admin/custom-orders', { search: filters.search, status: st }, { preserveState: true });
    };

    const handleDelete = (order: CustomOrder) => {
        showConfirmDialog(
            'Delete Custom Order?',
            `Are you sure you want to permanently delete order #${order.order_number}? All milestones and payment records will be removed.`,
            'Delete Order'
        ).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/custom-orders/${order.id}`);
            }
        });
    };

    const statusTabs = [
        { label: 'All Orders', value: 'all', count: kpis.total },
        { label: 'Pending Review', value: 'pending', count: kpis.pending, badgeColor: 'bg-amber-500 text-slate-950' },
        { label: 'In Progress / Accepted', value: 'in_progress', count: kpis.in_progress },
        { label: 'Completed', value: 'completed', count: kpis.completed },
        { label: 'Denied', value: 'denied', count: kpis.denied },
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
                            Review custom project proposals, structure payment milestones, share payment channels, and deliver source code.
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
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                            <span>Total Orders</span>
                            <FolderGit2 className="h-4 w-4 text-indigo-500" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                            {kpis.total}
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                            <span>Pending Review</span>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </div>
                        <p className="text-2xl font-black text-amber-500 mt-2">
                            {kpis.pending}
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                            <span>Active Development</span>
                            <Layers className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-black text-blue-500 mt-2">
                            {kpis.in_progress}
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                            <span>Delivered / Done</span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-black text-emerald-500 mt-2">
                            {kpis.completed}
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                            <span>Revenue Collected</span>
                            <DollarSign className="h-4 w-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 truncate">
                            {currencySymbol}{kpis.total_collected.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* SEARCH & FILTERS */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Filter Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                            {statusTabs.map((tab) => {
                                const active = (filters.status || 'all') === tab.value;
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
                        <form onSubmit={handleSearch} className="relative w-full md:w-80">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search order #, client, title..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </form>
                    </div>

                    {/* TABLE */}
                    {orders.data.length === 0 ? (
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
                                        <th className="py-3 px-3">Milestones & Collected</th>
                                        <th className="py-3 px-3">Status</th>
                                        <th className="py-3 px-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {orders.data.map((order) => {
                                        const badge = order.status_badge || { label: order.status, color: 'slate' };
                                        const agreedPrice = order.agreed_price || order.estimated_budget || 0;
                                        const collected = order.total_collected_amount || 0;
                                        const milestonesCount = order.milestones?.length || 0;

                                        return (
                                            <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                                {/* Order # */}
                                                <td className="py-3.5 px-3 font-mono font-bold text-indigo-600 dark:text-cyan-400">
                                                    <Link href={`/admin/custom-orders/${order.id}`} className="hover:underline">
                                                        #{order.order_number}
                                                    </Link>
                                                    <span className="block text-[10px] font-normal text-slate-400">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </span>
                                                </td>

                                                {/* Project Title */}
                                                <td className="py-3.5 px-3">
                                                    <Link
                                                        href={`/admin/custom-orders/${order.id}`}
                                                        className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors block max-w-xs truncate"
                                                    >
                                                        {order.title}
                                                    </Link>
                                                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                                        {order.category || 'Custom Software'}
                                                    </span>
                                                </td>

                                                {/* Client */}
                                                <td className="py-3.5 px-3">
                                                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                                        {order.user?.name || 'Guest / Direct'}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 block font-mono">
                                                        {order.user?.email}
                                                    </span>
                                                </td>

                                                {/* Agreed / Budget */}
                                                <td className="py-3.5 px-3">
                                                    <span className="font-black text-slate-900 dark:text-white text-sm block">
                                                        {order.currency} {agreedPrice.toLocaleString()}
                                                    </span>
                                                    {order.target_deadline && (
                                                        <span className="text-[10px] text-indigo-500 font-semibold block">
                                                            Due: {new Date(order.target_deadline).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Milestones & Collected */}
                                                <td className="py-3.5 px-3">
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                                                        {milestonesCount} Milestone(s)
                                                    </span>
                                                    <span className="text-[11px] font-bold text-emerald-500 block">
                                                        Collected: {order.currency} {collected.toLocaleString()}
                                                    </span>
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
                                                            href={`/admin/custom-orders/${order.id}`}
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
                    {orders.links && orders.links.length > 3 && (
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                            <span className="text-slate-400">
                                Showing {orders.from || 0} to {orders.to || 0} of {orders.total} custom orders
                            </span>
                            <div className="flex items-center space-x-1">
                                {orders.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                            link.active
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
