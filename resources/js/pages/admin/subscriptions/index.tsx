import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { PaginatedData, SaasSubscription } from '@/types';
import {
    CreditCard,
    Plus,
    Search,
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Eye,
    Edit2,
    Trash2,
    Copy,
    Globe,
    Smartphone,
    DollarSign,
    RefreshCw
} from 'lucide-react';
import { showConfirmDialog, showToast } from '@/lib/swal';

interface SubscriptionsIndexProps {
    subscriptions: PaginatedData<SaasSubscription>;
    kpis: {
        total: number;
        pending: number;
        active: number;
        expired: number;
        total_revenue: number;
    };
    filters: {
        search: string;
        status: string;
        cycle: string;
    };
    currencySymbol: string;
}

export default function SubscriptionsIndex({
    subscriptions,
    kpis,
    filters,
    currencySymbol,
}: SubscriptionsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/subscriptions', { search, status }, { preserveState: true });
    };

    const handleStatusFilter = (newStatus: string) => {
        setStatus(newStatus);
        router.get('/admin/subscriptions', { search, status: newStatus }, { preserveState: true });
    };

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        showToast(`${label} copied!`, 'success');
    };

    const handleDelete = (id: number, orderNum: string) => {
        showConfirmDialog(
            'Delete Subscription Order?',
            `Are you sure you want to delete order "${orderNum}"?`
        ).then((res) => {
            if (res.isConfirmed) {
                router.delete(`/admin/subscriptions/${id}`);
            }
        });
    };

    return (
        <AdminLayout
            title="Orders & Subscriptions"
            breadcrumbs={[{ title: 'Subscriptions' }]}
        >
            <div className="space-y-6">
                {/* Header & New Manual Subscription Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            Customer Orders & Subscriptions
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Cross-check bKash/Nagad transactions, assign custom domains, configure credentials, and manage service terms.
                        </p>
                    </div>

                    <Link
                        href="/admin/subscriptions/create"
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all self-start sm:self-auto"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Create Subscription Manually</span>
                    </Link>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-3.5">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold shrink-0">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-slate-400">Pending Verification</span>
                            <div className="text-xl font-black text-amber-500">{kpis.pending}</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-3.5">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold shrink-0">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-slate-400">Active Deployments</span>
                            <div className="text-xl font-black text-emerald-500">{kpis.active}</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-3.5">
                        <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold shrink-0">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-slate-400">Expired Deadlines</span>
                            <div className="text-xl font-black text-rose-500">{kpis.expired}</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-3.5">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold shrink-0">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-slate-400">Validated Revenue</span>
                            <div className="text-xl font-black text-slate-900 dark:text-white">
                                {currencySymbol}{kpis.total_revenue.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search order #, TrxID, customer, domain..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                        />
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    </form>

                    <div className="flex items-center space-x-1 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto self-stretch sm:self-auto">
                        {['all', 'pending', 'active', 'expired', 'rejected'].map((st) => (
                            <button
                                key={st}
                                onClick={() => handleStatusFilter(st)}
                                className={`px-3 py-1 rounded-lg font-bold capitalize transition-all shrink-0 ${
                                    status === st
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {st} {st === 'pending' && kpis.pending > 0 && `(${kpis.pending})`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Subscriptions Table Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                    {subscriptions.data.length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                            <CreditCard className="h-10 w-10 text-slate-400 mx-auto" />
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No subscriptions found</h3>
                            <p className="text-xs text-slate-400">Orders placed by customers will appear here for verification.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-slate-50/70 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                                        <th className="py-3.5 px-4">Order #</th>
                                        <th className="py-3.5 px-4">Customer</th>
                                        <th className="py-3.5 px-4">SaaS Product</th>
                                        <th className="py-3.5 px-4">Term & Amount</th>
                                        <th className="py-3.5 px-4">bKash/Nagad TrxID</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4">Expiry Date</th>
                                        <th className="py-3.5 px-4 text-right">Verification & Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {subscriptions.data.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-cyan-400">
                                                {sub.order_number}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-slate-900 dark:text-white">{sub.user?.name || 'Customer'}</div>
                                                <div className="text-[11px] text-slate-400">{sub.user?.email} • {sub.user?.phone || 'No phone'}</div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-slate-800 dark:text-slate-200">{sub.product?.name || 'SaaS Product'}</div>
                                                {(sub.domain || sub.subdomain) && (
                                                    <span className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                                                        <Globe className="h-3 w-3" />
                                                        <span>{sub.domain || `${sub.subdomain}.codeventure.app`}</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-black text-slate-900 dark:text-white">
                                                    {currencySymbol}{sub.amount.toLocaleString()}
                                                </div>
                                                <span className="text-[10px] text-slate-400 capitalize">
                                                    {sub.billing_cycle.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center space-x-1.5">
                                                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                                        {sub.transaction_id || 'N/A'}
                                                    </span>
                                                    {sub.transaction_id && (
                                                        <button
                                                            onClick={() => handleCopy(sub.transaction_id || '', 'TrxID')}
                                                            className="p-1 text-slate-400 hover:text-indigo-600"
                                                            title="Copy TrxID"
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                    {sub.payment_method.toUpperCase()} • Sender: {sub.sender_number || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                    sub.status === 'active'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                        : sub.status === 'pending'
                                                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse'
                                                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                                }`}>
                                                    {sub.status_badge.label}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500">
                                                {sub.expires_at ? (
                                                    <div>
                                                        <div>{new Date(sub.expires_at).toLocaleDateString()}</div>
                                                        <div className="text-[10px] text-slate-400">{sub.days_remaining} days left</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-amber-500 font-semibold">Pending Activation</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end space-x-1.5">
                                                    <Link
                                                        href={`/admin/subscriptions/${sub.id}`}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 ${
                                                            sub.status === 'pending'
                                                                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs'
                                                                : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-cyan-400'
                                                        }`}
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        <span>{sub.status === 'pending' ? 'Verify & Approve' : 'Details'}</span>
                                                    </Link>

                                                    <Link
                                                        href={`/admin/subscriptions/${sub.id}/edit`}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                        title="Edit Details"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Link>

                                                    <button
                                                        onClick={() => handleDelete(sub.id, sub.order_number)}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                                        title="Delete Order"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
