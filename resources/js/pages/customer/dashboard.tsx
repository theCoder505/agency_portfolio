import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { CustomerLayout } from '@/layouts/customer-layout';
import { SaasSubscription, SubscriptionInvoice, SharedData, CustomOrder } from '@/types';
import {
    Layers,
    Clock,
    CheckCircle2,
    AlertCircle,
    Receipt,
    Globe,
    Key,
    ExternalLink,
    ArrowRight,
    RefreshCw,
    Sparkles,
    Calendar,
    ChevronRight,
    Shield,
    Copy,
    Check,
    Eye,
    EyeOff,
    FolderGit2,
    PlusCircle,
    Github,
    HardDrive
} from 'lucide-react';
import { showToast } from '@/lib/swal';
import { formatCurrency } from '@/lib/formatters';

interface DashboardProps {
    kpis: {
        total_active: number;
        total_pending: number;
        total_expired: number;
        total_invoices: number;
        total_custom_orders?: number;
        active_custom_orders?: number;
    };
    activeSubscriptions: SaasSubscription[];
    pendingSubscriptions: SaasSubscription[];
    expiredSubscriptions: SaasSubscription[];
    allSubscriptions: SaasSubscription[];
    recentInvoices: SubscriptionInvoice[];
    customOrders?: CustomOrder[];
    paymentSettings: {
        currency_symbol: string;
        currency_code: string;
        bkash_number: string;
        bkash_instructions: string;
        nagad_number: string;
        nagad_instructions: string;
    };
}

