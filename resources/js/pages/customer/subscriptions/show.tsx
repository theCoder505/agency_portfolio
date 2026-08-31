import React, { useState, FormEventHandler, useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import { CustomerLayout } from '@/layouts/customer-layout';
import { SaasSubscription, SubscriptionInvoice } from '@/types';
import {
    Layers,
    Clock,
    CheckCircle2,
    Globe,
    Key,
    ExternalLink,
    Copy,
    Check,
    RefreshCw,
    Receipt,
    Eye,
    EyeOff,
    Search,
    X,
    Sparkles,
    Zap,
    AlertTriangle,
    Info
} from 'lucide-react';
import { showToast, showConfirmDialog } from '@/lib/swal';
import { useClientDataTable } from '@/hooks/use-client-data-table';
import { Pagination } from '@/components/ui/pagination';

interface SubscriptionShowProps {
    subscription: SaasSubscription;
    tierPlans?: {
        monthly: number;
        half_yearly: number;
        yearly: number;
    };
    availablePackages?: Record<string, {
        name: string;
        tagline: string;
        monthly_price: number;
        yearly_price: number;
        badge?: string;
        is_popular?: boolean;
        features: string[];
    }>;
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
    tierPlans,
    availablePackages = {},
    paymentSettings = {
        currency_symbol: '৳',
        currency_code: 'BDT',
        bkash_number: '01712-345678',
        bkash_instructions: 'Send money to our Merchant / Personal bKash number.',
        nagad_number: '01812-345678',
        nagad_instructions: 'Send money to our Personal Nagad number.',
    },
}: SubscriptionShowProps) {
    const currency = paymentSettings?.currency_symbol || '৳';
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [isChangePackageModalOpen, setIsChangePackageModalOpen] = useState(false);
    const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
    const [showCredentials, setShowCredentials] = useState(false);

    // User's active package tier and current billing cycle
    const currentTier = (subscription.package_tier || 'standard').toLowerCase();
    const currentCycle = subscription.billing_cycle || 'monthly';

    const invoicesList = subscription?.invoices || [];
    const invsTable = useClientDataTable<SubscriptionInvoice>({
        data: invoicesList,
        searchFields: (inv) => [inv.invoice_number, inv.type, inv.payment_method, inv.transaction_id, inv.status],
        initialPageSize: 5,
    });

    // Renewal form state
    const { data, setData, post, processing, errors, reset } = useForm({
        billing_cycle: currentCycle,
        payment_method: 'bkash',
        sender_number: subscription.sender_number || '',
        transaction_id: '',
        notes: '',
    });

    // Change package state
    const [selectedNewTier, setSelectedNewTier] = useState<string>(currentTier);
    const [selectedNewCycle, setSelectedNewCycle] = useState<string>(currentCycle);
    const [isChangingPackage, setIsChangingPackage] = useState(false);

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

    const latestInvoice = useMemo(() => {
        if (!subscription.invoices || subscription.invoices.length === 0) return null;
        return subscription.invoices[0];
    }, [subscription.invoices]);

    const isLatestPaymentRejected = useMemo(() => {
        if (latestInvoice) {
            return latestInvoice.status === 'rejected';
        }
        return subscription.status === 'rejected';
    }, [latestInvoice, subscription.status]);

    // Calculate price for the active package tier
    const getActiveTierPrice = (cycle: string) => {
        if (tierPlans && tierPlans[cycle as keyof typeof tierPlans] !== undefined) {
            return tierPlans[cycle as keyof typeof tierPlans];
        }
        const activePkg = availablePackages[currentTier];
        const monthly = activePkg?.monthly_price || subscription.amount || 0;
        if (cycle === 'half_yearly') return Math.round(monthly * 6);
        if (cycle === 'yearly') return activePkg?.yearly_price || Math.round(monthly * 10);
        return monthly;
    };

    const isSubscriptionActive = subscription.status === 'active' && subscription.expires_at && new Date(subscription.expires_at) > new Date();
    const currentExpiryDate = subscription.expires_at ? new Date(subscription.expires_at) : new Date();

    // Calculate tentative extended date (Current Ending + Next Ending Duration)
    const getPreviewExtendedDate = (cycle: string) => {
        const base = isSubscriptionActive ? new Date(subscription.expires_at!) : new Date();
        const copy = new Date(base.getTime());
        if (cycle === 'half_yearly') {
            copy.setMonth(copy.getMonth() + 6);
        } else if (cycle === 'yearly') {
            copy.setFullYear(copy.getFullYear() + 1);
        } else {
            copy.setMonth(copy.getMonth() + 1);
        }
        return copy.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getCycleDays = (cycle: string) => {
        if (cycle === 'yearly') return '365 Days (1 Year)';
        if (cycle === 'half_yearly') return '183 Days (6 Months)';
        return '30 Days (1 Month)';
    };

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedLabel(label);
        showToast(`${label} copied to clipboard!`, 'success');
        setTimeout(() => setCopiedLabel(null), 2500);
    };

    const handleRenewSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/customer/subscriptions/${subscription.order_number}/renew`, {
            onSuccess: () => {
                setIsRenewModalOpen(false);
                reset('transaction_id', 'notes');
            },
        });
    };

    const handleApplyPackageChange = async (tierKey: string) => {
        if (tierKey === currentTier) {
            showToast('You are already subscribed to this tier.', 'info');
            return;
        }

        const tierName = availablePackages[tierKey]?.name || tierKey.toUpperCase();
        const isUpgrade = (currentTier === 'basic' && (tierKey === 'standard' || tierKey === 'premium')) ||
            (currentTier === 'standard' && tierKey === 'premium');

        const confirmed = await showConfirmDialog(
            `${isUpgrade ? 'Instant Upgrade' : 'Instant Downgrade'} to ${tierName}?`,
            `Your subscription tier will be updated to ${tierName} instantly with zero downtime. Are you sure you want to proceed?`
        );

        if (confirmed) {
            setIsChangingPackage(true);
            router.post(`/customer/subscriptions/${subscription.order_number}/change-package`, {
                new_tier: tierKey,
                billing_cycle: selectedNewCycle,
            }, {
                onFinish: () => {
                    setIsChangingPackage(false);
                    setIsChangePackageModalOpen(false);
                },
            });
        }
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
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                                <Layers className="h-7 w-7" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                        {subscription.product?.name}
                                    </h1>
                                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-300 text-xs font-black uppercase border border-indigo-200/60 dark:border-indigo-800">
                                        {subscription.package_tier || 'Standard'} Tier
                                    </span>
                                    {subscription.status === 'rejected' ? (
                                        <button
                                            type="button"
                                            onClick={() => handleOpenRejectionModal({
                                                title: `Subscription Order #${subscription.order_number} Rejected`,
                                                reason: subscription.rejection_reason || 'Payment verification could not be completed or invalid transaction details provided.',
                                                orderNumber: subscription.order_number,
                                                transactionId: subscription.transaction_id,
                                                paymentMethod: subscription.payment_method,
                                                senderNumber: subscription.sender_number,
                                                amount: `${currency}${subscription.amount.toLocaleString('en-US')}`,
                                                date: new Date(subscription.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                            })}
                                            className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all flex items-center space-x-1 cursor-pointer shadow-2xs"
                                            title="Click to view rejection reason"
                                        >
                                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                            <span>{subscription.status_badge.label}</span>
                                            <span className="text-[10px] underline ml-0.5">(Why?)</span>
                                        </button>
                                    ) : (
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${subscription.status === 'active'
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                            }`}>
                                            {subscription.status_badge.label}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Order Number: <strong className="font-mono text-slate-800 dark:text-slate-200">{subscription.order_number}</strong> • Placed on {new Date(subscription.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        {/* Top Actions: Pay Renewal & Change Package */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <button
                                onClick={() => setIsChangePackageModalOpen(true)}
                                className="px-4 py-2.5 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-cyan-300 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
                            >
                                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
                                <span>Change Package (Up/Downgrade)</span>
                            </button>

                            <button
                                onClick={() => setIsRenewModalOpen(true)}
                                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all"
                            >
                                <RefreshCw className="h-4 w-4" />
                                <span>Pay Renewal Invoice</span>
                            </button>
                        </div>
                    </div>

                    {/* REJECTION ALERT BANNER (Shown ONLY if the latest payment/invoice of this subscription is rejected) */}
                    {isLatestPaymentRejected && (
                        latestInvoice ? (
                            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 dark:border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                                <div className="flex items-start sm:items-center space-x-3.5">
                                    <div className="h-10 w-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black shrink-0 shadow-sm">
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-black text-sm text-rose-900 dark:text-rose-200 flex items-center space-x-2">
                                            <span>
                                                {latestInvoice.type === 'initial'
                                                    ? `Payment for Order #${subscription.order_number} Rejected`
                                                    : `${latestInvoice.type === 'package_change' ? 'Package Change' : 'Renewal'} Payment #${latestInvoice.invoice_number} Rejected`}
                                            </span>
                                        </div>
                                        <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5 line-clamp-1">
                                            Reason: <span className="font-semibold">&ldquo;{latestInvoice.rejection_reason || subscription.rejection_reason || 'Transaction could not be verified.'}&rdquo;</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-start sm:self-auto">
                                    <button
                                        type="button"
                                        onClick={() => handleOpenRejectionModal({
                                            title: `${latestInvoice.type === 'initial' ? 'Order' : 'Invoice'} #${latestInvoice.invoice_number || subscription.order_number} Rejected`,
                                            reason: latestInvoice.rejection_reason || subscription.rejection_reason || 'Payment verification could not be completed or invalid transaction details provided.',
                                            invoiceNumber: latestInvoice.invoice_number,
                                            orderNumber: subscription.order_number,
                                            transactionId: latestInvoice.transaction_id || subscription.transaction_id,
                                            paymentMethod: latestInvoice.payment_method || subscription.payment_method,
                                            senderNumber: latestInvoice.sender_number || subscription.sender_number,
                                            amount: `${currency}${(latestInvoice.amount || subscription.amount).toLocaleString('en-US')}`,
                                            date: new Date(latestInvoice.created_at || subscription.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                        })}
                                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1"
                                    >
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        <span>View Reason</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsRenewModalOpen(true)}
                                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1"
                                    >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                        <span>Retry Payment</span>
                                    </button>
                                </div>
                            </div>
                        ) : subscription.status === 'rejected' ? (
                            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 dark:border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                                <div className="flex items-start sm:items-center space-x-3.5">
                                    <div className="h-10 w-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black shrink-0 shadow-sm">
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-black text-sm text-rose-900 dark:text-rose-200 flex items-center space-x-2">
                                            <span>Payment Verification Rejected</span>
                                        </div>
                                        <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5 line-clamp-1">
                                            Reason: <span className="font-semibold">&ldquo;{subscription.rejection_reason || 'Payment verification failed or invalid details provided.'}&rdquo;</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-start sm:self-auto">
                                    <button
                                        type="button"
                                        onClick={() => handleOpenRejectionModal({
                                            title: `Subscription Order #${subscription.order_number} Rejected`,
                                            reason: subscription.rejection_reason || 'Payment verification could not be completed or invalid transaction details provided.',
                                            orderNumber: subscription.order_number,
                                            transactionId: subscription.transaction_id,
                                            paymentMethod: subscription.payment_method,
                                            senderNumber: subscription.sender_number,
                                            amount: `${currency}${subscription.amount.toLocaleString('en-US')}`,
                                            date: new Date(subscription.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                        })}
                                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1"
                                    >
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        <span>View Reason</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsRenewModalOpen(true)}
                                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1"
                                    >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                        <span>Retry Payment</span>
                                    </button>
                                </div>
                            </div>
                        ) : null
                    )}

                    {/* DURATION & SERVICE TIMELINE */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800">
                            <div className="text-[11px] font-medium text-slate-400">Current Term & Plan</div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white capitalize mt-0.5">
                                {subscription.billing_cycle.replace('_', ' ')} ({currency}{subscription.amount.toLocaleString('en-US')})
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
                                {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Awaiting Activation'}
                            </div>
                        </div>
                    </div>

                    {/* DURATION EXTENSION & UPGRADE RULES NOTICE */}
                    <div className="mt-4 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 text-xs">
                        <div className="flex items-start space-x-2.5">
                            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                    Subscription Duration &amp; Tier Policy:
                                </span>
                                <ul className="text-slate-600 dark:text-slate-400 text-[11px] space-y-0.5 list-disc list-inside">
                                    <li>
                                        <strong>Continuous Duration Extension:</strong> Renewing the same package adds duration onto your existing deadline (e.g. <em>Current Expiry + 365 Days</em> for yearly). No remaining days are lost.
                                    </li>
                                    <li>
                                        <strong>Instant Tier Upgrades / Changes:</strong> Changing package tiers (Basic ↔ Standard ↔ Premium) applies <em>instantly</em> to your system without resetting your domain or credentials.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DOMAIN & DEPLOYMENT CONNECTIONS */}
                {(() => {
                    const productBaseDomain = subscription.product?.primary_domain || 'codeventure.app';
                    const reqDomain = subscription.requested_domain || subscription.domain;
                    const reqSubdomain = subscription.requested_subdomain || subscription.subdomain;
                    const liveDomain = subscription.domain;
                    const liveSubdomain = subscription.subdomain;
                    const surfaceUrl = liveDomain
                        ? `https://${liveDomain}`
                        : liveSubdomain
                            ? `https://${liveSubdomain}.${productBaseDomain}`
                            : null;

                    return (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6">
                            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <Globe className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                                <div>
                                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                        Domain Routing &amp; Live Application Endpoint
                                    </h2>
                                    <p className="text-xs text-slate-400">
                                        View your requested domain preferences and the live endpoints provided by CodeVenture.
                                    </p>
                                </div>
                            </div>

                            {/* REQUESTED DOMAIN & SUBDOMAIN VS PROVIDED */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
                                <div className="space-y-2 text-xs">
                                    <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                                        <span>Requested by You (At Checkout)</span>
                                    </span>
                                    <div className="space-y-1.5 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Custom Domain:</span>
                                            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                                                {reqDomain || <span className="text-slate-400 italic">None requested</span>}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Subdomain Prefix:</span>
                                            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                                                {reqSubdomain ? `${reqSubdomain}.${productBaseDomain}` : <span className="text-slate-400 italic">None requested</span>}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <span className="font-bold text-[11px] uppercase tracking-wider text-indigo-600 dark:text-cyan-400 flex items-center space-x-1.5">
                                        <span>Provided to You (Live Endpoints)</span>
                                    </span>
                                    <div className="space-y-1.5 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-100 dark:border-indigo-950/60">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Provided Domain:</span>
                                            <span className="font-mono font-bold text-indigo-600 dark:text-cyan-400">
                                                {liveDomain ? `https://${liveDomain}` : <span className="text-slate-400 italic">Not configured</span>}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Provided Subdomain:</span>
                                            <span className="font-mono font-bold text-indigo-600 dark:text-cyan-400">
                                                {liveSubdomain ? `https://${liveSubdomain}.${productBaseDomain}` : <span className="text-slate-400 italic">Not provisioned</span>}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Live Surface Website Access Card */}
                            <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/70 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <div className="flex items-center space-x-2 text-indigo-600 dark:text-cyan-400 font-bold text-sm">
                                            <Globe className="h-4 w-4" />
                                            <span>Provided Live Website Endpoint</span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                            Public storefront and client-facing web application address.
                                        </p>
                                    </div>
                                    {surfaceUrl && (
                                        <div className="flex items-center space-x-2">
                                            <a
                                                href={surfaceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
                                            >
                                                <span>Open Live Website</span>
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(surfaceUrl, 'Surface Website URL')}
                                                className="p-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                                                title="Copy Website URL"
                                            >
                                                {copiedLabel === 'Surface Website URL' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 break-all bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                                    {surfaceUrl || (
                                        <span className="text-amber-500 font-normal italic">
                                            Pending activation: Your live endpoint will be accessible once the admin approves your subscription.
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* ACCESS CREDENTIALS & SETUP NOTES */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center space-x-2">
                            <Key className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                            <div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                    Access Credentials &amp; Setup Guide
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Official admin panel login URL, system credentials, and setup instructions provided by the engineering team.
                                </p>
                            </div>
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
                                Credentials hidden for privacy. Click &ldquo;Reveal&rdquo; to view your full login links and secret keys.
                            </div>
                        )
                    ) : (
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-400 text-center space-y-1">
                            <p className="font-semibold text-slate-600 dark:text-slate-300">
                                Your isolated cloud environment is being prepared.
                            </p>
                            <p>
                                Complete login URLs, administrator credentials, and configuration guidelines will be posted here upon activation.
                            </p>
                        </div>
                    )}
                </div>

                {/* INVOICE PAYMENT HISTORY */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-2">
                            <Receipt className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                Invoice & Payment History ({invoicesList.length})
                            </h2>
                        </div>

                        {invoicesList.length > 0 && (
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={invsTable.search}
                                    onChange={(e) => invsTable.setSearch(e.target.value)}
                                    placeholder="Search invoices..."
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
                        <div className="text-xs text-slate-400 py-4 text-center">No invoices recorded yet.</div>
                    ) : invsTable.paginatedData.length === 0 ? (
                        <div className="text-xs text-slate-400 py-4 text-center">No invoices matching &ldquo;{invsTable.search}&rdquo;</div>
                    ) : (
                        <>
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
                                            <th className="pb-3">Coverage Period</th>
                                            <th className="pb-3 text-right">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {invsTable.paginatedData.map((inv) => (
                                            <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                                <td className="py-3 font-mono font-bold text-indigo-600 dark:text-cyan-400">{inv.invoice_number}</td>
                                                <td className="py-3 capitalize">
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold">
                                                        {inv.type.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-3 font-bold">{currency}{inv.amount.toLocaleString('en-US')}</td>
                                                <td className="py-3 uppercase font-mono">{inv.payment_method}</td>
                                                <td className="py-3 font-mono font-semibold">{inv.transaction_id || 'N/A'}</td>
                                                <td className="py-3">
                                                    {inv.status === 'rejected' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenRejectionModal({
                                                                title: `Rejected Payment - Invoice #${inv.invoice_number}`,
                                                                reason: inv.rejection_reason || subscription.rejection_reason || 'Payment verification could not be completed or invalid transaction details provided.',
                                                                invoiceNumber: inv.invoice_number,
                                                                orderNumber: subscription.order_number,
                                                                transactionId: inv.transaction_id,
                                                                paymentMethod: inv.payment_method,
                                                                senderNumber: inv.sender_number,
                                                                amount: `${currency}${inv.amount.toLocaleString('en-US')}`,
                                                                date: new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                                            })}
                                                            className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wide bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-500/30 transition-all flex items-center space-x-1 cursor-pointer shadow-2xs group"
                                                            title="Click to view why this payment was rejected"
                                                        >
                                                            <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500 group-hover:text-white" />
                                                            <span>REJECTED</span>
                                                            <span className="text-[9px] underline opacity-90 group-hover:text-white">(Why?)</span>
                                                        </button>
                                                    ) : (
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${inv.status === 'paid'
                                                            ? 'bg-emerald-500/10 text-emerald-500'
                                                            : 'bg-amber-500/10 text-amber-500'
                                                            }`}>
                                                            {inv.status.toUpperCase()}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 text-slate-500">
                                                    {inv.period_start && inv.period_end
                                                        ? `${new Date(inv.period_start).toLocaleDateString('en-US')} - ${new Date(inv.period_end).toLocaleDateString('en-US')}`
                                                        : 'Standard cycle'}
                                                </td>
                                                <td className="py-3 text-right text-slate-400">{new Date(inv.created_at).toLocaleDateString('en-US')}</td>
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

            {/* RENEWAL PAYMENT MODAL - STRICTLY FOR THE CURRENT PURCHASED PACKAGE */}
            {isRenewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <div className="flex items-center space-x-2">
                                    <RefreshCw className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                        Pay Renewal Invoice
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Renewing <strong className="text-indigo-600 dark:text-cyan-400">{subscription.product?.name}</strong> for the <strong className="capitalize">{currentTier} Tier</strong>
                                </p>
                            </div>
                            <button
                                onClick={() => setIsRenewModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleRenewSubmit} className="space-y-5">
                            {/* Billing Cycle Selection according to Current Package Tier */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Choose Renewal Duration ({currentTier.toUpperCase()} Plan):
                                    </label>
                                    <span className="text-[11px] text-slate-400">
                                        Pre-selected: <strong className="capitalize text-indigo-600 dark:text-cyan-400">{data.billing_cycle.replace('_', ' ')}</strong>
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2.5">
                                    {[
                                        { id: 'monthly', label: 'Monthly', days: '30 Days' },
                                        { id: 'half_yearly', label: 'Half-Yearly', days: '183 Days (6 Mo)' },
                                        { id: 'yearly', label: 'Yearly', days: '365 Days (1 Yr)' },
                                    ].map((cycleItem) => {
                                        const price = getActiveTierPrice(cycleItem.id);
                                        const isSelected = data.billing_cycle === cycleItem.id;

                                        return (
                                            <button
                                                type="button"
                                                key={cycleItem.id}
                                                onClick={() => setData('billing_cycle', cycleItem.id as any)}
                                                className={`p-3 rounded-2xl border text-left transition-all relative ${isSelected
                                                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20 shadow-xs'
                                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50'
                                                    }`}
                                            >
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2">
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 dark:text-cyan-400" />
                                                    </div>
                                                )}
                                                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 capitalize">{cycleItem.label}</div>
                                                <div className="font-black text-sm text-slate-900 dark:text-white mt-1">
                                                    {currency}{price.toLocaleString('en-US')}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">{cycleItem.days}</div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Dynamic Deadline Preview */}
                                <div className="mt-3 p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2 text-indigo-700 dark:text-cyan-300 font-bold">
                                            <Clock className="h-4 w-4" />
                                            <span>Cumulative Extended Service Deadline:</span>
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">
                                            {getPreviewExtendedDate(data.billing_cycle)}
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <span>
                                            {isSubscriptionActive ? (
                                                <>
                                                    Current Expiry (<strong className="text-slate-800 dark:text-slate-200 font-mono">{currentExpiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>) + <strong className="text-indigo-600 dark:text-cyan-400">{getCycleDays(data.billing_cycle)}</strong>
                                                </>
                                            ) : (
                                                <>
                                                    Reactivates for <strong className="text-indigo-600 dark:text-cyan-400">{getCycleDays(data.billing_cycle)}</strong> upon approval
                                                </>
                                            )}
                                        </span>
                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                            ✓ Zero Days Lost
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method Selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Select Payment Gateway:
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setData('payment_method', 'bkash')}
                                        className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${data.payment_method === 'bkash'
                                            ? 'border-pink-500 bg-pink-500/10 text-pink-600 ring-2 ring-pink-500/20'
                                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                            }`}
                                    >
                                        bKash Send Money
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('payment_method', 'nagad')}
                                        className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${data.payment_method === 'nagad'
                                            ? 'border-orange-500 bg-orange-500/10 text-orange-600 ring-2 ring-orange-500/20'
                                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                            }`}
                                    >
                                        Nagad Send Money
                                    </button>
                                </div>
                            </div>

                            {/* Gateway Instructions & Recipient Number */}
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-slate-400">Send money ({currency}{getActiveTierPrice(data.billing_cycle).toLocaleString('en-US')}) to:</span>
                                    <div className="font-mono font-bold text-indigo-600 dark:text-cyan-400 text-sm mt-0.5">
                                        {data.payment_method === 'bkash' ? paymentSettings.bkash_number || '01712-345678' : paymentSettings.nagad_number || '01812-345678'}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(
                                        data.payment_method === 'bkash' ? paymentSettings.bkash_number : paymentSettings.nagad_number,
                                        'Payment Recipient Number'
                                    )}
                                    className="p-2 text-slate-500 hover:text-indigo-600 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
                                    title="Copy Number"
                                >
                                    <Copy className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Form Inputs: Sender Mobile & TrxID */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Sender Mobile / Account Number *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={data.sender_number}
                                        onChange={(e) => setData('sender_number', e.target.value)}
                                        placeholder="017XXXXXXXX"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {errors.sender_number && <p className="text-red-500 text-[10px] mt-1">{errors.sender_number}</p>}
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
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-xs uppercase focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {errors.transaction_id && <p className="text-red-500 text-[10px] mt-1">{errors.transaction_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Payment Notes (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="e.g. Renewal for next 6 months"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2"
                            >
                                {processing ? (
                                    <span>Submitting Payment...</span>
                                ) : (
                                    <span>Pay {currency}{getActiveTierPrice(data.billing_cycle).toLocaleString('en-US')} Renewal Invoice</span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* CHANGE PACKAGE (UPGRADE / DOWNGRADE) MODAL */}
            {isChangePackageModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-6xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <div className="flex items-center space-x-2">
                                    <Sparkles className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                        Upgrade or Downgrade Your Package
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Switch your tier instantly. Your active application credentials and domain setup remain intact.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsChangePackageModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Rules & Policy Guidance Banner */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs">
                            <div className="flex items-start space-x-2.5">
                                <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="text-slate-900 dark:text-white font-bold block">1. Tier Changes Apply Instantly</strong>
                                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                                        Upgrading or downgrading between Basic, Standard, and Premium tiers takes effect immediately with zero downtime.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-2.5">
                                <Clock className="h-4 w-4 text-indigo-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="text-slate-900 dark:text-white font-bold block">2. Same Package Duration Extension</strong>
                                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                                        When you renew the same package, duration is added directly to your current ending date (Current Ending + 365 Days, etc.).
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Package Selection Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['basic', 'standard', 'premium'].map((tierKey) => {
                                const pkg = availablePackages[tierKey] || {
                                    name: `${tierKey.toUpperCase()} Tier`,
                                    tagline: 'Standard package tier',
                                    monthly_price: subscription.amount,
                                    yearly_price: subscription.amount * 10,
                                    features: ['Core module access', 'Subdomain SSL', 'Standard backups'],
                                };

                                const isCurrent = tierKey === currentTier;
                                const isSelected = selectedNewTier === tierKey;
                                const monthlyPrice = pkg.monthly_price || 0;
                                const yearlyPrice = pkg.yearly_price || (monthlyPrice * 10);
                                const halfYearlyPrice = Math.round(monthlyPrice * 6);

                                return (
                                    <div
                                        key={tierKey}
                                        className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-5 ${isCurrent
                                            ? 'border-emerald-500/80 bg-emerald-500/5 ring-2 ring-emerald-500/20'
                                            : isSelected
                                                ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-md'
                                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="font-black text-sm text-slate-900 dark:text-white capitalize">
                                                    {pkg.name || `${tierKey} Tier`}
                                                </span>
                                                {isCurrent ? (
                                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase">
                                                        Current Plan
                                                    </span>
                                                ) : pkg.is_popular ? (
                                                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase">
                                                        Popular
                                                    </span>
                                                ) : null}
                                            </div>

                                            <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[32px]">
                                                {pkg.tagline}
                                            </p>

                                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                                <div className="text-2xl font-black text-slate-900 dark:text-white">
                                                    {currency}{monthlyPrice.toLocaleString('en-US')}
                                                    <span className="text-xs text-slate-400 font-normal"> / month</span>
                                                </div>
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                                    Half-Yearly: {currency}{halfYearlyPrice.toLocaleString('en-US')} • Yearly: {currency}{yearlyPrice.toLocaleString('en-US')}
                                                </div>
                                            </div>

                                            {/* Features checklist */}
                                            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Included:</div>
                                                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                                                    {(pkg.features || []).map((feat, idx) => (
                                                        <li key={idx} className="flex items-start space-x-1.5">
                                                            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                                            <span>{feat}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                            {isCurrent ? (
                                                <button
                                                    disabled
                                                    className="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 text-xs font-bold cursor-not-allowed"
                                                >
                                                    Active Current Plan
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={isChangingPackage}
                                                    onClick={() => handleApplyPackageChange(tierKey)}
                                                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-1.5 transition-all"
                                                >
                                                    <Zap className="h-3.5 w-3.5" />
                                                    <span>Switch to {pkg.name || tierKey}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
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
                                        Payment verification status & admin feedback
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

                        {/* Admin Rejection Reason Box */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/[0.08] dark:bg-rose-950/40 border-2 border-rose-500/30 dark:border-rose-900/60 space-y-2">
                            <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
                                <Info className="h-4 w-4 shrink-0" />
                                <span className="text-xs font-black uppercase tracking-wider">Admin Rejection Reason:</span>
                            </div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-rose-200/80 dark:border-rose-900/40 whitespace-pre-wrap leading-relaxed shadow-2xs">
                                {rejectionModalData.reason}
                            </div>
                        </div>

                        {/* Next steps advice */}
                        <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-cyan-200 space-y-1">
                            <div className="font-bold flex items-center space-x-1.5 text-indigo-700 dark:text-cyan-300">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                <span>How to resolve this:</span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal pl-5">
                                Please verify your transaction SMS from bKash/Nagad. Ensure the Transaction ID (TrxID) and sender number match the exact transaction, then submit a fresh payment.
                            </p>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setRejectionModalData(null)}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setRejectionModalData(null);
                                    setIsRenewModalOpen(true);
                                }}
                                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 transition-all"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span>Submit New Payment</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}
