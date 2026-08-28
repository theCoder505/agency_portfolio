import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { CustomerLayout } from '@/layouts/customer-layout';
import { PaginatedData, SubscriptionInvoice } from '@/types';
import {
    Receipt,
    Printer,
    Download,
    CheckCircle2,
    Clock,
    AlertCircle,
    FileText,
    Building2,
    Calendar,
    ChevronRight,
    X
} from 'lucide-react';

interface InvoicesIndexProps {
    invoices: PaginatedData<SubscriptionInvoice>;
    filters: {
        status: string;
    };
    brandSettings: {
        brand_name: string;
        contact_email: string;
        contact_phone: string;
        address_line1: string;
        address_line2: string;
        currency_symbol: string;
    };
}

export default function InvoicesIndex({
    invoices,
    filters = { status: 'all' },
    brandSettings = {
        brand_name: 'CodeVenture Tech',
        contact_email: 'hello@codeventure.tech',
        contact_phone: '+1 (555) 234-5678',
        address_line1: '',
        address_line2: '',
        currency_symbol: '৳',
    },
}: InvoicesIndexProps) {
    const currency = brandSettings?.currency_symbol || '৳';
    const [selectedInvoice, setSelectedInvoice] = useState<SubscriptionInvoice | null>(null);

    const handleFilter = (status: string) => {
        router.get('/customer/invoices', { status }, { preserveState: true });
    };

    const printReceipt = () => {
        window.print();
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
                            Invoices & Payment Receipts
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Official billing statements and transaction confirmation records for your account.
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start sm:self-auto shadow-xs">
                        {['all', 'paid', 'pending', 'rejected'].map((st) => (
                            <button
                                key={st}
                                onClick={() => handleFilter(st)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                                    filters.status === st || (st === 'all' && (!filters.status || filters.status === 'all'))
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Invoices Table Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                    {invoices.data.length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                            <Receipt className="h-10 w-10 text-slate-400 mx-auto" />
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No invoices found</h3>
                            <p className="text-xs text-slate-500">You currently have no invoices under the selected filter.</p>
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
                                        <th className="py-3.5 px-5 text-right">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {invoices.data.map((inv) => (
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
                                                {currency}{inv.amount.toLocaleString()}
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
                                                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 font-bold text-xs transition-colors"
                                                >
                                                    <FileText className="h-3.5 w-3.5" />
                                                    <span>View</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* PRINTABLE INVOICE RECEIPT MODAL */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto print:p-0 print:border-none print:shadow-none">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 print:hidden">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Invoice Statement
                            </h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={printReceipt}
                                    className="p-2 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-cyan-400 hover:bg-indigo-100 text-xs font-bold flex items-center space-x-1"
                                >
                                    <Printer className="h-4 w-4" />
                                    <span>Print</span>
                                </button>
                                <button
                                    onClick={() => setSelectedInvoice(null)}
                                    className="p-2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Invoice Paper Layout */}
                        <div className="space-y-6">
                            {/* Brand Header */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                                        {brandSettings.brand_name}
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-1">{brandSettings.address_line1}</p>
                                    <p className="text-xs text-slate-500">{brandSettings.contact_email}</p>
                                </div>

                                <div className="text-right">
                                    <div className="text-xs font-mono font-bold text-indigo-600 dark:text-cyan-400">
                                        {selectedInvoice.invoice_number}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        Date: {new Date(selectedInvoice.created_at).toLocaleDateString()}
                                    </div>
                                    <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                                        selectedInvoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                    }`}>
                                        {selectedInvoice.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Service Item Table */}
                            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-800 font-bold">
                                        <tr>
                                            <th className="p-3">Description</th>
                                            <th className="p-3">Term</th>
                                            <th className="p-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="p-3 font-semibold">
                                                {selectedInvoice.subscription?.product?.name || 'SaaS Cloud Subscription'}
                                            </td>
                                            <td className="p-3 capitalize">{selectedInvoice.billing_cycle.replace('_', ' ')}</td>
                                            <td className="p-3 text-right font-black">{currency}{selectedInvoice.amount.toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Payment Meta */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                                <div><strong>Payment Method:</strong> {selectedInvoice.payment_method.toUpperCase()}</div>
                                <div><strong>Sender Number:</strong> {selectedInvoice.sender_number || 'N/A'}</div>
                                <div><strong>Transaction ID:</strong> <span className="font-mono font-bold">{selectedInvoice.transaction_id || 'N/A'}</span></div>
                                {selectedInvoice.notes && <div><strong>Notes:</strong> {selectedInvoice.notes}</div>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}
