import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { DateRangeFilter } from '@/components/admin/date-range-filter';
import { formatCurrency, formatDateEnUs, formatNumberEnUs } from '@/lib/formatters';
import { useClientDataTable } from '@/hooks/use-client-data-table';
import { Pagination } from '@/components/ui/pagination';
import {
    TrendingUp,
    DollarSign,
    Receipt,
    CreditCard,
    Calendar,
    ArrowUpRight,
    Search,
    X,
    FolderGit2,
    Layers,
    PieChart,
    BarChart3,
    Clock,
    CheckCircle2,
    ExternalLink,
    Wallet,
    Coins,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    PlusCircle,
    ArrowRight,
    AlertOctagon,
    RotateCcw,
    XCircle,
    ShieldAlert,
    HelpCircle,
    Hourglass
} from 'lucide-react';

// Chart.js imports
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface TransactionItem {
    id: string;
    source: string;
    source_type: 'subscriptions' | 'custom_orders';
    invoice_number: string;
    order_number: string;
    order_url?: string;
    client_name: string;
    client_email: string;
    title: string;
    amount: number;
    currency: string;
    payment_method: string;
    transaction_id: string;
    paid_at: string | null;
    paid_at_formatted: string;
    status: string;
}

interface NonClearedItem {
    id: string;
    category: 'refunded' | 'rejected' | 'cancelled';
    category_label: string;
    source: string;
    source_type: 'subscriptions' | 'custom_orders';
    ref_number: string;
    order_number: string;
    order_url?: string;
    client_name: string;
    client_email: string;
    title: string;
    amount: number;
    currency: string;
    reason: string;
    transaction_id: string;
    occurred_at: string | null;
    occurred_at_formatted: string;
}

interface PnLProps {
    filters: {
        timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
        currency: string;
        from_date: string;
        to_date: string;
        period_label?: string;
    };
    summary: {
        total_bdt: number;
        total_usd: number;
        total_eur: number;
        total_transactions: number;
        subscriptions_breakdown: {
            bdt: number;
            usd: number;
            eur: number;
            count: number;
        };
        custom_orders_breakdown: {
            bdt: number;
            usd: number;
            eur: number;
            count: number;
        };
    };
    nonClearedSummary?: {
        total_bdt: number;
        total_usd: number;
        total_eur: number;
        total_count: number;
        refunded: { bdt: number; usd: number; eur: number; count: number };
        rejected_subscriptions: { bdt: number; usd: number; eur: number; count: number };
        cancelled_custom_orders: { bdt: number; usd: number; eur: number; count: number };
    };
    pipelineSummary?: {
        pending_bdt: number;
        pending_usd: number;
        pending_eur: number;
        pending_milestones_count: number;
        pending_invoices_count: number;
    };
    trendChart: {
        labels: string[];
        bdt: number[];
        usd: number[];
        eur: number[];
    };
    gatewayBreakdown: Record<string, number>;
    transactions: TransactionItem[];
    nonClearedItems?: NonClearedItem[];
}

