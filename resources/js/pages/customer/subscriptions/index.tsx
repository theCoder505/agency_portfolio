import React, { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { CustomerLayout } from '@/layouts/customer-layout';
import { PaginatedData, SaasSubscription } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { Pagination } from '@/components/ui/pagination';
import { useClientDataTable } from '@/hooks/use-client-data-table';
import {
    Layers,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Globe,
    Key,
    RefreshCw,
    Search,
    Filter,
    X,
    ExternalLink,
    LayoutDashboard,
    ShieldCheck
} from 'lucide-react';

interface SubscriptionsIndexProps {
    subscriptions: SaasSubscription[] | PaginatedData<SaasSubscription>;
    paymentSettings: {
        currency_symbol: string;
        currency_code: string;
    };
}

export default function SubscriptionsIndex({
    subscriptions,
    paymentSettings,
}: SubscriptionsIndexProps) {
    const currency = paymentSettings?.currency_symbol || '৳';
    const [activeStatus, setActiveStatus] = useState('all');

    const allSubscriptionsList = useMemo(() => {
        return Array.isArray(subscriptions) ? subscriptions : subscriptions?.data || [];
    }, [subscriptions]);

    // Status filter
    const filteredByStatus = useMemo(() => {
        if (activeStatus === 'all') return allSubscriptionsList;
        return allSubscriptionsList.filter((s) => s.status === activeStatus);
    }, [allSubscriptionsList, activeStatus]);

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
    } = useClientDataTable<SaasSubscription>({
        items: filteredByStatus,
        pageSize: 9,
        searchFields: ['order_number', 'domain', 'subdomain', 'transaction_id', 'product.name', 'package_tier'],
    });

    const handleStatusFilter = (st: string) => {
        setActiveStatus(st);
        setCurrentPage(1);
    };

    // Helper to get Live URL
    const getSurfaceUrl = (sub: SaasSubscription) => {
        if (sub.domain) return `https://${sub.domain}`;
        if (sub.subdomain) return `https://${sub.subdomain}.codeventure.app`;
        return null;
    };

    // Helper to get Admin Panel URL
    const getAdminPanelUrl = (sub: SaasSubscription) => {
        const surface = getSurfaceUrl(sub);
        if (!surface) return null;
        return `${surface}/admin`;
    };

    return (
        <CustomerLayout
            title="My Subscriptions"
            breadcrumbs={[{ title: 'My Subscriptions' }]}
        >
            <div className="space-y-6">
                {/* Header & Status Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            My SaaS Subscriptions & Applications
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Directly access your deployed surface websites, admin control panels, and cloud packages.
                        </p>
                    </div>

                    {/* Filter Tabs and Live Search */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <form onSubmit={handleImmediateSearch} className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search subscriptions, domain..."
                                className="w-full pl-8 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-1 focus:ring-indigo-500"
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

                        <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs self-start sm:self-auto">
                            {['all', 'active', 'pending', 'expired'].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => handleStatusFilter(st)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                                        activeStatus === st
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Subscriptions List */}
                {paginatedItems.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-3">
                        <Layers className="h-10 w-10 text-slate-400 mx-auto" />
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No subscriptions found</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            You have no subscriptions matching the selected filter.
                        </p>
                        <Link
                            href="/saas-products"
                            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm"
                        >
                            <span>Explore SaaS Products</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedItems.map((sub) => {
                            const badge = sub.status_badge;
                            const daysLeft = sub.days_remaining;
                            const surfaceUrl = getSurfaceUrl(sub);
                            const adminPanelUrl = getAdminPanelUrl(sub);

                            return (
                                <div
                                    key={sub.id}
                                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-5"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-3">
                                            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                                                <Layers className="h-5 w-5" />
                                            </div>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                sub.status === 'active'
                                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                    : sub.status === 'pending'
                                                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                            }`}>
                                                {badge?.label || sub.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                                                {sub.product?.name || 'SaaS Product'}
                                            </h3>
                                            {sub.package_tier && (
                                                <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 text-[10px] font-black uppercase border border-indigo-200/60 dark:border-indigo-800">
                                                    {sub.package_tier}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">
                                            Order #{sub.order_number} • {formatCurrency(sub.amount, sub.currency || currency, 0)} ({sub.billing_cycle})
                                        </div>

                                        {/* Status & Deadline Info */}
                                        <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800 space-y-1.5 text-xs">
                                            {sub.status === 'active' ? (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500">Days Remaining:</span>
                                                    <span className="font-bold text-emerald-500">{daysLeft} Days</span>
                                                </div>
                                            ) : sub.status === 'pending' ? (
                                                <div className="text-amber-500 font-semibold flex items-center space-x-1.5">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>Awaiting Admin Verification</span>
                                                </div>
                                            ) : (
                                                <div className="text-rose-500 font-semibold flex items-center space-x-1.5">
                                                    <AlertCircle className="h-3.5 w-3.5" />
                                                    <span>Expired - Renewal Required</span>
                                                </div>
                                            )}

                                            <div className="text-[10px] text-slate-400">
                                                Expires: {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending Activation'}
                                            </div>
                                        </div>

                                        {/* Surface Website & Admin Panel Quick Action Tiles */}
                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Live Application Endpoints
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                {/* Surface Website */}
                                                {surfaceUrl ? (
                                                    <a
                                                        href={surfaceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-cyan-300 transition-all flex flex-col justify-between group"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <Globe className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
                                                            <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                        <div className="mt-1.5">
                                                            <div className="text-[11px] font-bold">Surface Website</div>
                                                            <div className="text-[9px] text-indigo-500/80 dark:text-cyan-400/80 truncate">Public Frontend</div>
                                                        </div>
                                                    </a>
                                                ) : (
                                                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 text-slate-400 flex flex-col justify-between opacity-70">
                                                        <Globe className="h-4 w-4 text-slate-400" />
                                                        <div className="mt-1.5">
                                                            <div className="text-[11px] font-semibold">Surface Website</div>
                                                            <div className="text-[9px] text-slate-400">Pending Setup</div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Website Admin Panel */}
                                                {adminPanelUrl ? (
                                                    <a
                                                        href={adminPanelUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 border border-slate-800 dark:border-slate-700 text-white transition-all flex flex-col justify-between group shadow-xs"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <LayoutDashboard className="h-4 w-4 text-cyan-400" />
                                                            <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                        <div className="mt-1.5">
                                                            <div className="text-[11px] font-bold text-white">Admin Panel</div>
                                                            <div className="text-[9px] text-slate-300 truncate">Backend Portal</div>
                                                        </div>
                                                    </a>
                                                ) : (
                                                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 text-slate-400 flex flex-col justify-between opacity-70">
                                                        <LayoutDashboard className="h-4 w-4 text-slate-400" />
                                                        <div className="mt-1.5">
                                                            <div className="text-[11px] font-semibold">Admin Panel</div>
                                                            <div className="text-[9px] text-slate-400">Pending Setup</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <Link
                                            href={`/customer/subscriptions/${sub.id}`}
                                            className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline flex items-center space-x-1"
                                        >
                                            <span>Manage & Credentials</span>
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </Link>

                                        {(sub.status === 'expired' || sub.days_remaining <= 7) && (
                                            <Link
                                                href={`/customer/subscriptions/${sub.id}`}
                                                className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1"
                                            >
                                                <RefreshCw className="h-3 w-3" />
                                                <span>Renew</span>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <Pagination
                    from={from}
                    to={to}
                    total={totalItems}
                    currentPage={currentPage}
                    lastPage={totalPages}
                    onPageChange={setCurrentPage}
                    itemLabel="subscriptions"
                />
            </div>
        </CustomerLayout>
    );
}
