import React from 'react';
import { Link, router } from '@inertiajs/react';
import { CustomerLayout } from '@/layouts/customer-layout';
import { PaginatedData, SaasSubscription } from '@/types';
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
    Filter
} from 'lucide-react';

interface SubscriptionsIndexProps {
    subscriptions: PaginatedData<SaasSubscription>;
    filters: {
        status: string;
    };
    paymentSettings: {
        currency_symbol: string;
        currency_code: string;
    };
}

export default function SubscriptionsIndex({
    subscriptions,
    filters,
    paymentSettings,
}: SubscriptionsIndexProps) {
    const currency = paymentSettings.currency_symbol || '৳';

    const handleFilterChange = (newStatus: string) => {
        router.get('/customer/subscriptions', {
            status: newStatus,
        }, { preserveState: true });
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
                            My SaaS Subscriptions & Packages
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Manage all your cloud applications, renewal invoices, and domain configurations.
                        </p>
                    </div>

                    {/* Status Tabs */}
                    <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs self-start sm:self-auto">
                        {['all', 'active', 'pending', 'expired'].map((st) => (
                            <button
                                key={st}
                                onClick={() => handleFilterChange(st)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                                    filters.status === st || (st === 'all' && (!filters.status || filters.status === 'all'))
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Subscriptions List */}
                {subscriptions.data.length === 0 ? (
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
                        {subscriptions.data.map((sub) => {
                            const badge = sub.status_badge;
                            const daysLeft = sub.days_remaining;

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
                                                {badge.label}
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
                                            Order #{sub.order_number} • {currency}{Number(sub.amount).toLocaleString('en-US')} ({sub.billing_cycle})
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
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <Link
                                            href={`/customer/subscriptions/${sub.id}`}
                                            className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline flex items-center space-x-1"
                                        >
                                            <span>Manage Package</span>
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
            </div>
        </CustomerLayout>
    );
}
