import React, { useState, FormEventHandler } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { SaasSubscription, SubscriptionInvoice } from '@/types';
import {
    CreditCard,
    CheckCircle2,
    ArrowLeft,
    Copy,
    Check,
    User,
    Shield,
    Receipt,
    Search,
    X,
    XCircle,
    AlertTriangle,
    Info,
    Coins,
    Edit3
} from 'lucide-react';
import { showConfirmDialog, showToast } from '@/lib/swal';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { useClientDataTable } from '@/hooks/use-client-data-table';
import { Pagination } from '@/components/ui/pagination';

interface SubscriptionShowProps {
    subscription: SaasSubscription;
    currencySymbol: string;
}

export default function SubscriptionShow({
    subscription,
    currencySymbol = '৳',
}: SubscriptionShowProps) {
    const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
    const [isRejecting, setIsRejecting] = useState(false);
    const [isRateModalOpen, setIsRateModalOpen] = useState(false);
    const [rejectingInvoiceId, setRejectingInvoiceId] = useState<number | null>(null);
    const [invoiceRejectionReason, setInvoiceRejectionReason] = useState('');

    // Rejection reason modal state
    const [rejectionModalData, setRejectionModalData] = useState<{
        isOpen: boolean;
        title: string;
        reason: string;
        invoiceNumber?: string;
        orderNumber?: string;
        transactionId?: string | null;
        paymentMethod?: string;
        senderNumber?: string | null;
        amount?: string;
        date?: string;
    } | null>(null);

    const handleOpenRejectionModal = (data: {
        title: string;
        reason: string;
        invoiceNumber?: string;
        orderNumber?: string;
        transactionId?: string | null;
        paymentMethod?: string;
        senderNumber?: string | null;
        amount?: string;
        date?: string;
    }) => {
        setRejectionModalData({
            isOpen: true,
            ...data,
        });
    };

    const targetSubKey = subscription.order_number || subscription.id;

    // Format ISO dates into clean human-readable date format (e.g. 30 Aug 2026)
    const formatDateHuman = (dateStr?: string | null) => {
        if (!dateStr) return null;
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const invoicesList = subscription?.invoices || [];
    const invsTable = useClientDataTable<SubscriptionInvoice>({
        data: invoicesList,
        searchFields: (inv) => [inv.invoice_number, inv.type, inv.payment_method, inv.transaction_id, inv.sender_number || '', inv.status],
        initialPageSize: 10,
    });

    // Check for pending renewal invoice
    const pendingRenewalInvoice = invoicesList.find((i) => i.status === 'pending');

    // Calculate default dates
    const todayStr = new Date().toISOString().split('T')[0];
    const getDefaultExpiryDate = () => {
        const base = (subscription.status === 'active' && subscription.expires_at && new Date(subscription.expires_at) > new Date())
            ? new Date(subscription.expires_at)
            : new Date();

        const cycle = pendingRenewalInvoice?.billing_cycle || subscription.billing_cycle || 'monthly';
        const d = new Date(base.getTime());

        if (cycle === 'half_yearly') {
            d.setMonth(d.getMonth() + 6);
        } else if (cycle === 'yearly') {
            d.setFullYear(d.getFullYear() + 1);
        } else {
            d.setMonth(d.getMonth() + 1);
        }
        return d.toISOString().split('T')[0];
    };

    const approvalForm = useForm<{
        starts_at: string;
        expires_at: string;
        domain: string;
        subdomain: string;
        exchange_rate_to_bdt: number | string;
        admin_notes: string;
        invoice_id: number | string;
    }>({
        starts_at: subscription.starts_at ? subscription.starts_at.split('T')[0] : todayStr,
        expires_at: getDefaultExpiryDate(),
        domain: subscription.domain || '',
        subdomain: subscription.subdomain || '',
        exchange_rate_to_bdt: subscription.exchange_rate_to_bdt || subscription.effective_exchange_rate || (subscription.currency === 'EUR' ? 130 : (subscription.currency === 'USD' ? 120 : 1)),
        admin_notes: subscription.admin_notes || '',
        invoice_id: pendingRenewalInvoice?.id || '',
    });

    const rateForm = useForm<{
        exchange_rate_to_bdt: number | string;
    }>({
        exchange_rate_to_bdt: subscription.exchange_rate_to_bdt || subscription.effective_exchange_rate || (subscription.currency === 'EUR' ? 130 : (subscription.currency === 'USD' ? 120 : 1)),
    });

    const handleRateSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        rateForm.post(`/admin/subscriptions/${targetSubKey}/exchange-rate`, {
            onSuccess: () => {
                setIsRateModalOpen(false);
                showToast('Exchange rate updated successfully!', 'success');
            },
        });
    };

    const rejectionForm = useForm({
        rejection_reason: '',
    });

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedLabel(label);
        showToast(`${label} copied to clipboard!`, 'success');
        setTimeout(() => setCopiedLabel(null), 2500);
    };

    const handleApprove: FormEventHandler = async (e) => {
        e.preventDefault();
        const confirmed = await showConfirmDialog(
            'Approve & Activate Subscription?',
            `This will mark Order #${subscription.order_number} as Active and provide credentials/domain access to customer ${subscription.user?.name}.`
        );
        if (confirmed) {
            approvalForm.post(`/admin/subscriptions/${targetSubKey}/approve`);
        }
    };

    const handleReject: FormEventHandler = (e) => {
        e.preventDefault();
        rejectionForm.post(`/admin/subscriptions/${targetSubKey}/reject`, {
            onSuccess: () => setIsRejecting(false),
        });
    };

    const handleApproveSpecificInvoice = async (inv: SubscriptionInvoice) => {
        const confirmed = await showConfirmDialog(
            `Approve Invoice #${inv.invoice_number}?`,
            `This will mark transaction (${inv.transaction_id || 'N/A'}) as PAID and automatically extend the subscription deadline.`
        );
        if (confirmed) {
            router.post(`/admin/subscriptions/${targetSubKey}/invoices/${inv.id}/approve`, {}, {
                preserveScroll: true,
            });
        }
    };

    const handleRejectSpecificInvoice = async (e: React.FormEvent, invoiceId: number) => {
        e.preventDefault();
        if (!invoiceRejectionReason.trim()) {
            showToast('Please provide a reason for rejecting this transaction.', 'warning');
            return;
        }

        router.post(`/admin/subscriptions/${targetSubKey}/invoices/${invoiceId}/reject`, {
            rejection_reason: invoiceRejectionReason,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setRejectingInvoiceId(null);
                setInvoiceRejectionReason('');
            },
        });
    };

    return (
        <AdminLayout
            title={`Order #${subscription.order_number} Verification`}
            breadcrumbs={[
                { title: 'Subscriptions', href: '/admin/subscriptions' },
                { title: `Order #${subscription.order_number}` },
            ]}
        >
            <div className="space-y-6 w-full">
                {/* Header Navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/admin/subscriptions"
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                    Order #{subscription.order_number}
                                </h1>
                                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-300 text-xs font-black uppercase border border-indigo-200/60 dark:border-indigo-800">
                                    {subscription.package_tier || 'Standard'} Tier
                                </span>
                                {subscription.status === 'rejected' ? (
                                    <button
                                        type="button"
                                        onClick={() => handleOpenRejectionModal({
                                            title: `Order #${subscription.order_number} Rejection Record`,
                                            reason: subscription.rejection_reason || 'Order verification rejected by administrator.',
                                            orderNumber: subscription.order_number,
                                            transactionId: subscription.transaction_id,
                                            paymentMethod: subscription.payment_method,
                                            senderNumber: subscription.sender_number,
                                            amount: `${currencySymbol}${subscription.amount.toLocaleString('en-US')}`,
                                            date: new Date(subscription.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                        })}
                                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all flex items-center space-x-1 cursor-pointer shadow-2xs"
                                        title="Click to view recorded rejection reason"
                                    >
                                        <AlertTriangle className="h-3 w-3 shrink-0" />
                                        <span>{subscription.status_badge.label}</span>
                                        <span className="text-[9.5px] underline ml-0.5">(View Reason)</span>
                                    </button>
                                ) : (
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${subscription.status === 'active'
                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                        : subscription.status === 'pending'
                                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse'
                                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                        }`}>
                                        {subscription.status_badge.label}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Submitted on {new Date(subscription.created_at).toLocaleString('en-US')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* REJECTION REASON NOTIFICATION BANNER */}
                {subscription.status === 'rejected' && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 dark:border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                        <div className="flex items-start sm:items-center space-x-3.5">
                            <div className="h-10 w-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black shrink-0 shadow-sm">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-black text-sm text-rose-900 dark:text-rose-200">
                                    Order Verification Rejected
                                </div>
                                <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5 line-clamp-1">
                                    Recorded Reason: <span className="font-semibold">&ldquo;{subscription.rejection_reason || 'No specific reason recorded.'}&rdquo;</span>
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleOpenRejectionModal({
                                title: `Order #${subscription.order_number} Rejection Record`,
                                reason: subscription.rejection_reason || 'Order verification rejected by administrator.',
                                orderNumber: subscription.order_number,
                                transactionId: subscription.transaction_id,
                                paymentMethod: subscription.payment_method,
                                senderNumber: subscription.sender_number,
                                amount: `${currencySymbol}${subscription.amount.toLocaleString('en-US')}`,
                                date: new Date(subscription.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            })}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 shadow-xs transition-all self-start sm:self-auto flex items-center space-x-1.5"
                        >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>View Full Reason & Details</span>
                        </button>
                    </div>
                )}

                {/* INFO GRID: CUSTOMER + ORDER SUMMARY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Customer Account Details */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <User className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                Customer Contact & Account
                            </h2>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Name:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{subscription.user?.name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Email:</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300">{subscription.client_email || subscription.user?.email || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Phone / WhatsApp:</span>
                                <div className="flex items-center space-x-1.5 font-mono">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{subscription.client_whatsapp || subscription.user?.phone || 'N/A'}</span>
                                    {subscription.client_whatsapp && (
                                        <a
                                            href={`https://wa.me/${subscription.client_whatsapp.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-emerald-500 hover:text-emerald-600"
                                            title="Open WhatsApp"
                                        >
                                            <WhatsAppIcon className="h-3.5 w-3.5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                            {subscription.user?.company_name && (
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Company:</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{subscription.user?.company_name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order & Transaction Summary */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <CreditCard className="h-4 w-4 text-emerald-500" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                SaaS Package &amp; Transaction Details
                            </h2>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Software Product:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{subscription.product?.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Package Tier & Cycle:</span>
                                <span className="font-bold text-indigo-600 dark:text-cyan-400 capitalize">
                                    {subscription.package_tier || 'Standard'} Tier • {subscription.billing_cycle.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Amount Charged:</span>
                                <div className="text-right">
                                    <span className="font-black text-slate-900 dark:text-white">
                                        {currencySymbol}{subscription.amount.toLocaleString()} {subscription.currency}
                                    </span>
                                    {subscription.currency !== 'BDT' && (
                                        <div className="flex items-center justify-end space-x-1.5 mt-0.5">
                                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                                ≈ ৳{(subscription.amount * (subscription.exchange_rate_to_bdt || subscription.effective_exchange_rate || (subscription.currency === 'EUR' ? 130 : 120))).toLocaleString()} BDT (1 {subscription.currency} = ৳{subscription.exchange_rate_to_bdt || subscription.effective_exchange_rate || (subscription.currency === 'EUR' ? 130 : 120)})
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setIsRateModalOpen(true)}
                                                className="p-1 rounded bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 transition-colors"
                                                title="Edit Historical Conversion Rate"
                                            >
                                                <Edit3 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Payment Gateway:</span>
                                <span className="font-bold uppercase font-mono">{subscription.payment_method}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Sender Mobile:</span>
                                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{subscription.sender_number || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Transaction ID (TrxID):</span>
                                <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                                    <span className="font-mono font-black text-sm text-indigo-600 dark:text-cyan-400">
                                        {subscription.transaction_id || 'N/A'}
                                    </span>
                                    {subscription.transaction_id && (
                                        <button
                                            onClick={() => handleCopy(subscription.transaction_id || '', 'TrxID')}
                                            className="p-1 text-slate-400 hover:text-indigo-600"
                                            title="Copy TrxID"
                                        >
                                            {copiedLabel === 'TrxID' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* APPROVAL & DEPLOYMENT CONFIGURATION FORM */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center space-x-2">
                            <Shield className="h-5 w-5 text-emerald-500" />
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                {subscription.status === 'active' ? 'Update Active Subscription & Credentials' : 'Validate & Activate Subscription'}
                            </h2>
                        </div>

                        {subscription.status === 'pending' && (
                            <button
                                onClick={() => setIsRejecting(!isRejecting)}
                                className="text-xs font-bold text-red-500 hover:underline"
                            >
                                {isRejecting ? 'Cancel Rejection' : 'Reject Order'}
                            </button>
                        )}
                    </div>

                    {isRejecting ? (
                        <form onSubmit={handleReject} className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 space-y-3">
                            <div className="text-xs font-bold text-red-700 dark:text-red-300">
                                Enter Rejection Reason:
                            </div>
                            <textarea
                                required
                                rows={3}
                                value={rejectionForm.data.rejection_reason}
                                onChange={(e) => rejectionForm.setData('rejection_reason', e.target.value)}
                                placeholder="e.g. Transaction ID was not found in bKash account statement..."
                                className="w-full px-3 py-2 rounded-xl border border-red-300 dark:border-red-800 bg-white dark:bg-slate-950 text-xs"
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsRejecting(false)}
                                    className="px-3 py-1.5 rounded-lg border text-xs text-slate-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={rejectionForm.processing}
                                    className="px-4 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleApprove} className="space-y-4">
                            {/* Dates & Exchange Rate */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Subscription Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={approvalForm.data.starts_at}
                                        onChange={(e) => approvalForm.setData('starts_at', e.target.value)}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Subscription Expiry / Deadline Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={approvalForm.data.expires_at}
                                        onChange={(e) => approvalForm.setData('expires_at', e.target.value)}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="text-[10px] text-slate-400 mt-1 block">
                                        Calculated for {subscription.billing_cycle.replace('_', ' ')} duration.
                                    </span>
                                </div>

                                {subscription.currency !== 'BDT' && (
                                    <div>
                                        <label className="block text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                                            1 {subscription.currency} = Exchange Rate to BDT (৳) *
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">৳</span>
                                            <input
                                                type="number"
                                                min="0.01"
                                                step="any"
                                                required
                                                value={approvalForm.data.exchange_rate_to_bdt}
                                                onChange={(e) => approvalForm.setData('exchange_rate_to_bdt', e.target.value)}
                                                placeholder={subscription.currency === 'EUR' ? '130.00' : '120.00'}
                                                className="w-full pl-7 pr-3 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-950 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500"
                                            />
                                        </div>
                                        <span className="text-[10px] text-slate-400 mt-1 block">
                                            Applied historical rate at time of order.
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Domain & Subdomain Setup */}
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400">
                                    Domain &amp; Subdomain Routing (Requested by User vs Provided to User)
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Provided Custom Domain (to User)
                                            </label>
                                            {(subscription.requested_domain || subscription.domain) && (
                                                <span className="text-[10px] text-slate-400">
                                                    Requested: <span className="font-mono text-indigo-600 dark:text-cyan-400">{subscription.requested_domain || subscription.domain}</span>
                                                </span>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            value={approvalForm.data.domain}
                                            onChange={(e) => approvalForm.setData('domain', e.target.value)}
                                            placeholder={subscription.requested_domain || subscription.domain || "e.g. clientbrand.com"}
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Provided Subdomain Prefix
                                            </label>
                                            {(subscription.requested_subdomain || subscription.subdomain) && (
                                                <span className="text-[10px] text-slate-400">
                                                    Requested: <span className="font-mono text-indigo-600 dark:text-cyan-400">{subscription.requested_subdomain || subscription.subdomain}</span>
                                                </span>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            value={approvalForm.data.subdomain}
                                            onChange={(e) => approvalForm.setData('subdomain', e.target.value)}
                                            placeholder={subscription.requested_subdomain || subscription.subdomain || "e.g. clientapp"}
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Credentials & System Notes */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    System Access Credentials &amp; Onboarding Notes (Visible to Customer)
                                </label>
                                <textarea
                                    rows={10}
                                    value={approvalForm.data.admin_notes}
                                    onChange={(e) => approvalForm.setData('admin_notes', e.target.value)}
                                    placeholder="e.g. Admin URL: https://app.client.com/admin&#10;Username: admin@client.com&#10;Password: TemporarySecretPass123"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={approvalForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-1.5"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>{subscription.status === 'active' ? 'Save Updated Configurations' : 'Approve & Activate Subscription'}</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* DETAILED TRANSACTIONS & INVOICES LIST */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="flex items-center space-x-2">
                            <Receipt className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                            <div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                    All Transaction Records & Invoices ({invoicesList.length})
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Complete audit trail of initial setup, renewal payments, and package upgrades.
                                </p>
                            </div>
                        </div>

                        {invoicesList.length > 0 && (
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={invsTable.search}
                                    onChange={(e) => invsTable.setSearch(e.target.value)}
                                    placeholder="Search invoice, TrxID, mobile..."
                                    className="w-full pl-8 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-500"
                                />
                                {invsTable.search && (
                                    <button
                                        type="button"
                                        onClick={invsTable.clearSearch}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {invoicesList.length === 0 ? (
                        <div className="text-xs text-slate-400 py-6 text-center">No transaction records found for this order.</div>
                    ) : invsTable.paginatedData.length === 0 ? (
                        <div className="text-xs text-slate-400 py-4 text-center">No transactions matching &ldquo;{invsTable.search}&rdquo;</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                                            <th className="pb-3">Invoice #</th>
                                            <th className="pb-3">Type</th>
                                            <th className="pb-3">Cycle & Tier</th>
                                            <th className="pb-3">Amount</th>
                                            <th className="pb-3">Gateway</th>
                                            <th className="pb-3">Sender & TrxID</th>
                                            <th className="pb-3">Coverage Period</th>
                                            <th className="pb-3">Status</th>
                                            <th className="pb-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {invsTable.paginatedData.map((inv) => (
                                            <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                                <td className="py-3 font-mono font-bold text-indigo-600 dark:text-cyan-400">
                                                    {inv.invoice_number}
                                                    <div className="text-[10px] text-slate-400 font-normal">
                                                        {new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} {new Date(inv.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                                <td className="py-3 capitalize font-semibold text-slate-700 dark:text-slate-300">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${inv.type === 'renewal'
                                                        ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                                                        : inv.type === 'package_change'
                                                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                                        }`}>
                                                        {inv.type.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-slate-800 dark:text-slate-200">
                                                    <div className="font-bold capitalize">
                                                        {(inv.billing_cycle || subscription.billing_cycle || 'monthly').replace('_', ' ')}
                                                    </div>
                                                    <div className="text-[10px] text-indigo-600 dark:text-cyan-400 uppercase font-bold">
                                                        {subscription.package_tier || 'Standard'} Tier
                                                    </div>
                                                </td>
                                                <td className="py-3 font-black text-slate-900 dark:text-white">
                                                    {currencySymbol}{inv.amount.toLocaleString()}
                                                </td>
                                                <td className="py-3 uppercase font-mono font-bold text-slate-700 dark:text-slate-300">
                                                    {inv.payment_method}
                                                </td>
                                                <td className="py-3">
                                                    <div className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                                                        {inv.sender_number || 'N/A'}
                                                    </div>
                                                    <div className="flex items-center space-x-1 font-mono font-bold text-indigo-600 dark:text-cyan-400">
                                                        <span>{inv.transaction_id || 'N/A'}</span>
                                                        {inv.transaction_id && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopy(inv.transaction_id || '', `TrxID for ${inv.invoice_number}`)}
                                                                className="text-slate-400 hover:text-indigo-600 p-0.5"
                                                                title="Copy TrxID"
                                                            >
                                                                <Copy className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-slate-700 dark:text-slate-300">
                                                    <div className="font-medium text-[11px]">
                                                        {inv.period_start && inv.period_end
                                                            ? `${formatDateHuman(inv.period_start)} to ${formatDateHuman(inv.period_end)}`
                                                            : subscription.starts_at && subscription.expires_at
                                                                ? `${formatDateHuman(subscription.starts_at)} to ${formatDateHuman(subscription.expires_at)}`
                                                                : 'Awaiting Activation'}
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    {inv.status === 'rejected' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenRejectionModal({
                                                                title: `Rejected Invoice #${inv.invoice_number}`,
                                                                reason: inv.rejection_reason || subscription.rejection_reason || 'Invoice was rejected by administrator.',
                                                                invoiceNumber: inv.invoice_number,
                                                                orderNumber: subscription.order_number,
                                                                transactionId: inv.transaction_id,
                                                                paymentMethod: inv.payment_method,
                                                                senderNumber: inv.sender_number,
                                                                amount: `${currencySymbol}${inv.amount.toLocaleString('en-US')}`,
                                                                date: new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                                            })}
                                                            className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wide bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-500/30 transition-all flex items-center space-x-1 cursor-pointer shadow-2xs group"
                                                            title="Click to view why this payment was rejected"
                                                        >
                                                            <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500 group-hover:text-white" />
                                                            <span className='group-hover:text-white'>REJECTED</span>
                                                        </button>
                                                    ) : (
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${inv.status === 'paid'
                                                            ? 'bg-emerald-500/10 text-emerald-500'
                                                            : 'bg-amber-500/10 text-amber-500 animate-pulse'
                                                            }`}>
                                                            {inv.status.toUpperCase()}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 text-right">
                                                    {inv.status === 'pending' ? (
                                                        <div className="flex items-center justify-end space-x-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleApproveSpecificInvoice(inv)}
                                                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-xs flex items-center space-x-1 transition-all"
                                                                title="Approve & Extend Service"
                                                            >
                                                                <Check className="h-3 w-3" />
                                                                <span>Approve</span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => setRejectingInvoiceId(inv.id)}
                                                                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shadow-xs flex items-center space-x-1 transition-all"
                                                                title="Reject Transaction"
                                                            >
                                                                <X className="h-3 w-3" />
                                                                <span>Reject</span>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-400">
                                                            {inv.paid_at ? `Paid on ${new Date(inv.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Settled'}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination
                                currentPage={invsTable.currentPage}
                                totalPages={invsTable.totalPages}
                                total={invsTable.total}
                                from={invsTable.from}
                                to={invsTable.to}
                                onPageChange={invsTable.setCurrentPage}
                                itemLabel="invoices"
                            />
                        </>
                    )}
                </div>
            </div>

            {/* REJECT INVOICE MODAL */}
            {rejectingInvoiceId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-rose-600 flex items-center space-x-1.5">
                                <XCircle className="h-4 w-4" />
                                <span>Reject Transaction Invoice</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setRejectingInvoiceId(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={(e) => handleRejectSpecificInvoice(e, rejectingInvoiceId)} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Reason for Rejection *
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={invoiceRejectionReason}
                                    onChange={(e) => setInvoiceRejectionReason(e.target.value)}
                                    placeholder="e.g. Transaction ID invalid or amount does not match statement..."
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectingInvoiceId(null)}
                                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* REJECTION REASON POPUP MODAL */}
            {rejectionModalData?.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center space-x-3">
                                <div className="h-11 w-11 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold border border-rose-500/20 shrink-0">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                                        {rejectionModalData.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Recorded rejection reason & transaction audit details
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setRejectionModalData(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Payment Context Details */}
                        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-xs">
                            {rejectionModalData.amount && (
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Amount</span>
                                    <span className="font-black text-slate-800 dark:text-slate-200">{rejectionModalData.amount}</span>
                                </div>
                            )}
                            {rejectionModalData.date && (
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Submitted On</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{rejectionModalData.date}</span>
                                </div>
                            )}
                            {rejectionModalData.transactionId && (
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TrxID</span>
                                    <span className="font-mono font-bold text-indigo-600 dark:text-cyan-400">{rejectionModalData.transactionId}</span>
                                </div>
                            )}
                            {rejectionModalData.paymentMethod && (
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Method / Sender</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                                        {rejectionModalData.paymentMethod} {rejectionModalData.senderNumber ? `• ${rejectionModalData.senderNumber}` : ''}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Recorded Rejection Reason Box */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/[0.08] dark:bg-rose-950/40 border-2 border-rose-500/30 dark:border-rose-900/60 space-y-2">
                            <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
                                <Info className="h-4 w-4 shrink-0" />
                                <span className="text-xs font-black uppercase tracking-wider">Recorded Rejection Reason:</span>
                            </div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-rose-200/80 dark:border-rose-900/40 whitespace-pre-wrap leading-relaxed shadow-2xs">
                                {rejectionModalData.reason}
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setRejectionModalData(null)}
                                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DIRECT EXCHANGE RATE UPDATE MODAL */}
            {isRateModalOpen && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                    <Coins className="h-5 w-5 text-amber-500" />
                                    <span>Set Historical Exchange Rate</span>
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Conversion rate to BDT for Order #{subscription.order_number}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsRateModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleRateSubmit} className="space-y-4">
                            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                                    1 {subscription.currency} = Conversion Rate to BDT (৳) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="any"
                                        value={rateForm.data.exchange_rate_to_bdt}
                                        onChange={(e) => rateForm.setData('exchange_rate_to_bdt', e.target.value)}
                                        required
                                        placeholder={subscription.currency === 'EUR' ? '130.00' : '120.00'}
                                        className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                                    Enter the historical exchange rate that was active when this order was approved (e.g. 84.00 in 2022 or 120.00 today).
                                </p>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsRateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={rateForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
                                >
                                    {rateForm.processing ? 'Saving...' : 'Save Exchange Rate'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
