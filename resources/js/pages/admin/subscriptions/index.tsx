import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { PaginatedData, SaasSubscription } from '@/types';
import {
    CreditCard,
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    Copy,
    Globe,
    Building2,
    Calendar,
    ArrowUpRight,
    TrendingUp,
    Check,
    Mail,
    X
} from 'lucide-react';
import { showConfirmDialog, showToast } from '@/lib/swal';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { useClientDataTable } from '@/hooks/use-client-data-table';
import { Pagination } from '@/components/ui/pagination';

interface SubscriptionsIndexProps {
    subscriptions: SaasSubscription[] | PaginatedData<SaasSubscription>;
    kpis: {
        total: number;
        pending: number;
        active: number;
        expired: number;
        rejected?: number;
        total_revenue: number;
    };
    currencySymbol?: string;
}

export default function SubscriptionsIndex({
    subscriptions,
    kpis,
    currencySymbol = '৳',
}: SubscriptionsIndexProps) {
    const [status, setStatus] = useState('all');

    const allSubscriptionsList = useMemo(() => {
        return Array.isArray(subscriptions) ? subscriptions : subscriptions?.data || [];
    }, [subscriptions]);

    // Status filter
    const filteredByStatus = useMemo(() => {
        if (status === 'all') return allSubscriptionsList;
        return allSubscriptionsList.filter((s) => s.status === status);
    }, [allSubscriptionsList, status]);

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
        pageSize: 15,
        searchFields: ['order_number', 'transaction_id', 'sender_number', 'domain', 'subdomain', 'user.name', 'user.email', 'user.phone', 'product.name', 'package_tier'],
    });

    const handleStatusFilter = (newStatus: string) => {
        setStatus(newStatus);
        setCurrentPage(1);
    };

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        showToast(`${label} copied!`, 'success');
    };

    const handleDelete = async (id: number, orderNum: string) => {
        const confirmed = await showConfirmDialog(
            'Delete Subscription Order?',
            `Are you sure you want to delete order "${orderNum}"?`
        );
        if (confirmed) {
            router.delete(`/admin/subscriptions/${id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout
            title="Orders & Subscriptions"
            breadcrumbs={[{ title: 'Subscriptions' }]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            SaaS Order & Subscription Management
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Verify customer bKash/Nagad transactions, assign custom domains, and activate SaaS accounts.
                        </p>
                    </div>

                    <Link
                        href="/admin/subscriptions/create"
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all self-start sm:self-auto"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Create Subscription</span>
                    </Link>
                </div>

                {/* KPI Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{kpis?.total ?? allSubscriptionsList.length}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 shadow-xs">
                        <div className="text-[11px] font-bold text-amber-600 dark:amber-400 uppercase tracking-wider">Pending Verify</div>
                        <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{kpis?.pending ?? 0}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 shadow-xs">
                        <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Apps</div>
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{kpis?.active ?? 0}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expired</div>
                        <div className="text-xl font-black text-slate-700 dark:text-slate-300 mt-1">{kpis?.expired ?? 0}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 shadow-xs">
                        <div className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">Rejected</div>
                        <div className="text-xl font-black text-rose-500 mt-1">{kpis?.rejected ?? 0}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 shadow-xs">
                        <div className="text-[11px] font-bold text-indigo-600 dark:text-cyan-400 uppercase tracking-wider">Total Volume</div>
                        <div className="text-xl font-black text-indigo-600 dark:text-cyan-400 mt-1 truncate">
                            {currencySymbol}{(kpis?.total_revenue ?? 0).toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <form onSubmit={handleImmediateSearch} className="relative w-full sm:w-80">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search order #, TrxID, customer, domain..."
                            className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                        />
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        {search && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
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
                                {st} {st === 'pending' && kpis?.pending > 0 && `(${kpis.pending})`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Subscriptions Table Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                    {paginatedItems.length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                            <CreditCard className="h-10 w-10 text-slate-400 mx-auto" />
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No subscriptions found</h3>
                            <p className="text-xs text-slate-400">Orders placed by customers will appear here.</p>
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
                                    {paginatedItems.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-cyan-400">
                                                {sub.order_number}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {(() => {
                                                    const clientWhatsapp = sub.client_whatsapp || sub.user?.whatsapp_number || sub.user?.phone || '';
                                                    const clientEmail = sub.client_email || sub.user?.email || '';
                                                    const cleanWhatsapp = clientWhatsapp.replace(/[^0-9]/g, '');
                                                    const whatsappPrompt = `Hello ${sub.user?.name || 'Customer'}, this is CodeVenture Tech regarding your SaaS subscription #${sub.order_number} for ${sub.product?.name || 'Software'}.`;
                                                    const whatsappUrl = cleanWhatsapp ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(whatsappPrompt)}` : '';

                                                    return (
                                                        <div className="space-y-1">
                                                            <div className="font-bold text-slate-900 dark:text-white">{sub.user?.name || 'Customer'}</div>
                                                            <div className="flex items-center space-x-1.5">
                                                                {clientEmail && (
                                                                    <a
                                                                        href={`mailto:${clientEmail}?subject=${encodeURIComponent(`[CodeVenture Tech] Subscription #${sub.order_number}`)}`}
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
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-slate-800 dark:text-slate-200">{sub.product?.name || 'SaaS Product'}</div>
                                                {(sub.domain || sub.subdomain) && (
                                                    <div className="text-[10px] space-y-0.5 mt-0.5">
                                                        <span className="text-slate-400 flex items-center space-x-1">
                                                            <Globe className="h-3 w-3 text-slate-400" />
                                                            <span>Req: {sub.domain || `${sub.subdomain}.codeventure.app`}</span>
                                                        </span>
                                                        {sub.status === 'active' && (
                                                            <span className="font-mono text-[9.5px] text-indigo-600 dark:text-cyan-400 font-semibold block pl-4">
                                                                Live: {sub.domain || `${sub.subdomain}.codeventure.app`}
                                                            </span>
                                                        )}
                                                    </div>
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
                                                <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold min-w-30 text-center ${
                                                    sub.status === 'active'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                        : sub.status === 'pending'
                                                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse'
                                                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                                }`}>
                                                    {sub.status_badge?.label || sub.status}
                                                </div>
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
            </div>
        </AdminLayout>
    );
}