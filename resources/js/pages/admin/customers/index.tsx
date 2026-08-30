import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { PaginatedData, User } from '@/types';
import {
    UserCheck,
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    Layers,
    Receipt,
    Mail,
    Phone,
    Building2,
    X
} from 'lucide-react';
import { showConfirmDialog } from '@/lib/swal';
import { Pagination } from '@/components/ui/pagination';
import { useClientDataTable } from '@/hooks/use-client-data-table';

interface CustomersIndexProps {
    customers: User[] | PaginatedData<User>;
}

export default function CustomersIndex({ customers }: CustomersIndexProps) {
    const [status, setStatus] = useState('all');

    const allCustomersList = useMemo(() => {
        return Array.isArray(customers) ? customers : customers?.data || [];
    }, [customers]);

    // Status filter
    const filteredByStatus = useMemo(() => {
        if (status === 'all') return allCustomersList;
        return allCustomersList.filter((c) => c.status === status);
    }, [allCustomersList, status]);

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
    } = useClientDataTable<User>({
        items: filteredByStatus,
        pageSize: 15,
        searchFields: ['name', 'email', 'phone', 'company_name', 'username'],
    });

    const handleStatusFilter = (newStatus: string) => {
        setStatus(newStatus);
        setCurrentPage(1);
    };

    const handleDelete = async (id: number, name: string) => {
        const confirmed = await showConfirmDialog(
            'Delete Customer Account?',
            `Are you sure you want to delete "${name}"? All associated subscriptions and invoices will also be removed.`
        );
        if (confirmed) {
            router.delete(`/admin/customers/${id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout
            title="Registered Customers"
            breadcrumbs={[{ title: 'Customers' }]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            Registered Customers & Accounts
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Manage client profiles, create customer logins, and review individual subscription portfolios.
                        </p>
                    </div>

                    <Link
                        href="/admin/customers/create"
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all self-start sm:self-auto"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Customer Account</span>
                    </Link>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <form onSubmit={handleImmediateSearch} className="relative w-full sm:w-80">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, phone, company..."
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

                    <div className="flex items-center space-x-1 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs self-stretch sm:self-auto justify-center">
                        {['all', 'active', 'suspended'].map((st) => (
                            <button
                                key={st}
                                onClick={() => handleStatusFilter(st)}
                                className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                                    status === st
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                    {paginatedItems.length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                            <UserCheck className="h-10 w-10 text-slate-400 mx-auto" />
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No customers found</h3>
                            <p className="text-xs text-slate-400">Add customers or try changing your search filter.</p>
                            <Link
                                href="/admin/customers/create"
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Create Customer</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-slate-50/70 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                                        <th className="py-3.5 px-4">Customer Name</th>
                                        <th className="py-3.5 px-4">Contact Info</th>
                                        <th className="py-3.5 px-4">Company</th>
                                        <th className="py-3.5 px-4">Subscriptions</th>
                                        <th className="py-3.5 px-4">Invoices</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4">Joined Date</th>
                                        <th className="py-3.5 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {paginatedItems.map((c) => (
                                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                                                        {c.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                                                        <div className="text-[11px] text-slate-400">ID #{c.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="text-slate-800 dark:text-slate-200">{c.email}</div>
                                                <div className="text-[11px] text-slate-400">{c.phone || 'No phone'}</div>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                                                {c.company_name || 'Individual'}
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-cyan-400">
                                                {c.subscriptions_count || 0} packages
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400">
                                                {c.invoices_count || 0} invoices
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                    c.status === 'active'
                                                        ? 'bg-emerald-500/10 text-emerald-500'
                                                        : 'bg-rose-500/10 text-rose-500'
                                                }`}>
                                                    {c.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-400">
                                                {new Date(c.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end space-x-1.5">
                                                    <Link
                                                        href={`/admin/customers/${c.id}`}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                        title="View History & Orders"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Link>

                                                    <Link
                                                        href={`/admin/customers/${c.id}/edit`}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                        title="Edit Customer"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Link>

                                                    <button
                                                        onClick={() => handleDelete(c.id, c.name)}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                                        title="Delete Customer"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
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
                        itemLabel="customers"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