export default function PnLReport({
    filters,
    summary,
    nonClearedSummary = {
        total_bdt: 0,
        total_usd: 0,
        total_eur: 0,
        total_count: 0,
        refunded: { bdt: 0, usd: 0, eur: 0, count: 0 },
        rejected_subscriptions: { bdt: 0, usd: 0, eur: 0, count: 0 },
        cancelled_custom_orders: { bdt: 0, usd: 0, eur: 0, count: 0 },
    },
    pipelineSummary = {
        pending_bdt: 0,
        pending_usd: 0,
        pending_eur: 0,
        pending_milestones_count: 0,
        pending_invoices_count: 0,
    },
    trendChart,
    gatewayBreakdown,
    transactions,
    nonClearedItems = [],
}: PnLProps) {
    const [selectedCurrencyTab, setSelectedCurrencyTab] = useState<'ALL' | 'BDT' | 'USD' | 'EUR'>('ALL');
    const [activeLedgerTab, setActiveLedgerTab] = useState<'cleared' | 'non_cleared'>('cleared');

    const handleTimeframeChange = (newTimeframe: string) => {
        router.get(
            '/admin/profite-and-loss',
            { timeframe: newTimeframe },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleCustomDateApply = (from: string, to: string) => {
        router.get(
            '/admin/profite-and-loss',
            { timeframe: 'custom', from_date: from, to_date: to },
            { preserveState: true, preserveScroll: true }
        );
    };

    // Filter cleared transactions based on selected currency tab
    const filteredTransactions = React.useMemo(() => {
        if (selectedCurrencyTab === 'ALL') return transactions;
        return transactions.filter(t => t.currency === selectedCurrencyTab);
    }, [transactions, selectedCurrencyTab]);

    const txTable = useClientDataTable<TransactionItem>({
        data: filteredTransactions,
        searchFields: (t) => [
            t.invoice_number,
            t.order_number,
            t.client_name,
            t.client_email,
            t.title,
            t.payment_method,
            t.transaction_id,
            t.currency,
        ],
        initialPageSize: 10,
    });

    // Filter non-cleared items based on selected currency tab
    const filteredNonCleared = React.useMemo(() => {
        if (selectedCurrencyTab === 'ALL') return nonClearedItems;
        return nonClearedItems.filter(item => item.currency === selectedCurrencyTab);
    }, [nonClearedItems, selectedCurrencyTab]);

    const nonClearedTable = useClientDataTable<NonClearedItem>({
        data: filteredNonCleared,
        searchFields: (item) => [
            item.ref_number,
            item.order_number,
            item.client_name,
            item.client_email,
            item.title,
            item.reason,
            item.transaction_id,
            item.category_label,
            item.currency,
        ],
        initialPageSize: 10,
    });

    // 1. Chart.js: Multi-Currency Revenue Trend Line/Area Chart
    const trendDatasets = [];
    if (selectedCurrencyTab === 'ALL' || selectedCurrencyTab === 'BDT') {
        trendDatasets.push({
            label: 'BDT (৳) Cleared Income',
            data: trendChart.bdt,
            borderColor: '#10b981', // Emerald
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            yAxisID: 'yBDT',
        });
    }
    if (selectedCurrencyTab === 'ALL' || selectedCurrencyTab === 'USD') {
        trendDatasets.push({
            label: 'USD ($) Cleared Income',
            data: trendChart.usd,
            borderColor: '#6366f1', // Indigo
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            yAxisID: 'yUSD',
        });
    }
    if (selectedCurrencyTab === 'ALL' || selectedCurrencyTab === 'EUR') {
        trendDatasets.push({
            label: 'EUR (€) Cleared Income',
            data: trendChart.eur,
            borderColor: '#06b6d4', // Cyan
            backgroundColor: 'rgba(6, 182, 212, 0.12)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            yAxisID: 'yUSD',
        });
    }

    const lineChartData = {
        labels: trendChart.labels,
        datasets: trendDatasets,
    };

    // 2. Chart.js: Revenue Streams (Custom Orders vs Orders & Subscriptions)
    const doughnutStreamData = {
        labels: ['Orders & Subscriptions', 'Custom Orders'],
        datasets: [
            {
                data: [
                    summary.subscriptions_breakdown.bdt + (summary.subscriptions_breakdown.usd * 120) + (summary.subscriptions_breakdown.eur * 130),
                    summary.custom_orders_breakdown.bdt + (summary.custom_orders_breakdown.usd * 120) + (summary.custom_orders_breakdown.eur * 130)
                ],
                backgroundColor: ['#6366f1', '#06b6d4'],
                borderWidth: 0,
            },
        ],
    };

    // 3. Chart.js: Payment Methods / Gateways Distribution
    const gatewayLabels = Object.keys(gatewayBreakdown);
    const gatewayValues = Object.values(gatewayBreakdown);
    const barGatewayData = {
        labels: gatewayLabels.length ? gatewayLabels : ['bKash', 'Nagad', 'Direct Bank', 'Stripe'],
        datasets: [
            {
                label: 'Realized Income Volume',
                data: gatewayValues.length ? gatewayValues : [0, 0, 0, 0],
                backgroundColor: [
                    '#ec4899', // Pink (bKash)
                    '#f97316', // Orange (Nagad)
                    '#6366f1', // Indigo
                    '#10b981', // Emerald
                    '#06b6d4', // Cyan
                ],
                borderRadius: 8,
            },
        ],
    };

    const timeframeTabs: { id: 'monthly' | 'daily' | 'weekly' | 'yearly' | 'custom'; label: string; desc: string }[] = [
        { id: 'monthly', label: 'Monthly Income', desc: 'Full Month breakdown (e.g. current month)' },
        { id: 'daily', label: 'Daily View', desc: 'Single-day hourly breakdown' },
        { id: 'weekly', label: 'Weekly Aggregates', desc: 'Current 7-day week breakdown' },
        { id: 'yearly', label: 'Yearly Overview', desc: 'Full calendar year monthly progression' },
        { id: 'custom', label: 'Custom Range', desc: 'Custom date interval' },
    ];

    return (
        <AdminLayout
            title="Financials & P&L Statement"
            breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'P&L Financials' }]}
        >
            <div className="space-y-8">
                {/* Header & Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2.5">
                            <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold shadow-2xs">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    P&amp;L Financials &amp; Realized Income
                                </h1>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Cleared Income = <strong className="font-bold text-cyan-600 dark:text-cyan-400">Custom Orders (Collected Milestones)</strong> + <strong className="font-bold text-indigo-600 dark:text-indigo-400">Orders &amp; Subscriptions (Paid Invoices)</strong>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Timeframe selector tabs */}
                    <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                        {timeframeTabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleTimeframeChange(tab.id)}
                                title={tab.desc}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    filters.timeframe === tab.id
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Audit Period Banner & Date Range Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                            <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                                Current Accounting Period ({filters.timeframe.toUpperCase()})
                            </span>
                            <div className="text-sm font-black text-slate-900 dark:text-white">
                                {formatDateEnUs(filters.from_date)} &mdash; {formatDateEnUs(filters.to_date)}
                            </div>
                        </div>
                    </div>

                    <DateRangeFilter
                        fromDate={filters.from_date}
                        toDate={filters.to_date}
                        onApply={handleCustomDateApply}
                    />
                </div>

                {/* Cleared Income Pillars: Subscriptions + Custom Orders */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Orders & Subscriptions Pillar */}
                    <Link
                        href="/admin/subscriptions"
                        className="p-5 rounded-3xl bg-indigo-500/[0.07] dark:bg-indigo-950/30 border border-indigo-500/20 hover:border-indigo-500/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <CreditCard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                <span className="text-xs font-black uppercase text-indigo-900 dark:text-indigo-300">
                                    Orders &amp; Subscriptions
                                </span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                {summary.subscriptions_breakdown.count} Paid Invoices
                            </span>
                        </div>
                        <div className="my-3">
                            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                ৳ {formatNumberEnUs(summary.subscriptions_breakdown.bdt)}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                ${formatNumberEnUs(summary.subscriptions_breakdown.usd)} USD • €{formatNumberEnUs(summary.subscriptions_breakdown.eur)} EUR
                            </div>
                        </div>
                        <div className="text-[11px] font-bold text-indigo-600 dark:text-cyan-400 flex items-center space-x-1 group-hover:underline">
                            <span>Manage Subscriptions</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                        </div>
                    </Link>

                    {/* Plus Icon Indicator */}
                    <div className="hidden md:flex items-center justify-center">
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-black text-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                            +
                        </div>
                    </div>

                    {/* Custom Orders Pillar */}
                    <Link
                        href="/admin/custom-orders"
                        className="p-5 rounded-3xl bg-cyan-500/[0.07] dark:bg-cyan-950/30 border border-cyan-500/20 hover:border-cyan-500/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <FolderGit2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                <span className="text-xs font-black uppercase text-cyan-900 dark:text-cyan-300">
                                    Custom Orders
                                </span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                {summary.custom_orders_breakdown.count} Collected Milestones
                            </span>
                        </div>
                        <div className="my-3">
                            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                ৳ {formatNumberEnUs(summary.custom_orders_breakdown.bdt)}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                ${formatNumberEnUs(summary.custom_orders_breakdown.usd)} USD • €{formatNumberEnUs(summary.custom_orders_breakdown.eur)} EUR
                            </div>
                        </div>
                        <div className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center space-x-1 group-hover:underline">
                            <span>Manage Custom Orders</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                        </div>
                    </Link>
                </div>

                {/* Multi-Currency Combined Cleared Income KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* BDT Income */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-500/30 dark:border-emerald-500/20 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                                Cleared Realized (BDT)
                            </span>
                            <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                                ৳
                            </div>
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">
                            ৳ {formatNumberEnUs(summary.total_bdt)}
                        </div>
                        <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            <span>Sub: ৳{formatNumberEnUs(summary.subscriptions_breakdown.bdt)}</span>
                            <span>Custom: ৳{formatNumberEnUs(summary.custom_orders_breakdown.bdt)}</span>
                        </div>
                    </div>

                    {/* USD Income */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/15 via-indigo-500/5 to-transparent border border-indigo-500/30 dark:border-indigo-500/20 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase text-indigo-700 dark:text-indigo-400 tracking-wider">
                                Cleared Realized (USD)
                            </span>
                            <div className="h-8 w-8 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                                <DollarSign className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">
                            ${formatNumberEnUs(summary.total_usd)}
                        </div>
                        <div className="pt-2 border-t border-indigo-500/20 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            <span>Sub: ${formatNumberEnUs(summary.subscriptions_breakdown.usd)}</span>
                            <span>Custom: ${formatNumberEnUs(summary.custom_orders_breakdown.usd)}</span>
                        </div>
                    </div>

                    {/* EUR Income */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-500/15 via-cyan-500/5 to-transparent border border-cyan-500/30 dark:border-cyan-500/20 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase text-cyan-700 dark:text-cyan-400 tracking-wider">
                                Cleared Realized (EUR)
                            </span>
                            <div className="h-8 w-8 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-black">
                                €
                            </div>
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">
                            €{formatNumberEnUs(summary.total_eur)}
                        </div>
                        <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            <span>Sub: €{formatNumberEnUs(summary.subscriptions_breakdown.eur)}</span>
                            <span>Custom: €{formatNumberEnUs(summary.custom_orders_breakdown.eur)}</span>
                        </div>
                    </div>

                    {/* Total Realized Transactions */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase text-slate-500">
                                Cleared Settlements
                            </span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">
                            {formatNumberEnUs(summary.total_transactions)} Settled
                        </div>
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                            <span>{summary.subscriptions_breakdown.count} Sub Invoices</span>
                            <span>{summary.custom_orders_breakdown.count} Custom Milestones</span>
                        </div>
                    </div>
                </div>

                {/* SEPARATE METRICS: Cancelled, Rejected & Returned / Refunded Section */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-500/[0.08] via-rose-500/[0.03] to-transparent border border-rose-500/25 dark:border-rose-500/20 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-2.5">
                            <div className="h-9 w-9 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                                <ShieldAlert className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
                                    <span>Cancelled, Rejected &amp; Returned / Refunded Metrics</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                        Excluded from Cleared Income
                                    </span>
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Tracked separately for full accounting compliance, client dispute tracking, and refund auditing.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setActiveLedgerTab('non_cleared')}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all self-start sm:self-auto"
                        >
                            <span>View {nonClearedSummary.total_count} Non-Cleared Records</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                        {/* Total Non-Cleared Volume */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/30 space-y-1">
                            <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider block">
                                Total Returned / Lost
                            </span>
                            <div className="text-xl font-black text-slate-900 dark:text-white">
                                ৳ {formatNumberEnUs(nonClearedSummary.total_bdt)}
                            </div>
                            <div className="text-[11px] text-slate-500">
                                ${formatNumberEnUs(nonClearedSummary.total_usd)} USD • €{formatNumberEnUs(nonClearedSummary.total_eur)} EUR
                            </div>
                        </div>

                        {/* Payment Returned / Refunded */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                    Returned / Refunded
                                </span>
                                <RotateCcw className="h-3.5 w-3.5 text-rose-500" />
                            </div>
                            <div className="text-xl font-black text-slate-900 dark:text-white">
                                ৳ {formatNumberEnUs(nonClearedSummary.refunded.bdt)}
                            </div>
                            <div className="text-[11px] text-slate-500">
                                {nonClearedSummary.refunded.count} Custom Order Milestones
                            </div>
                        </div>

                        {/* Rejected Subscriptions */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                    Rejected Subscriptions
                                </span>
                                <XCircle className="h-3.5 w-3.5 text-amber-500" />
                            </div>
                            <div className="text-xl font-black text-slate-900 dark:text-white">
                                ৳ {formatNumberEnUs(nonClearedSummary.rejected_subscriptions.bdt)}
                            </div>
                            <div className="text-[11px] text-slate-500">
                                {nonClearedSummary.rejected_subscriptions.count} Rejected Invoices/Orders
                            </div>
                        </div>

                        {/* Cancelled / Denied Custom Orders */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                    Cancelled / Denied
                                </span>
                                <AlertOctagon className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            <div className="text-xl font-black text-slate-900 dark:text-white">
                                ৳ {formatNumberEnUs(nonClearedSummary.cancelled_custom_orders.bdt)}
                            </div>
                            <div className="text-[11px] text-slate-500">
                                {nonClearedSummary.cancelled_custom_orders.count} Denied Custom Projects
                            </div>
                        </div>
                    </div>
                </div>

                {/* Primary Chart: Time-Series Revenue Trend (Daily / Weekly / Monthly / Yearly) */}
                <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                                <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                                <span>Cleared Income Progression Timeline</span>
                            </h2>
                            <p className="text-xs text-slate-500">
                                {filters.timeframe === 'monthly'
                                    ? `Daily breakdown of realized cleared income for ${formatDateEnUs(filters.from_date)} — ${formatDateEnUs(filters.to_date)}`
                                    : filters.timeframe === 'yearly'
                                    ? `Monthly progression of realized cleared income for ${formatDateEnUs(filters.from_date)} — ${formatDateEnUs(filters.to_date)}`
                                    : `Income timeline for ${formatDateEnUs(filters.from_date)} — ${formatDateEnUs(filters.to_date)}`}
                            </p>
                        </div>

                        {/* Currency toggle for the chart */}
                        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                            {(['ALL', 'BDT', 'USD', 'EUR'] as const).map((curr) => (
                                <button
                                    key={curr}
                                    type="button"
                                    onClick={() => setSelectedCurrencyTab(curr)}
                                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                                        selectedCurrencyTab === curr
                                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-400 shadow-xs'
                                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {curr === 'ALL' ? 'All Currencies' : curr}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-80 w-full pt-4">
                        <Line
                            data={lineChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { position: 'top' as const },
                                    tooltip: {
                                        callbacks: {
                                            label: (ctx) => {
                                                const label = ctx.dataset.label || '';
                                                const val = formatNumberEnUs(Number(ctx.raw || 0));
                                                return `${label}: ${val}`;
                                            },
                                        },
                                    },
                                },
                                scales: {
                                    yBDT: {
                                        type: 'linear' as const,
                                        position: 'left' as const,
                                        beginAtZero: true,
                                        grid: { color: 'rgba(150, 150, 150, 0.08)' },
                                    },
                                    yUSD: {
                                        type: 'linear' as const,
                                        position: 'right' as const,
                                        beginAtZero: true,
                                        grid: { display: false },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>

                {/* Secondary Charts: Revenue Streams (Custom Orders vs Subscriptions) & Payment Gateways */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Revenue Stream Breakdown */}
                    <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                <PieChart className="h-4 w-4 text-cyan-400" />
                                <span>Cleared Income by Revenue Stream</span>
                            </h3>
                            <span className="text-[10px] font-bold uppercase text-slate-400">Total Volume</span>
                        </div>

                        <div className="h-56 w-full flex items-center justify-center">
                            <Doughnut
                                data={doughnutStreamData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom' as const } },
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-100 dark:border-slate-800">
                            <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                                <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-cyan-400 block">
                                    Orders &amp; Subscriptions
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white mt-1 block">
                                    ৳{formatNumberEnUs(summary.subscriptions_breakdown.bdt)}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                    ${formatNumberEnUs(summary.subscriptions_breakdown.usd)} • €{formatNumberEnUs(summary.subscriptions_breakdown.eur)}
                                </span>
                            </div>

                            <div className="p-3 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/40">
                                <span className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400 block">
                                    Custom Orders
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white mt-1 block">
                                    ৳{formatNumberEnUs(summary.custom_orders_breakdown.bdt)}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                    ${formatNumberEnUs(summary.custom_orders_breakdown.usd)} • €{formatNumberEnUs(summary.custom_orders_breakdown.eur)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Gateway / Collection Channels */}
                    <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                <Wallet className="h-4 w-4 text-emerald-500" />
                                <span>Cleared Income by Payment Method &amp; Gateway</span>
                            </h3>
                            <span className="text-[10px] font-bold uppercase text-slate-400">Processed Volume</span>
                        </div>

                        <div className="h-56 w-full">
                            <Bar
                                data={barGatewayData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: { y: { beginAtZero: true, grid: { color: 'rgba(150, 150, 150, 0.08)' } } },
                                }}
                            />
                        </div>

                        <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                            Processed via verified manual mobile banking (bKash/Nagad), automated payment gateways, and direct client wire settlements.
                        </p>
                    </div>
                </div>

                {/* Ledger Hub: Cleared Revenue Ledger vs Cancelled/Rejected/Returned Ledger */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6">
                    {/* Ledger Tabs Switcher */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => setActiveLedgerTab('cleared')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                                    activeLedgerTab === 'cleared'
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Cleared Revenue Ledger</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-black">
                                    {filteredTransactions.length}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveLedgerTab('non_cleared')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                                    activeLedgerTab === 'non_cleared'
                                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <RotateCcw className="h-4 w-4" />
                                <span>Cancelled, Rejected &amp; Returned Log</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-700 dark:text-rose-300 font-black">
                                    {filteredNonCleared.length}
                                </span>
                            </button>
                        </div>

                        {/* Search Input for Active Ledger */}
                        <div className="flex items-center space-x-3">
                            {activeLedgerTab === 'cleared' ? (
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={txTable.search}
                                        onChange={(e) => txTable.setSearch(e.target.value)}
                                        placeholder="Search cleared transactions..."
                                        className="w-full pl-8 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-1 focus:ring-emerald-500"
                                    />
                                    {txTable.search && (
                                        <button
                                            type="button"
                                            onClick={txTable.clearSearch}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={nonClearedTable.search}
                                        onChange={(e) => nonClearedTable.setSearch(e.target.value)}
                                        placeholder="Search non-cleared / refunds..."
                                        className="w-full pl-8 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-1 focus:ring-rose-500"
                                    />
                                    {nonClearedTable.search && (
                                        <button
                                            type="button"
                                            onClick={nonClearedTable.clearSearch}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* TAB 1: CLEARED REVENUE LEDGER */}
                    {activeLedgerTab === 'cleared' && (
                        <div className="space-y-4">
                            {filteredTransactions.length === 0 ? (
                                <div className="text-center py-12 text-xs text-slate-400">
                                    No cleared paid transactions recorded for {formatDateEnUs(filters.from_date)} &mdash; {formatDateEnUs(filters.to_date)}.
                                </div>
                            ) : txTable.paginatedData.length === 0 ? (
                                <div className="text-center py-12 text-xs text-slate-400">
                                    No transactions matching &ldquo;{txTable.search}&rdquo;
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                                                    <th className="pb-3">Ref / Invoice #</th>
                                                    <th className="pb-3">Pillar</th>
                                                    <th className="pb-3">Client</th>
                                                    <th className="pb-3">Service / Milestone</th>
                                                    <th className="pb-3">Cleared Amount</th>
                                                    <th className="pb-3">Gateway &amp; TrxID</th>
                                                    <th className="pb-3 text-right">Cleared Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {txTable.paginatedData.map((tx) => (
                                                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                                        <td className="py-3.5 font-mono font-bold text-indigo-600 dark:text-cyan-400">
                                                            <div className="flex items-center space-x-1.5">
                                                                <Link 
                                                                    href={tx.order_url || '/admin/custom-orders'}
                                                                    className="hover:underline flex items-center space-x-1"
                                                                >
                                                                    <span>{tx.invoice_number}</span>
                                                                    <ExternalLink className="h-3 w-3 opacity-60" />
                                                                </Link>
                                                            </div>
                                                            {tx.order_number !== 'N/A' && (
                                                                <div className="text-[10px] text-slate-400 font-normal">
                                                                    Order #{tx.order_number}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-3.5">
                                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                                tx.source_type === 'subscriptions'
                                                                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                                                                    : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                                                            }`}>
                                                                {tx.source}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5">
                                                            <div className="font-bold text-slate-900 dark:text-white">{tx.client_name}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">{tx.client_email}</div>
                                                        </td>
                                                        <td className="py-3.5 font-medium text-slate-800 dark:text-slate-200">
                                                            {tx.title}
                                                        </td>
                                                        <td className="py-3.5">
                                                            <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                                                                {formatCurrency(tx.amount, tx.currency)}
                                                            </span>
                                                            <span className="text-[10px] font-mono font-bold text-slate-400 ml-1 uppercase">
                                                                ({tx.currency})
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5">
                                                            <div className="font-bold uppercase text-[11px] text-slate-700 dark:text-slate-300">
                                                                {tx.payment_method}
                                                            </div>
                                                            <div className="font-mono text-[10px] text-slate-400">
                                                                {tx.transaction_id}
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 text-right text-slate-500 dark:text-slate-400 font-medium">
                                                            {tx.paid_at_formatted}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <Pagination
                                        currentPage={txTable.currentPage}
                                        totalPages={txTable.totalPages}
                                        total={txTable.total}
                                        from={txTable.from}
                                        to={txTable.to}
                                        onPageChange={txTable.setCurrentPage}
                                        itemLabel="transactions"
                                    />
                                </>
                            )}
                        </div>
                    )}

                    {/* TAB 2: CANCELLED, REJECTED & RETURNED / REFUNDED LOG */}
                    {activeLedgerTab === 'non_cleared' && (
                        <div className="space-y-4">
                            {filteredNonCleared.length === 0 ? (
                                <div className="text-center py-12 text-xs text-slate-400">
                                    No cancelled, rejected, or returned items recorded for {formatDateEnUs(filters.from_date)} &mdash; {formatDateEnUs(filters.to_date)}.
                                </div>
                            ) : nonClearedTable.paginatedData.length === 0 ? (
                                <div className="text-center py-12 text-xs text-slate-400">
                                    No non-cleared items matching &ldquo;{nonClearedTable.search}&rdquo;
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                                                    <th className="pb-3">Ref / Order #</th>
                                                    <th className="pb-3">Classification</th>
                                                    <th className="pb-3">Client</th>
                                                    <th className="pb-3">Service / Milestone</th>
                                                    <th className="pb-3">Non-Cleared Amount</th>
                                                    <th className="pb-3">Reason / Details</th>
                                                    <th className="pb-3 text-right">Event Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {nonClearedTable.paginatedData.map((item) => (
                                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                                        <td className="py-3.5 font-mono font-bold text-rose-600 dark:text-rose-400">
                                                            <div className="flex items-center space-x-1.5">
                                                                <Link 
                                                                    href={item.order_url || '/admin/custom-orders'}
                                                                    className="hover:underline flex items-center space-x-1"
                                                                >
                                                                    <span>{item.ref_number}</span>
                                                                    <ExternalLink className="h-3 w-3 opacity-60" />
                                                                </Link>
                                                            </div>
                                                            {item.order_number !== 'N/A' && item.order_number !== item.ref_number && (
                                                                <div className="text-[10px] text-slate-400 font-normal">
                                                                    Order #{item.order_number}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-3.5">
                                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                                item.category === 'refunded'
                                                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                                                    : item.category === 'rejected'
                                                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                                                    : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                                                            }`}>
                                                                {item.category_label}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5">
                                                            <div className="font-bold text-slate-900 dark:text-white">{item.client_name}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">{item.client_email}</div>
                                                        </td>
                                                        <td className="py-3.5 font-medium text-slate-800 dark:text-slate-200">
                                                            {item.title}
                                                        </td>
                                                        <td className="py-3.5">
                                                            <span className="font-black text-sm text-rose-600 dark:text-rose-400 line-through">
                                                                {formatCurrency(item.amount, item.currency)}
                                                            </span>
                                                            <span className="text-[10px] font-mono font-bold text-slate-400 ml-1 uppercase">
                                                                ({item.currency})
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 max-w-xs">
                                                            <div className="text-slate-700 dark:text-slate-300 font-medium truncate" title={item.reason}>
                                                                {item.reason}
                                                            </div>
                                                            {item.transaction_id !== 'N/A' && (
                                                                <div className="font-mono text-[10px] text-slate-400">
                                                                    TrxID: {item.transaction_id}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-3.5 text-right text-slate-500 dark:text-slate-400 font-medium">
                                                            {item.occurred_at_formatted}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <Pagination
                                        currentPage={nonClearedTable.currentPage}
                                        totalPages={nonClearedTable.totalPages}
                                        total={nonClearedTable.total}
                                        from={nonClearedTable.from}
                                        to={nonClearedTable.to}
                                        onPageChange={nonClearedTable.setCurrentPage}
                                        itemLabel="records"
                                    />
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
