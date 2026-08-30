import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { User, SaasSubscription, SubscriptionInvoice } from '@/types';
import {
    UserCheck,
    ArrowLeft,
    Layers,
    Receipt,
    Mail,
    Phone,
    Building2,
    Calendar,
    Globe,
    ExternalLink,
    ChevronRight,
    Edit2,
    Plus,
    Search,
    X
} from 'lucide-react';
import { useClientDataTable } from '@/hooks/use-client-data-table';
import { Pagination } from '@/components/ui/pagination';

interface CustomerShowProps {
    customer: User;
    subscriptions?: SaasSubscription[];
    invoices?: SubscriptionInvoice[];
    currencySymbol?: string;
}

export default function CustomerShow({
    customer,
    subscriptions = [],
    invoices = [],
    currencySymbol = '৳',
}: CustomerShowProps) {
    const customerSubs = (subscriptions && subscriptions.length > 0) ? subscriptions : (customer?.subscriptions || []);
    const customerInvs = (invoices && invoices.length > 0) ? invoices : (customer?.invoices || []);

    const totalSpent = customerInvs
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

    const subsTable = useClientDataTable<SaasSubscription>({
        data: customerSubs,
        searchFields: (sub) => [sub.order_number, sub.product?.name, sub.domain, sub.subdomain, sub.status, sub.billing_cycle],
        initialPageSize: 10,
    });

    const invsTable = useClientDataTable<SubscriptionInvoice>({
        data: customerInvs,
        searchFields: (inv) => [inv.invoice_number, inv.type, inv.payment_method, inv.transaction_id, inv.status],
        initialPageSize: 10,
    });

    return (
        <AdminLayout
            title={`Customer: ${customer.name}`}
            breadcrumbs={[
                { title: 'Customers', href: '/admin/customers' },
                { title: customer.name },
            ]}
        >
            <div className="space-y-6 max-w-5xl">
                {/* Header Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/admin/customers"
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                    {customer.name}
                                </h1>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    customer.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                }`}>
                                    {customer.status.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Member since {new Date(customer.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Link
                            href={`/admin/customers/${customer.id}/edit`}
                            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5"
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Edit Account</span>
                        </Link>
                        <Link
                            href="/admin/subscriptions/create"
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Assign SaaS Package</span>
                        </Link>
                    </div>
                </div>

                {/* Profile & KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                            Contact & Account Profile
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1">
                                <div className="text-slate-400">Email Address:</div>
                                <div className="font-mono font-bold text-slate-900 dark:text-white">{customer.email}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-slate-400">Phone Number:</div>
                                <div className="font-mono font-bold text-slate-900 dark:text-white">{customer.phone || 'N/A'}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-slate-400">Company / Brand:</div>
                                <div className="font-bold text-slate-900 dark:text-white">{customer.company_name || 'Individual Customer'}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-slate-400">Billing Address:</div>
                                <div className="text-slate-700 dark:text-slate-300">{customer.address || 'N/A'}</div>
                            </div>
                        </div>

                        {customer.admin_notes && (
                            <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                                <strong>Admin Note:</strong> {customer.admin_notes}
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
                        <div>
                            <span className="text-xs font-semibold text-slate-400">Lifetime Revenue</span>
                            <div className="text-2xl font-black text-indigo-600 dark:text-cyan-400 mt-1">
                                {currencySymbol}{totalSpent.toLocaleString()}
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Total Subscriptions:</span>
                                <span className="font-bold">{customerSubs.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Total Invoices:</span>
                                <span className="font-bold">{customerInvs.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscriptions Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-2">
                            <Layers className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                Subscriptions & Cloud Deployments ({customerSubs.length})
                            </h2>
                        </div>

                        {customerSubs.length > 0 && (
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={subsTable.search}
                                    onChange={(e) => subsTable.setSearch(e.target.value)}
                                    placeholder="Search subscriptions..."
                                    className="w-full pl-8 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-500"
                                />
                                {subsTable.search && (
                                    <button
                                        type="button"
                                        onClick={subsTable.clearSearch}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {customerSubs.length === 0 ? (
                        <div className="text-xs text-slate-400 py-4 text-center">No subscriptions assigned to this customer yet.</div>
                    ) : subsTable.paginatedData.length === 0 ? (
                        <div className="text-xs text-slate-400 py-4 text-center">No subscriptions matching &ldquo;{subsTable.search}&rdquo;</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                                            <th className="pb-3">Order #</th>
                                            <th className="pb-3">SaaS Product</th>
                                            <th className="pb-3">Term & Price</th>
                                            <th className="pb-3">Domain / Subdomain</th>
                                            <th className="pb-3">Status</th>
                                            <th className="pb-3">Expires At</th>
                                            <th className="pb-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {subsTable.paginatedData.map((sub) => (
                                            <tr key={sub.id}>
                                                <td className="py-3 font-mono font-bold text-indigo-600 dark:text-cyan-400">{sub.order_number}</td>
                                                <td className="py-3 font-semibold text-slate-900 dark:text-white">{sub.product?.name}</td>
                                                <td className="py-3">
                                                    <span className="font-bold">{currencySymbol}{sub.amount.toLocaleString()}</span>
                                                    <span className="text-[10px] text-slate-400 block capitalize">{sub.billing_cycle.replace('_', ' ')}</span>
                                                </td>
                                                <td className="py-3 text-xs">
                                                    <div className="font-mono text-slate-600 dark:text-slate-300 space-y-0.5">
                                                        <span className="text-[10px] text-slate-400 block truncate max-w-[160px]">
                                                            Req: {sub.domain || (sub.subdomain ? `${sub.subdomain}.codeventure.app` : 'None')}
                                                        </span>
                                                        {sub.status === 'active' && (sub.domain || sub.subdomain) && (
                                                            <span className="text-[9.5px] text-indigo-600 dark:text-cyan-400 font-semibold block truncate max-w-[160px]">
                                                                Live: {sub.domain || `${sub.subdomain}.codeventure.app`}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                        sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                                    }`}>
                                                        {sub.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-slate-400">
                                                    {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <Link
                                                        href={`/admin/subscriptions/${sub.id}`}
                                                        className="text-indigo-600 dark:text-cyan-400 font-bold hover:underline"
                                                    >
                                                        Manage
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination
                                currentPage={subsTable.currentPage}
                                totalPages={subsTable.totalPages}
                                total={subsTable.total}
                                from={subsTable.from}
                                to={subsTable.to}
                                onPageChange={subsTable.setCurrentPage}
                                itemLabel="subscriptions"
                            />
                        </>
                    )}
                </div>

                {/* Invoices Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-2">
                            <Receipt className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                Invoices & Payment Receipts ({customerInvs.length})
                            </h2>
                        </div>

                        {customerInvs.length > 0 && (
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

                    {customerInvs.length === 0 ? (
                        <div className="text-xs text-slate-400 py-4 text-center">No invoices recorded for this customer.</div>
                    ) : invsTable.paginatedData.length === 0 ? (
                        <div className="text-xs text-slate-400 py-4 text-center">No invoices matching &ldquo;{invsTable.search}&rdquo;</div>
                    ) : (
                        <>
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
                                            <th className="pb-3 text-right">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {invsTable.paginatedData.map((inv) => (
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
                                                <td className="py-3 text-right text-slate-400">{new Date(inv.created_at).toLocaleDateString()}</td>
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
        </AdminLayout>
    );
}
