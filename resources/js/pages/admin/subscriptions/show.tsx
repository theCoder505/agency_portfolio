import React, { useState, FormEventHandler } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { SaasSubscription } from '@/types';
import {
    CreditCard,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    ArrowLeft,
    Copy,
    Check,
    Globe,
    Key,
    User,
    Mail,
    Phone,
    Shield,
    Receipt,
    ExternalLink,
    Calendar,
    Save
} from 'lucide-react';
import { showConfirmDialog, showToast } from '@/lib/swal';

interface SubscriptionShowProps {
    subscription: SaasSubscription;
    currencySymbol: string;
}

export default function SubscriptionShow({
    subscription,
    currencySymbol,
}: SubscriptionShowProps) {
    const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
    const [isRejecting, setIsRejecting] = useState(false);

    // Calculate default dates
    const todayStr = new Date().toISOString().split('T')[0];
    const getDefaultExpiryDate = () => {
        if (subscription.expires_at) {
            return subscription.expires_at.split('T')[0];
        }
        const d = new Date();
        if (subscription.billing_cycle === 'half_yearly') {
            d.setMonth(d.getMonth() + 6);
        } else if (subscription.billing_cycle === 'yearly') {
            d.setFullYear(d.getFullYear() + 1);
        } else {
            d.setMonth(d.getMonth() + 1);
        }
        return d.toISOString().split('T')[0];
    };

    const approvalForm = useForm({
        starts_at: subscription.starts_at ? subscription.starts_at.split('T')[0] : todayStr,
        expires_at: getDefaultExpiryDate(),
        domain: subscription.domain || '',
        subdomain: subscription.subdomain || '',
        admin_notes: subscription.admin_notes || '',
    });

    const rejectionForm = useForm({
        rejection_reason: '',
    });

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedLabel(label);
        showToast(`${label} copied to clipboard!`, 'success');
        setTimeout(() => setCopiedLabel(null), 2500);
    };

    const handleApprove: FormEventHandler = (e) => {
        e.preventDefault();
        showConfirmDialog(
            'Approve & Activate Subscription?',
            `This will mark Order #${subscription.order_number} as Active and provide credentials/domain access to customer ${subscription.user?.name}.`
        ).then((res) => {
            if (res.isConfirmed) {
                approvalForm.post(`/admin/subscriptions/${subscription.id}/approve`);
            }
        });
    };

    const handleReject: FormEventHandler = (e) => {
        e.preventDefault();
        rejectionForm.post(`/admin/subscriptions/${subscription.id}/reject`, {
            onSuccess: () => setIsRejecting(false),
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
            <div className="space-y-6 max-w-5xl">
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
                            <div className="flex items-center space-x-2">
                                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                    Order #{subscription.order_number}
                                </h1>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    subscription.status === 'active'
                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                        : subscription.status === 'pending'
                                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse'
                                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                }`}>
                                    {subscription.status_badge.label}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Submitted on {new Date(subscription.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top Two Summary Cards (Customer Info & Payment Details) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <User className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
                            <span>Customer Information</span>
                        </h2>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Full Name:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{subscription.user?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Email:</span>
                                <span className="font-mono text-slate-800 dark:text-slate-200">{subscription.user?.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Phone:</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{subscription.user?.phone || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Company:</span>
                                <span className="text-slate-800 dark:text-slate-200">{subscription.user?.company_name || 'Individual'}</span>
                            </div>
                        </div>

                        {subscription.payment_notes && (
                            <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                                <strong>Customer Notes:</strong> {subscription.payment_notes}
                            </div>
                        )}
                    </div>

                    {/* Payment Verification Data Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-indigo-500/40 p-6 shadow-xs space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400 flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <CreditCard className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
                            <span>bKash / Nagad Transaction Verification</span>
                        </h2>

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">SaaS Product:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{subscription.product?.name}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Billing Cycle:</span>
                                <span className="capitalize font-bold text-indigo-600 dark:text-cyan-400">
                                    {subscription.billing_cycle.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Expected Payable:</span>
                                <span className="text-base font-black text-slate-900 dark:text-white">
                                    {currencySymbol}{subscription.amount.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-slate-400">Payment Gateway:</span>
                                <span className="uppercase font-bold px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-600 font-mono">
                                    {subscription.payment_method}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Customer Sender Number:</span>
                                <div className="flex items-center space-x-1 font-mono font-bold text-slate-900 dark:text-white">
                                    <span>{subscription.sender_number || 'N/A'}</span>
                                    {subscription.sender_number && (
                                        <button
                                            onClick={() => handleCopy(subscription.sender_number || '', 'Sender Phone')}
                                            className="p-1 text-slate-400 hover:text-indigo-600"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
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
                            {/* Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                        Auto-calculated for {subscription.billing_cycle.replace('_', ' ')} duration.
                                    </span>
                                </div>
                            </div>

                            {/* Domain & Subdomain */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Assigned Custom Domain
                                    </label>
                                    <input
                                        type="text"
                                        value={approvalForm.data.domain}
                                        onChange={(e) => approvalForm.setData('domain', e.target.value)}
                                        placeholder="e.g. clientbrand.com"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Assigned Subdomain Prefix
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            type="text"
                                            value={approvalForm.data.subdomain}
                                            onChange={(e) => approvalForm.setData('subdomain', e.target.value)}
                                            placeholder="clientbrand"
                                            className="w-full px-3.5 py-2 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <span className="px-3 py-2 rounded-r-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500">
                                            .codeventure.app
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Credentials & Access Instructions */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Access Credentials & Setup Notes for Customer (Securely shown in customer portal)
                                </label>
                                <textarea
                                    rows={4}
                                    value={approvalForm.data.admin_notes}
                                    onChange={(e) => approvalForm.setData('admin_notes', e.target.value)}
                                    placeholder={`Login URL: https://app.codeventure.app\nAdmin Username: admin@clientbrand.com\nTemp Password: Pass#2026Secure!\n\nSetup Guide: Please configure your company logo in the general settings tab upon initial login.`}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={approvalForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center space-x-2 transition-all"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>{subscription.status === 'active' ? 'Update Active Details' : 'Validate & Activate Subscription'}</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* INVOICES LIST FOR THIS ORDER */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                    <div className="flex items-center space-x-2">
                        <Receipt className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                            Generated Invoices & Payments for this Order
                        </h2>
                    </div>

                    {(!subscription.invoices || subscription.invoices.length === 0) ? (
                        <div className="text-xs text-slate-400">No invoices recorded yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                                        <th className="pb-3">Invoice #</th>
                                        <th className="pb-3">Type</th>
                                        <th className="pb-3">Amount</th>
                                        <th className="pb-3">Gateway</th>
                                        <th className="pb-3">TrxID</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3">Period</th>
                                        <th className="pb-3 text-right">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {subscription.invoices.map((inv) => (
                                        <tr key={inv.id}>
                                            <td className="py-3 font-mono font-bold text-indigo-600 dark:text-cyan-400">{inv.invoice_number}</td>
                                            <td className="py-3 capitalize">{inv.type}</td>
                                            <td className="py-3 font-bold">{currencySymbol}{inv.amount.toLocaleString()}</td>
                                            <td className="py-3 uppercase font-mono">{inv.payment_method}</td>
                                            <td className="py-3 font-mono">{inv.transaction_id || 'N/A'}</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                    inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                                }`}>
                                                    {inv.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-3 text-slate-400">
                                                {inv.period_start && inv.period_end ? `${inv.period_start} to ${inv.period_end}` : 'N/A'}
                                            </td>
                                            <td className="py-3 text-right text-slate-400">{new Date(inv.created_at).toLocaleDateString()}</td>
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
