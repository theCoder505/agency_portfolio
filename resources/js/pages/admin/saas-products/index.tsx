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
    X
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
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

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
                onSuccess: () => {
                    setSelectedIds((prev) => prev.filter((item) => item !== id));
                },
            });
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        const confirmed = await showConfirmDialog(
            'Delete Selected Products?',
            `Are you sure you want to delete ${selectedIds.length} SaaS products?`
        );
        if (confirmed) {
            router.post('/admin/saas-products/bulk-delete', { ids: selectedIds }, {
                preserveScroll: true,
                onSuccess: () => setSelectedIds([]),
            });
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedItems.length && paginatedItems.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedItems.map(p => p.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(item => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
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
                        {selectedIds.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete ({selectedIds.length})</span>
                            </button>
                        )}

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
                                        <th className="py-3 px-4 w-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.length === paginatedItems.length && paginatedItems.length > 0}
                                                onChange={toggleSelectAll}
                                                className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </th>
                                        <th className="py-3 px-4">Product Name</th>
                                        <th className="py-3 px-4">Tagline & Features</th>
                                        <th className="py-3 px-4">Monthly Plan</th>
                                        <th className="py-3 px-4">Half Yearly Plan</th>
                                        <th className="py-3 px-4">Yearly Plan</th>
                                        <th className="py-3 px-4">Active Subs</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {paginatedItems.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(product.id)}
                                                    onChange={() => toggleSelect(product.id)}
                                                    className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center space-x-3">
                                                    {product.thumbnail ? (
                                                        <img
                                                            src={product.thumbnail}
                                                            alt={product.name}
                                                            className="h-8 w-8 rounded-lg object-contain bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700"
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-cyan-400 font-bold flex items-center justify-center text-xs">
                                                            {product.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                                                            <span>{product.name}</span>
                                                            {product.badge && (
                                                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20">
                                                                    {product.badge}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 font-mono">/{product.slug}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 max-w-xs">
                                                <div className="text-slate-700 dark:text-slate-300 truncate">{product.tagline || '—'}</div>
                                                <div className="text-[10px] text-slate-400">
                                                    {Array.isArray(product.features) ? `${product.features.length} listed features` : '0 features'}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                                                {formatCurrency(product.monthly_price, product.currency || currencySymbol)}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                                                {formatCurrency(product.half_yearly_price, product.currency || currencySymbol)}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                                                {formatCurrency(product.yearly_price, product.currency || currencySymbol)}
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-cyan-400">
                                                {product.subscriptions_count || 0}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    product.is_active
                                                        ? 'bg-emerald-500/10 text-emerald-500'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                }`}>
                                                    {product.is_active ? 'Active' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end space-x-1.5">
                                                    <Link
                                                        href={`/admin/saas-products/${product.id}/edit`}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                        title="Edit Product"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                                        title="Delete Product"
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
                        itemLabel="products"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
