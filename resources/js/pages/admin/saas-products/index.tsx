import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { PaginatedData, SaasProduct } from '@/types';
import {
    Package,
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    CheckCircle2,
    XCircle,
    Star,
    Layers,
    Sparkles,
    X,
    ExternalLink
} from 'lucide-react';
import { showConfirmDialog, showToast } from '@/lib/swal';
import { formatCurrency } from '@/lib/formatters';
import { Pagination } from '@/components/ui/pagination';
import { useClientDataTable } from '@/hooks/use-client-data-table';

interface SaasProductsIndexProps {
    products: SaasProduct[] | PaginatedData<SaasProduct>;
    currencySymbol?: string;
}

export default function SaasProductsIndex({
    products,
    currencySymbol = '৳',
}: SaasProductsIndexProps) {
    const [status, setStatus] = useState('all');

    const allProductsList = useMemo(() => {
        return Array.isArray(products) ? products : products?.data || [];
    }, [products]);

    // Status filter
    const filteredByStatus = useMemo(() => {
        if (status === 'active') return allProductsList.filter(p => p.is_active);
        if (status === 'inactive') return allProductsList.filter(p => !p.is_active);
        return allProductsList;
    }, [allProductsList, status]);

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
    } = useClientDataTable<SaasProduct>({
        items: filteredByStatus,
        pageSize: 10,
        searchFields: ['name', 'slug', 'tagline', 'badge'],
    });

    const handleStatusFilter = (newStatus: string) => {
        setStatus(newStatus);
        setCurrentPage(1);
    };

    const handleDelete = async (id: number, name: string) => {
        const confirmed = await showConfirmDialog(
            'Delete SaaS Product?',
            `Are you sure you want to delete "${name}"? This action cannot be undone.`
        );
        if (confirmed) {
            router.delete(`/admin/saas-products/${id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout
            title="SaaS Products"
            breadcrumbs={[{ title: 'SaaS Products' }]}
        >
            <div className="space-y-6">
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            SaaS Products & Services
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Manage software catalog, monthly, half-yearly, and yearly subscription pricing plans.
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Link
                            href="/admin/saas-products/create"
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add SaaS Product</span>
                        </Link>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <form onSubmit={handleImmediateSearch} className="relative w-full sm:w-80">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products..."
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

                    <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs self-stretch sm:self-auto justify-center">
                        {['all', 'active', 'inactive'].map((st) => (
                            <button
                                key={st}
                                onClick={() => handleStatusFilter(st)}
                                className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${status === st
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Table Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                    {paginatedItems.length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                            <Package className="h-10 w-10 text-slate-400 mx-auto" />
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No SaaS products found</h3>
                            <p className="text-xs text-slate-400">Get started by adding your first subscription package.</p>
                            <Link
                                href="/admin/saas-products/create"
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Create Product</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-slate-50/70 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                                        <th className="py-4 px-6">Product Details</th>
                                        <th className="py-4 px-6">Tagline & Summary</th>
                                        <th className="py-4 px-6 text-center">Active Subs</th>
                                        <th className="py-4 px-6 text-center">Status</th>
                                        <th className="py-4 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {paginatedItems.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                            {/* Main Product Image & Title (NO /slug) */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-3.5">
                                                    <div className="h-12 w-16 sm:h-14 sm:w-20 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800 shadow-2xs relative group">
                                                        {product.thumbnail ? (
                                                            <img
                                                                src={product.thumbnail}
                                                                alt={product.name}
                                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-cyan-400">
                                                                <Package className="h-5 w-5 opacity-60" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            <Link
                                                                href={`/admin/saas-products/${product.id}/edit`}
                                                                className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-cyan-400 text-sm transition-colors"
                                                            >
                                                                {product.name}
                                                            </Link>
                                                        </div>
                                                        <div className="text-[11px] text-slate-400">
                                                            Display Order: #{product.order ?? 0}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Tagline & Features summary */}
                                            <td className="py-4 px-5 max-w-sm">
                                                <div className="text-slate-800 dark:text-slate-200 text-xs font-medium line-clamp-1">
                                                    {product.tagline || 'No tagline specified'}
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">
                                                    {Array.isArray(product.features) ? `${product.features.length} listed capabilities` : '0 capabilities'}
                                                </div>
                                            </td>

                                            {/* Active Subscriptions Count */}
                                            <td className="py-4 px-6 text-center">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-cyan-400 font-black text-xs border border-indigo-200/60 dark:border-indigo-800/60">
                                                    {product.subscriptions_count || 0}
                                                </span>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${product.is_active
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                                    }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${product.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                    <span>{product.is_active ? 'Active' : 'Draft'}</span>
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <a
                                                        href={`/saas-products/${product.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 dark:hover:text-cyan-400 transition-all"
                                                        title="Open / View on Live Site"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                    <Link
                                                        href={`/admin/saas-products/${product.id}/edit`}
                                                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 dark:hover:text-cyan-400 transition-all"
                                                        title="Edit Product"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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
                        itemLabel="products"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
