import React, { useState, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { PaginatedData, SaasSubscription } from '@/types';
import {
    CreditCard,
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    AlertCircle,
    Copy,
    Globe,
    Mail,
    X,
    AlertTriangle
} from 'lucide-react';
import { showConfirmDialog, showToast } from '@/lib/swal';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { useClientDataTable } from '@/hooks/use-client-data-table';
import { Pagination } from '@/components/ui/pagination';
import { formatDateEnUs, formatNumberEnUs } from '@/lib/formatters';
import { RejectionDetailsModal, RejectionModalInfo } from '@/components/ui/rejection-details-modal';

interface SubscriptionsIndexProps {
    subscriptions: SaasSubscription[] | PaginatedData<SaasSubscription>;
    kpis: {
        total: number;
        pending: number;
        pending_invoices?: number;
        pending_renewals?: number;
        total_pending_actions?: number;
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
    const [status, setStatus] = useState(
        typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('status') || 'all' : 'all'
    );
    const [rejectionModalData, setRejectionModalData] = useState<RejectionModalInfo | null>(null);

    const allSubscriptionsList = useMemo(() => {
        return Array.isArray(subscriptions) ? subscriptions : subscriptions?.data || [];
    }, [subscriptions]);

    // Count subscriptions requiring verification
    const pendingActionCount = useMemo(() => {
        return allSubscriptionsList.filter(
            (s) => s.status === 'pending' || s.has_pending_invoice || s.invoices?.some((i) => i.status === 'pending')
        ).length;
    }, [allSubscriptionsList]);

    const pendingRenewalsCount = useMemo(() => {
        return allSubscriptionsList.filter(
            (s) => s.invoices?.some((i) => i.status === 'pending' && i.type === 'renewal')
        ).length;
    }, [allSubscriptionsList]);

    // Status filter
    const filteredByStatus = useMemo(() => {
        if (status === 'all') return allSubscriptionsList;
        if (status === 'pending') {
            return allSubscriptionsList.filter(
                (s) => s.status === 'pending' || s.has_pending_invoice || s.invoices?.some((i) => i.status === 'pending')
            );
        }
        if (status === 'pending_renewals') {
            return allSubscriptionsList.filter(
                (s) => s.invoices?.some((i) => i.status === 'pending' && i.type === 'renewal')
            );
        }
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
        searchFields: [
            'order_number',
            'transaction_id',
            'sender_number',
            'domain',
            'subdomain',
            'user.name',
            'user.email',
            'user.phone',
            'product.name',
            'package_tier',
            'pending_invoice.transaction_id',
            'pending_invoice.sender_number',
            'pending_invoice.invoice_number'
        ],
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
                </div>                {/* Pending Actions Alert Banner */}
                {pendingActionCount > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 dark:border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center space-x-3">
                            <div className="h-9 w-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black animate-pulse shrink-0">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-bold text-xs text-amber-900 dark:text-amber-200">
                                    {pendingActionCount} Subscription Payment{pendingActionCount > 1 ? 's' : ''} Awaiting Admin Verification
                                </div>
                                <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                                    {kpis?.pending ?? 0} new order request{(kpis?.pending ?? 0) === 1 ? '' : 's'} and {pendingRenewalsCount} renewal payment{pendingRenewalsCount === 1 ? '' : 's'} submitted by customers.
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleStatusFilter('pending')}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shrink-0 shadow-xs transition-all self-start sm:self-auto"
                        >
                            View Pending Payments ({pendingActionCount})
                        </button>
                    </div>
                )}

                {/* KPI Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{kpis?.total ?? allSubscriptionsList.length}</div>
                    </div>
                    <div className={`p-4 rounded-2xl border shadow-xs transition-all ${
                        pendingActionCount > 0
                            ? 'bg-amber-500/10 border-amber-500/30 ring-2 ring-amber-500/20'
                            : 'bg-amber-500/5 border-amber-500/20'
                    }`}>
                        <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center justify-between">
                            <span>Pending Verify</span>
                            {pendingActionCount > 0 && (
                                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                            )}
                        </div>
                        <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                            {pendingActionCount}
                        </div>
                        <div className="text-[10px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                            {kpis?.pending ?? 0} new • {pendingRenewalsCount} renewals
                        </div>
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
                            {currencySymbol}{(kpis?.total_revenue ?? 0).toLocaleString('en-US')}
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
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'pending', label: `Pending Verify (${pendingActionCount})`, isAlert: pendingActionCount > 0 },
                            ...(pendingRenewalsCount > 0 ? [{ id: 'pending_renewals', label: `Renewals (${pendingRenewalsCount})`, isAlert: true }] : []),
                            { id: 'active', label: 'Active' },
                            { id: 'expired', label: 'Expired' },
                            { id: 'rejected', label: 'Rejected' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleStatusFilter(tab.id)}
                                className={`px-3 py-1 rounded-lg font-bold capitalize transition-all shrink-0 flex items-center space-x-1.5 ${
                                    status === tab.id
                                        ? tab.isAlert
                                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                                            : 'bg-indigo-600 text-white shadow-xs'
                                        : tab.isAlert
                                        ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <span>{tab.label}</span>
                                {tab.isAlert && status !== tab.id && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                )}
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
                                        <th className="py-3.5 px-4">Status & Invoice</th>
                                        <th className="py-3.5 px-4">Expiry Date</th>
                                        <th className="py-3.5 px-4 text-right">Verification & Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {paginatedItems.map((sub) => {
                                        const pendingInvoice = sub.pending_invoice || sub.invoices?.find((i) => i.status === 'pending');
                                        const isNewOrderPending = sub.status === 'pending';
                                        const isRenewalPending = !isNewOrderPending && !!pendingInvoice;
                                        const hasPendingAction = isNewOrderPending || isRenewalPending;

                                        return (
                                            <tr
                                                key={sub.id}
                                                className={`transition-colors ${
                                                    hasPendingAction
                                                        ? 'bg-amber-500/[0.05] dark:bg-amber-950/20 hover:bg-amber-500/[0.09] dark:hover:bg-amber-950/30 border-l-4 border-l-amber-500'
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                                }`}
                                            >
                                                <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-cyan-400">
                                                    <div className="flex items-center space-x-1.5">
                                                        <span>{sub.order_number}</span>
                                                        {isNewOrderPending && (
                                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500 text-slate-950 shadow-2xs">
                                                                New Order
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-normal font-sans mt-0.5">
                                                        {new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
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
                                                    <div className="text-[10px] text-indigo-600 dark:text-cyan-400 uppercase font-black">
                                                        {sub.package_tier || 'Standard'} Tier
                                                    </div>
                                                    {(sub.domain || sub.subdomain) && (
                                                        <div className="text-[10px] space-y-0.5 mt-0.5">
                                                            <span className="text-slate-400 flex items-center space-x-1">
                                                                <Globe className="h-3 w-3 text-slate-400" />
                                                                <span>Req: {sub.requested_domain || `${sub.subdomain}.codeventure.app`}</span>
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
                                                    {isRenewalPending && pendingInvoice ? (
                                                        <div>
                                                            <div className="font-black text-amber-600 dark:text-amber-400">
                                                                {currencySymbol}{pendingInvoice.amount.toLocaleString('en-US')}
                                                            </div>
                                                            <div className="px-1.5 py-1 mt-1 inline-block text-center bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold capitalize">
                                                                {pendingInvoice.billing_cycle.replace('_', ' ')}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className="font-black text-slate-900 dark:text-white">
                                                                {currencySymbol}{sub.amount.toLocaleString('en-US')}
                                                            </div>
                                                            <span className="text-[10px] text-slate-400 capitalize">
                                                                {sub.billing_cycle.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {isRenewalPending && pendingInvoice ? (
                                                        <div className="space-y-1">
                                                            <div className="flex items-center space-x-1">
                                                                <span className="font-mono font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                                                                    {pendingInvoice.transaction_id || 'N/A'}
                                                                </span>
                                                                {pendingInvoice.transaction_id && (
                                                                    <button
                                                                        onClick={() => handleCopy(pendingInvoice.transaction_id || '', 'Renewal TrxID')}
                                                                        className="p-1 text-amber-600 hover:text-amber-800"
                                                                        title="Copy Renewal TrxID"
                                                                    >
                                                                        <Copy className="h-3 w-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                                                {pendingInvoice.payment_method.toUpperCase()} • Sender: {pendingInvoice.sender_number || 'N/A'}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
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
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {isRenewalPending && pendingInvoice ? (
                                                        <div className="space-y-1">
                                                            <div className="px-2 py-0.5 rounded-full text-[9.5px] font-bold text-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                                {sub.status_badge?.label || 'Active'}
                                                            </div>
                                                            <div className="px-2 py-0.5 rounded-md text-[9.5px] font-black text-center bg-amber-500 text-slate-950 shadow-2xs animate-pulse">
                                                                ⚡ Payment Pending
                                                            </div>
                                                        </div>
                                                    ) : sub.status === 'rejected' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setRejectionModalData({
                                                                title: `Order #${sub.order_number} Rejection Record`,
                                                                reason: sub.rejection_reason || 'Order verification rejected by administrator.',
                                                                orderNumber: sub.order_number,
                                                                transactionId: sub.transaction_id,
                                                                paymentMethod: sub.payment_method,
                                                                senderNumber: sub.sender_number,
                                                                amount: `${currencySymbol}${formatNumberEnUs(sub.amount)}`,
                                                                date: formatDateEnUs(sub.created_at),
                                                            })}
                                                            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-2xs group w-full"
                                                            title="Click to view rejection reason"
                                                        >
                                                            <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500 group-hover:text-white" />
                                                            <span>REJECTED</span>
                                                            <span className="text-[9px] underline opacity-90 group-hover:text-white">(Why?)</span>
                                                        </button>
                                                    ) : (
                                                        <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold min-w-30 text-center ${
                                                            sub.status === 'active'
                                                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse'
                                                        }`}>
                                                            {sub.status_badge?.label || sub.status}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-500">
                                                    {sub.expires_at ? (
                                                        <div>
                                                            <div className="font-mono">{new Date(sub.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                                            <div className="text-[10px] text-slate-400">{sub.days_remaining} days left</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-amber-500 font-semibold">Pending Activation</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end space-x-1.5">
                                                        <Link
                                                            href={`/admin/subscriptions/${sub.order_number || sub.id}`}
                                                            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all ${
                                                                hasPendingAction
                                                                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm ring-2 ring-amber-500/20 font-black'
                                                                    : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-cyan-400'
                                                            }`}
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            <span>{isRenewalPending ? 'Verify' : sub.status === 'pending' ? 'Verify & Approve' : 'Details'}</span>
                                                        </Link>

                                                        <Link
                                                            href={`/admin/subscriptions/${sub.order_number || sub.id}/edit`}
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
                                        );
                                    })}
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

            {/* Rejection Details Popup Modal */}
            <RejectionDetailsModal
                isOpen={Boolean(rejectionModalData)}
                data={rejectionModalData}
                onClose={() => setRejectionModalData(null)}
            />
        </AdminLayout>
    );
}