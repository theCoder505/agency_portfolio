import React, { useState, FormEventHandler } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { CustomerLayout } from '@/layouts/customer-layout';
import { SaasSubscription, SubscriptionInvoice } from '@/types';
import {
    Layers,
    Clock,
    CheckCircle2,
    AlertCircle,
    Globe,
    Key,
    ExternalLink,
    Copy,
    Check,
    RefreshCw,
    Receipt,
    Shield,
    Smartphone,
    ArrowRight,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';
import { showToast } from '@/lib/swal';

interface SubscriptionShowProps {
    subscription: SaasSubscription;
    paymentSettings: {
        currency_symbol: string;
        currency_code: string;
        bkash_number: string;
        bkash_instructions: string;
        nagad_number: string;
        nagad_instructions: string;
    };
}

export default function SubscriptionShow({
    subscription,
    paymentSettings = {
        currency_symbol: '৳',
        currency_code: 'BDT',
        bkash_number: '01712-345678',
        bkash_instructions: '',
        nagad_number: '01812-345678',
        nagad_instructions: '',
    },
}: SubscriptionShowProps) {
    const currency = paymentSettings?.currency_symbol || '৳';
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
    const [showCredentials, setShowCredentials] = useState(true);

    const { data, setData, post, processing, errors, reset } = useForm({
        billing_cycle: subscription.billing_cycle,
        payment_method: 'bkash',
        sender_number: subscription.sender_number || '',
        transaction_id: '',
        notes: '',
    });

    const getCyclePrice = (cycle: string) => {
        if (!subscription.product) return subscription.amount;
        if (cycle === 'half_yearly') return subscription.product.half_yearly_price;
        if (cycle === 'yearly') return subscription.product.yearly_price;
        return subscription.product.monthly_price;
    };

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedLabel(label);
        showToast(`${label} copied to clipboard!`, 'success');
        setTimeout(() => setCopiedLabel(null), 2500);
    };

    const handleRenewSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/customer/subscriptions/${subscription.id}/renew`, {
            onSuccess: () => {
                setIsRenewModalOpen(false);
                reset('transaction_id');
            },
        });
    };

    const daysLeft = subscription.days_remaining;
    const isExpired = subscription.is_expired_now || subscription.status === 'expired';

    return (
        <CustomerLayout
            title={`Package Details - ${subscription.product?.name || 'Subscription'}`}
            breadcrumbs={[
                { title: 'My Subscriptions', href: '/customer/subscriptions' },
                { title: `Order #${subscription.order_number}` },
            ]}
        >
            <div className="space-y-8 max-w-5xl mx-auto">
                {/* SUBSCRIPTION HEADER BANNER */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center space-x-4">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-md">
                                <Layers className="h-7 w-7" />
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                        {subscription.product?.name}
                                    </h1>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                        subscription.status === 'active'
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                            : subscription.status === 'pending'
                                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                    }`}>
                                        {subscription.status_badge.label}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Order Number: <strong className="font-mono text-slate-800 dark:text-slate-200">{subscription.order_number}</strong> • Placed on {new Date(subscription.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Renewal Action */}
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setIsRenewModalOpen(true)}
                                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all"
                            >
                                <RefreshCw className="h-4 w-4" />
                                <span>Pay Renewal Invoice</span>
                            </button>
                        </div>
                    </div>

                    {/* DURATION & SERVICE TIMELINE */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800">
                            <div className="text-[11px] font-medium text-slate-400">Current Term</div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white capitalize mt-0.5">
                                {subscription.billing_cycle.replace('_', ' ')} ({currency}{subscription.amount.toLocaleString()})
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800">
                            <div className="text-[11px] font-medium text-slate-400">Time Remaining</div>
                            <div className={`text-sm font-black mt-0.5 ${subscription.status === 'active' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {subscription.status === 'active' ? `${daysLeft} Days Remaining` : 'N/A'}
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800">
                            <div className="text-[11px] font-medium text-slate-400">Service Deadline</div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                                {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : 'Awaiting Activation'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* DOMAIN & DEPLOYMENT CONNECTIONS */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
                    <div className="flex items-center space-x-2">
                        <Globe className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Deployment Domains & Access Endpoints
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800 space-y-2">
                            <div className="text-xs font-semibold text-slate-500">Custom Domain:</div>
                            {subscription.domain ? (
                                <a
                                    href={`https://${subscription.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-2 font-mono text-sm font-bold text-indigo-600 dark:text-cyan-400 hover:underline"
                                >
                                    <span>https://{subscription.domain}</span>
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            ) : (
                                <span className="text-xs text-slate-400 italic">No custom domain assigned yet.</span>
                            )}
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800 space-y-2">
                            <div className="text-xs font-semibold text-slate-500">Managed Subdomain:</div>
                            {subscription.subdomain ? (
                                <a
                                    href={`https://${subscription.subdomain}.codeventure.app`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-2 font-mono text-sm font-bold text-indigo-600 dark:text-cyan-400 hover:underline"
                                >
                                    <span>https://{subscription.subdomain}.codeventure.app</span>
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            ) : (
                                <span className="text-xs text-slate-400 italic">Subdomain will be generated upon activation.</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ACCESS CREDENTIALS & ADMIN SETUP NOTES */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Key className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                Access Credentials & Setup Notes
                            </h2>
                        </div>

                        {subscription.admin_notes && (
                            <button
                                onClick={() => setShowCredentials(!showCredentials)}
                                className="text-xs font-bold text-indigo-600 dark:text-cyan-400 flex items-center space-x-1"
                            >
                                {showCredentials ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                <span>{showCredentials ? 'Hide' : 'Reveal'}</span>
                            </button>
                        )}
                    </div>

                    {subscription.admin_notes ? (
                        showCredentials ? (
                            <div className="relative p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                                {subscription.admin_notes}
                                <button
                                    onClick={() => handleCopy(subscription.admin_notes || '', 'Credentials')}
                                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 shadow-xs"
                                    title="Copy Credentials"
                                >
                                    {copiedLabel === 'Credentials' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                        ) : (
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-400 italic text-center">
                                Credentials hidden. Click reveal to display login links and secret keys.
                            </div>
                        )
                    ) : (
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-400 text-center">
                            Our team is currently preparing your isolated cloud environment. Credentials will be securely posted here upon verification.
                        </div>
                    )}
                </div>

                {/* INVOICE PAYMENT HISTORY */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
                    <div className="flex items-center space-x-2">
                        <Receipt className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Invoice & Payment History for this Order
                        </h2>
                    </div>

                    {(!subscription.invoices || subscription.invoices.length === 0) ? (
                        <div className="text-xs text-slate-400 py-4 text-center">No invoices recorded yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                                        <th className="pb-3">Invoice Number</th>
                                        <th className="pb-3">Type</th>
                                        <th className="pb-3">Amount</th>
                                        <th className="pb-3">Method</th>
                                        <th className="pb-3">Transaction ID</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {subscription.invoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="py-3 font-mono font-bold text-indigo-600 dark:text-cyan-400">{inv.invoice_number}</td>
                                            <td className="py-3 capitalize">{inv.type}</td>
                                            <td className="py-3 font-bold">{currency}{inv.amount.toLocaleString()}</td>
                                            <td className="py-3 uppercase font-mono">{inv.payment_method}</td>
                                            <td className="py-3 font-mono">{inv.transaction_id || 'N/A'}</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                    inv.status === 'paid'
                                                        ? 'bg-emerald-500/10 text-emerald-500'
                                                        : inv.status === 'pending'
                                                        ? 'bg-amber-500/10 text-amber-500'
                                                        : 'bg-rose-500/10 text-rose-500'
                                                }`}>
                                                    {inv.status.toUpperCase()}
                                                </span>
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

            {/* RENEWAL PAYMENT MODAL */}
            {isRenewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center space-x-2">
                                <RefreshCw className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                    Pay Renewal Invoice
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsRenewModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleRenewSubmit} className="space-y-5">
                            {/* Billing Cycle Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Choose Renewal Duration:
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['monthly', 'half_yearly', 'yearly'].map((c) => (
                                        <button
                                            type="button"
                                            key={c}
                                            onClick={() => setData('billing_cycle', c as any)}
                                            className={`p-2.5 rounded-xl border text-center text-xs transition-all ${
                                                data.billing_cycle === c
                                                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/50 font-bold text-indigo-600 dark:text-cyan-400 ring-2 ring-indigo-500/20'
                                                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                            }`}
                                        >
                                            <div className="capitalize">{c.replace('_', ' ')}</div>
                                            <div className="font-bold mt-0.5">{currency}{getCyclePrice(c).toLocaleString()}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Method Selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Payment Method:
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setData('payment_method', 'bkash')}
                                        className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                                            data.payment_method === 'bkash'
                                                ? 'border-pink-500 bg-pink-500/10 text-pink-600'
                                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        bKash Send Money
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('payment_method', 'nagad')}
                                        className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                                            data.payment_method === 'nagad'
                                                ? 'border-orange-500 bg-orange-500/10 text-orange-600'
                                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        Nagad Send Money
                                    </button>
                                </div>
                            </div>

                            {/* Number Box */}
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-slate-400">Send to {data.payment_method === 'bkash' ? 'bKash' : 'Nagad'}:</span>
                                    <div className="font-mono font-bold text-indigo-600 dark:text-cyan-400">
                                        {data.payment_method === 'bkash' ? paymentSettings.bkash_number || '01712-345678' : paymentSettings.nagad_number || '01812-345678'}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(
                                        data.payment_method === 'bkash' ? paymentSettings.bkash_number : paymentSettings.nagad_number,
                                        'Payment Number'
                                    )}
                                    className="p-1 text-slate-500 hover:text-indigo-600"
                                >
                                    <Copy className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Form Inputs */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Sender Mobile Number *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={data.sender_number}
                                        onChange={(e) => setData('sender_number', e.target.value)}
                                        placeholder="017XXXXXXXX"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Transaction ID (TrxID) *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.transaction_id}
                                        onChange={(e) => setData('transaction_id', e.target.value.toUpperCase())}
                                        placeholder="e.g. 9B1234XYZ"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-xs uppercase"
                                    />
                                    {errors.transaction_id && <p className="text-red-500 text-[10px] mt-1">{errors.transaction_id}</p>}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                            >
                                {processing ? <span>Submitting...</span> : <span>Submit Renewal Payment</span>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}
