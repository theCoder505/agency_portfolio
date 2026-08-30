import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { CustomerLayout } from '@/layouts/customer-layout';
import { PaginatedData, SubscriptionInvoice } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { Pagination } from '@/components/ui/pagination';
import { useClientDataTable } from '@/hooks/use-client-data-table';
import { InvoiceReceiptModal } from '@/components/invoices/invoice-receipt-modal';
import {
    Receipt,
    Download,
    CheckCircle2,
    Clock,
    AlertCircle,
    FileText,
    Building2,
    Calendar,
    ChevronRight,
    Search,
    X,
    ExternalLink
} from 'lucide-react';

interface InvoicesIndexProps {
    invoices: SubscriptionInvoice[] | PaginatedData<SubscriptionInvoice>;
    brandSettings?: {
        brand_name?: string;
        logo?: string;
        contact_email?: string;
        contact_phone?: string;
        address_line1?: string;
        address_line2?: string;
        currency_symbol?: string;
    };
}

export default function InvoicesIndex({
    invoices,
    brandSettings = {
        brand_name: 'CodeVenture Tech',
        contact_email: 'hello@codeventure.tech',
        contact_phone: '+880 1700-000000',
        address_line1: 'House #42, Road #11, Banani',
        address_line2: 'Dhaka - 1213, Bangladesh',
        currency_symbol: '৳',
    },
}: InvoicesIndexProps) {
    const currency = brandSettings?.currency_symbol || '৳';
    const [selectedInvoice, setSelectedInvoice] = useState<SubscriptionInvoice | null>(null);
    const [activeStatus, setActiveStatus] = useState('all');

    const allInvoicesList = useMemo(() => {
        return Array.isArray(invoices) ? invoices : invoices?.data || [];
    }, [invoices]);

    // Auto-open invoice modal if ref param is present in URL
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const refParam = params.get('ref');
            if (refParam) {
                const found = allInvoicesList.find(
                    (i) => i.invoice_number === refParam || String(i.id) === refParam
                );
                if (found) {
                    setSelectedInvoice(found);
                }
            }
        }
    }, [allInvoicesList]);

    // Status filter
    const filteredByStatus = useMemo(() => {
        if (activeStatus === 'all') return allInvoicesList;
        return allInvoicesList.filter((inv) => inv.status === activeStatus);
    }, [allInvoicesList, activeStatus]);

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
    } = useClientDataTable<SubscriptionInvoice>({
        items: filteredByStatus,
        pageSize: 10,
        searchFields: ['invoice_number', 'transaction_id', 'payment_method', 'type', 'subscription.product.name'],
    });

    const handleStatusFilter = (st: string) => {
        setActiveStatus(st);
        setCurrentPage(1);
    };

    return (
        <CustomerLayout
            title="Payment Invoices & Receipts"
            breadcrumbs={[{ title: 'Invoices' }]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            Invoices &amp; Payment Receipts
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Official billing statements, transaction confirmation records, and downloadable PDF receipts for your account.
                        </p>
                    </div>

                    {/* Filter Tabs and Live Search */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <form onSubmit={handleImmediateSearch} className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search invoice, TrxID..."
                                className="w-full pl-8 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-1 focus:ring-indigo-500"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </form>

                        <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start sm:self-auto shadow-xs">
                            {['all', 'paid', 'pending', 'rejected'].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => handleStatusFilter(st)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                                        activeStatus === st
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Invoices Table Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                    {paginatedItems.length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                            <Receipt className="h-10 w-10 text-slate-400 mx-auto" />
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No invoices found</h3>
                            <p className="text-xs text-slate-500">You currently have no invoices matching the selected search/filter.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-slate-50/70 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                                        <th className="py-3.5 px-5">Invoice #</th>
                                        <th className="py-3.5 px-4">SaaS Service</th>
                                        <th className="py-3.5 px-4">Type</th>
                                        <th className="py-3.5 px-4">Amount</th>
                                        <th className="py-3.5 px-4">Gateway</th>
                                        <th className="py-3.5 px-4">TrxID</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4">Date</th>
                                        <th className="py-3.5 px-5 text-right">PDF Invoice</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {paginatedItems.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-4 px-5 font-mono font-bold text-indigo-600 dark:text-cyan-400">
                                                {inv.invoice_number}
                                            </td>
                                            <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                                                {inv.subscription?.product?.name || 'SaaS Product'}
                                            </td>
                                            <td className="py-4 px-4 capitalize text-slate-500">
                                                {inv.type}
                                            </td>
                                            <td className="py-4 px-4 font-black text-slate-900 dark:text-white">
                                                {formatCurrency(inv.amount, inv.currency || currency)}
                                            </td>
                                            <td className="py-4 px-4 uppercase font-mono font-semibold">
                                                {inv.payment_method}
                                            </td>
                                            <td className="py-4 px-4 font-mono text-slate-500">
                                                {inv.transaction_id || 'N/A'}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                    inv.status === 'paid'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                        : inv.status === 'pending'
                                                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                                }`}>
                                                    {inv.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-slate-400">
                                                {new Date(inv.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-5 text-right">
                                                <button
                                                    onClick={() => setSelectedInvoice(inv)}
                                                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-cyan-400 font-bold text-xs transition-all shadow-2xs cursor-pointer"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                    <span>PDF Statement</span>
                                                </button>
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
                        itemLabel="invoices"
                    />
                </div>
            </div>

            {/* OFFICIAL INVOICE STATEMENT PDF MODAL WITH BACKGROUND WATERMARK & URL */}
            {selectedInvoice && (
                <InvoiceReceiptModal
                    invoice={selectedInvoice}
                    isOpen={!!selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                    brandSettings={brandSettings}
                />
            )}
        </CustomerLayout>
    );
}