export default function CustomerDashboard({
    kpis,
    activeSubscriptions,
    pendingSubscriptions,
    expiredSubscriptions,
    allSubscriptions,
    recentInvoices,
    customOrders = [],
    paymentSettings,
}: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;
    const currency = paymentSettings.currency_symbol || '৳';

    const [visibleCredentials, setVisibleCredentials] = useState<Record<number, boolean>>({});

    const toggleCredentials = (subId: number) => {
        setVisibleCredentials(prev => ({ ...prev, [subId]: !prev[subId] }));
    };

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        showToast(`${label} copied to clipboard!`, 'success');
    };

    return (
        <CustomerLayout
            title="Customer Workspace"
            breadcrumbs={[{ title: 'Dashboard' }]}
        >
            <div className="space-y-8">
                {/* WELCOME BANNER */}
                <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 text-white border border-indigo-500/20 shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Customer Cloud Workspace</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                                Welcome back, {user?.name}!
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                                Monitor your active SaaS software deployments, track service deadlines, access credentials, and manage invoice renewals.
                            </p>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Link
                                href="/saas-products"
                                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-black text-xs shadow-lg hover:opacity-95 transition-all flex items-center space-x-2"
                            >
                                <Layers className="h-4 w-4" />
                                <span>Deploy New Service</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* KPI METRIC CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Packages</span>
                            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{kpis.total_active}</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Under Review</span>
                            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{kpis.total_pending}</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Expired / Due</span>
                            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{kpis.total_expired}</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                            <Receipt className="h-6 w-6" />
                        </div>
                        <div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Invoices</span>
                            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{kpis.total_invoices}</div>
                        </div>
                    </div>
                </div>

                {/* PENDING VERIFICATION BANNER (If any) */}
                {pendingSubscriptions.length > 0 && (
                    <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2">
                        <div className="flex items-center space-x-2 font-bold text-sm">
                            <Clock className="h-4 w-4 text-amber-500" />
                            <span>{pendingSubscriptions.length} Order(s) Awaiting Admin Verification</span>
                        </div>
                        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                            We have received your bKash/Nagad payment submission. Our admin is verifying the Transaction ID. Your service will be activated shortly with credentials and domain setup.
                        </p>
                    </div>
                )}

                {/* CUSTOM PROJECTS & MILESTONES SECTION */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                                <FolderGit2 className="h-5 w-5 text-indigo-500" />
                                <span>Custom Projects & Milestone Workspaces</span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Track your custom software orders, milestone payment releases, and deliverables.
                            </p>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Link
                                href="/custom-orders/request"
                                className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-600 dark:text-cyan-400 font-bold text-xs hover:bg-indigo-100"
                            >
                                <PlusCircle className="h-3.5 w-3.5" />
                                <span>Request New Project</span>
                            </Link>
                            <Link
                                href="/customer/custom-orders"
                                className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline flex items-center space-x-1"
                            >
                                <span>View All ({kpis.total_custom_orders || 0})</span>
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {customOrders.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 text-center space-y-3">
                            <FolderGit2 className="h-10 w-10 text-slate-400 mx-auto" />
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No custom project orders placed yet</h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                Need custom software, a bespoke mobile app, or tailored enterprise system? Request a quote with milestone payment terms.
                            </p>
                            <Link
                                href="/custom-orders/request"
                                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-bold mt-2 shadow-sm"
                            >
                                <PlusCircle className="h-3.5 w-3.5" />
                                <span>Request Custom Project</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {customOrders.map((order) => {
                                const badge = order.status_badge || { label: order.status, color: 'slate' };
                                const milestonesCount = order.milestones?.length || 0;
                                const collectedAmount = order.total_collected_amount || 0;
                                const agreedPrice = order.agreed_price || order.estimated_budget || 0;

                                return (
                                    <div
                                        key={order.id}
                                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-cyan-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                                                    #{order.order_number}
                                                </span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                                    badge.color === 'emerald'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                        : badge.color === 'amber'
                                                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                        : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                                                }`}>
                                                    {badge.label}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                                                {order.title}
                                            </h3>

                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                {order.requirements}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Settled Amount</span>
                                                <span className="text-sm font-black text-slate-900 dark:text-white">
                                                    {order.currency} {agreedPrice.toLocaleString()}
                                                </span>
                                            </div>

                                            <Link
                                                href={`/customer/custom-orders/${order.id}`}
                                                className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-indigo-600 dark:hover:bg-indigo-600 transition-all font-bold text-xs flex items-center space-x-1"
                                            >
                                                <span>Open Workspace</span>
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ACTIVE SUBSCRIPTIONS GRID */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white">
                                Active SaaS Software & Subscriptions
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Live products currently deployed for your organization with duration counters.
                            </p>
                        </div>

                        <Link
                            href="/customer/subscriptions"
                            className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline flex items-center space-x-1"
                        >
                            <span>View All</span>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {activeSubscriptions.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 text-center space-y-3">
                            <Layers className="h-10 w-10 text-slate-400 mx-auto" />
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No active subscriptions currently</h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                Explore our SaaS products and subscribe to enjoy automated cloud software with 99.9% uptime.
                            </p>
                            <Link
                                href="/saas-products"
                                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold mt-2 shadow-sm"
                            >
                                <span>Browse SaaS Products</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeSubscriptions.map((sub) => {
                                const daysLeft = sub.days_remaining;
                                const isExpiringSoon = daysLeft <= 7;

                                return (
                                    <div
                                        key={sub.id}
                                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-5 flex flex-col justify-between"
                                    >
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center space-x-3.5">
                                                <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                                                    <Layers className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                                                        {sub.product?.name || 'SaaS Product'}
                                                    </h3>
                                                    <span className="text-[11px] font-medium text-slate-500">
                                                        Order #{sub.order_number} • {sub.billing_cycle.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>

                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                Active
                                            </span>
                                        </div>

                                        {/* Time Remaining Countdown / Progress Bar */}
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800 space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                                                    <Clock className="h-3.5 w-3.5 text-indigo-500" />
                                                    <span>Time Remaining:</span>
                                                </span>
                                                <span className={`font-black text-sm ${isExpiringSoon ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                    {daysLeft} Days Left
                                                </span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        isExpiringSoon ? 'bg-amber-500' : 'bg-emerald-500'
                                                    }`}
                                                    style={{ width: `${Math.min(100, Math.max(10, (daysLeft / 30) * 100))}%` }}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                                                <span>Started: {sub.starts_at ? new Date(sub.starts_at).toLocaleDateString() : 'N/A'}</span>
                                                <span>Expires: {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </div>

                                        {/* Deployment Domain / Subdomain Details */}
                                        {(sub.domain || sub.subdomain) && (
                                            <div className="space-y-2">
                                                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                                    Connected Web Address
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {sub.domain && (
                                                        <a
                                                            href={`https://${sub.domain}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-cyan-400 border border-indigo-200/50 dark:border-indigo-800/40 text-xs font-bold hover:underline"
                                                        >
                                                            <Globe className="h-3.5 w-3.5" />
                                                            <span>https://{sub.domain}</span>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                    {sub.subdomain && (
                                                        <a
                                                            href={`https://${sub.subdomain}.codeventure.app`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold hover:underline"
                                                        >
                                                            <span>{sub.subdomain}.codeventure.app</span>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Admin Access Credentials Box */}
                                        {sub.admin_notes && (
                                            <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900 dark:text-cyan-300">
                                                        <Key className="h-3.5 w-3.5" />
                                                        <span>Access & Setup Credentials</span>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleCredentials(sub.id)}
                                                        className="text-[11px] font-bold text-indigo-600 dark:text-cyan-400 flex items-center space-x-1 hover:underline"
                                                    >
                                                        {visibleCredentials[sub.id] ? (
                                                            <>
                                                                <EyeOff className="h-3 w-3" />
                                                                <span>Hide</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye className="h-3 w-3" />
                                                                <span>Reveal</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>

                                                {visibleCredentials[sub.id] && (
                                                    <div className="relative mt-2 p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                                                        {sub.admin_notes}
                                                        <button
                                                            onClick={() => handleCopy(sub.admin_notes || '', 'Credentials')}
                                                            className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white"
                                                            title="Copy"
                                                        >
                                                            <Copy className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Bottom Actions */}
                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                            <Link
                                                href={`/customer/subscriptions/${sub.id}`}
                                                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 flex items-center space-x-1"
                                            >
                                                <span>View Full Details</span>
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            </Link>

                                            {isExpiringSoon && (
                                                <Link
                                                    href={`/customer/subscriptions/${sub.id}`}
                                                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5"
                                                >
                                                    <RefreshCw className="h-3 w-3" />
                                                    <span>Pay Renewal</span>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* EXPIRED / RENEWAL DUE SECTION */}
                {expiredSubscriptions.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-rose-500 font-bold text-base">
                            <AlertCircle className="h-5 w-5" />
                            <h2>Expired Subscriptions / Invoices Due</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {expiredSubscriptions.map((expSub) => (
                                <div
                                    key={expSub.id}
                                    className="bg-white dark:bg-slate-900 p-5 rounded-3xl border-2 border-rose-500/30 flex items-center justify-between gap-4"
                                >
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                            {expSub.product?.name}
                                        </h3>
                                        <p className="text-xs text-rose-500 font-semibold mt-0.5">
                                            Service expired on {expSub.expires_at ? new Date(expSub.expires_at).toLocaleDateString() : 'recent deadline'}.
                                        </p>
                                    </div>

                                    <Link
                                        href={`/customer/subscriptions/${expSub.id}`}
                                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shrink-0 flex items-center space-x-1"
                                    >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                        <span>Pay & Reactivate</span>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* RECENT INVOICES SECTION */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Receipt className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                Recent Payment Invoices
                            </h2>
                        </div>

                        <Link
                            href="/customer/invoices"
                            className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline"
                        >
                            View All Invoices
                        </Link>
                    </div>

                    {recentInvoices.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-400">
                            No invoices generated yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                                        <th className="pb-3">Invoice #</th>
                                        <th className="pb-3">SaaS Package</th>
                                        <th className="pb-3">Amount</th>
                                        <th className="pb-3">Payment Method</th>
                                        <th className="pb-3">Transaction ID</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {recentInvoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="py-3 font-mono font-bold text-indigo-600 dark:text-cyan-400">{inv.invoice_number}</td>
                                            <td className="py-3 font-semibold text-slate-900 dark:text-white">{inv.subscription?.product?.name || 'SaaS Product'}</td>
                                            <td className="py-3 font-bold">{formatCurrency(inv.amount, inv.currency || currency)}</td>
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
        </CustomerLayout>
    );
}
