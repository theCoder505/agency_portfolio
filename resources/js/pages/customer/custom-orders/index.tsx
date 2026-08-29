import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { CustomerLayout } from '@/layouts/customer-layout';
import { CustomOrder, PaginatedData } from '@/types';
import {
    FolderGit2,
    PlusCircle,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    DollarSign,
    Layers,
    Github,
    HardDrive,
    ExternalLink,
    Filter,
    Calendar
} from 'lucide-react';

interface CustomOrderIndexProps {
    orders: PaginatedData<CustomOrder>;
    kpis: {
        total: number;
        pending: number;
        in_progress: number;
        completed: number;
    };
    activeStatus: string;
    currencySymbol: string;
}

export default function CustomOrderIndex({
    orders,
    kpis,
    activeStatus = 'all',
    currencySymbol = '$',
}: CustomOrderIndexProps) {
    const filterTabs = [
        { label: 'All Orders', value: 'all', count: kpis.total },
        { label: 'Under Review', value: 'pending', count: kpis.pending },
        { label: 'In Progress / Accepted', value: 'in_progress', count: kpis.in_progress },
        { label: 'Completed', value: 'completed', count: kpis.completed },
    ];

    const handleFilterChange = (val: string) => {
        router.get('/customer/custom-orders', { status: val }, { preserveState: true });
    };

    return (
        <CustomerLayout
            title="Custom Projects & Milestones"
            breadcrumbs={[{ title: 'Custom Projects' }]}
        >
            <div className="space-y-8 max-w-6xl mx-auto">
                {/* TOP HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Custom Projects & Milestones
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Track your bespoke product requests, milestone payments, and codebase deliverables.
                        </p>
                    </div>

                    <Link
                        href="/custom-orders/request"
                        className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-all shrink-0"
                    >
                        <PlusCircle className="h-4 w-4" />
                        <span>Request New Project</span>
                    </Link>
                </div>

                {/* KPI STATS CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Projects</span>
                            <FolderGit2 className="h-4 w-4 text-indigo-500" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                            {kpis.total}
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Under Review</span>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </div>
                        <p className="text-2xl font-black text-amber-500 mt-2">
                            {kpis.pending}
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Development</span>
                            <Layers className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-black text-blue-500 mt-2">
                            {kpis.in_progress}
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Completed & Delivered</span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-black text-emerald-500 mt-2">
                            {kpis.completed}
                        </p>
                    </div>
                </div>

                {/* FILTER TABS */}
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                    {filterTabs.map((tab) => {
                        const active = activeStatus === tab.value;
                        return (
                            <button
                                key={tab.value}
                                onClick={() => handleFilterChange(tab.value)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                                    active
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                                    active ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* ORDERS LIST */}
                {orders.data.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
                        <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                            <FolderGit2 className="h-8 w-8" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            No custom projects found
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            You have not submitted any custom project requests under this filter.
                        </p>
                        <Link
                            href="/custom-orders/request"
                            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span>Submit a Project Request</span>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.data.map((order) => {
                            const badge = order.status_badge || { label: order.status, color: 'slate' };
                            const milestonesCount = order.milestones?.length || 0;
                            const collectedAmount = order.total_collected_amount || 0;
                            const agreedPrice = order.agreed_price || order.estimated_budget || 0;

                            return (
                                <div
                                    key={order.id}
                                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs hover:border-indigo-500/40 transition-all group"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                        <div className="space-y-3 min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <span className="font-mono text-xs font-black text-indigo-600 dark:text-cyan-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200/60 dark:border-indigo-800">
                                                    #{order.order_number}
                                                </span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
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
                                                {order.category && (
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                        &bull; {order.category}
                                                    </span>
                                                )}
                                            </div>

                                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                                                <Link href={`/customer/custom-orders/${order.id}`}>
                                                    {order.title}
                                                </Link>
                                            </h2>

                                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center space-x-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>Requested {new Date(order.created_at).toLocaleDateString()}</span>
                                                </span>
                                                {order.target_deadline && (
                                                    <span className="flex items-center space-x-1.5 text-indigo-600 dark:text-cyan-400 font-semibold">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span>Due: {new Date(order.target_deadline).toLocaleDateString()}</span>
                                                    </span>
                                                )}
                                                <span className="flex items-center space-x-1.5">
                                                    <Layers className="h-3.5 w-3.5" />
                                                    <span>{milestonesCount} Milestone(s)</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* FINANCIALS & PROGRESS */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:text-right shrink-0">
                                            <div className="space-y-1">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                                    Agreed Amount
                                                </span>
                                                <span className="text-lg font-black text-slate-900 dark:text-white block">
                                                    {order.currency} {agreedPrice.toLocaleString()}
                                                </span>
                                                <span className="text-xs font-semibold text-emerald-500 block">
                                                    {collectedAmount > 0 ? `Collected: ${order.currency} ${collectedAmount.toLocaleString()}` : 'Payment pending'}
                                                </span>
                                            </div>

                                            <Link
                                                href={`/customer/custom-orders/${order.id}`}
                                                className="px-5 py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-indigo-600 dark:hover:bg-indigo-600 transition-all font-bold text-xs flex items-center space-x-2 shrink-0 shadow-xs"
                                            >
                                                <span>Open Workspace</span>
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
