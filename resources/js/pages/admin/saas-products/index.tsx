import React, { useState } from 'react';
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
    Sparkles
} from 'lucide-react';
import { showConfirmDialog, showToast } from '@/lib/swal';

interface SaasProductsIndexProps {
    products: PaginatedData<SaasProduct>;
    filters: {
        search: string;
        status: string;
    };
    currencySymbol: string;
}

export default function SaasProductsIndex({
    products,
    filters,
    currencySymbol,
}: SaasProductsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/saas-products', { search, status }, { preserveState: true });
    };

    const handleStatusFilter = (newStatus: string) => {
        setStatus(newStatus);
        router.get('/admin/saas-products', { search, status: newStatus }, { preserveState: true });
    };

    const handleDelete = (id: number, name: string) => {
        showConfirmDialog(
            'Delete SaaS Product?',
            `Are you sure you want to delete "${name}"? This action cannot be undone.`
        ).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/saas-products/${id}`);
            }
        });
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;

        showConfirmDialog(
            'Delete Selected Products?',
            `Are you sure you want to delete ${selectedIds.length} SaaS products?`
        ).then((result) => {
            if (result.isConfirmed) {
                router.post('/admin/saas-products/bulk-delete', { ids: selectedIds }, {
                    onSuccess: () => setSelectedIds([]),
                });
            }
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === products.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(products.data.map(p => p.id));
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
                    <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                        />
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
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
                    {products.data.length === 0 ? (
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
                                                checked={selectedIds.length === products.data.length && products.data.length > 0}
                                                onChange={toggleSelectAll}
                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </th>
                                        <th className="py-3 px-4">Product Name & Tagline</th>
                                        <th className="py-3 px-4">Monthly Price</th>
                                        <th className="py-3 px-4">6-Month Price</th>
                                        <th className="py-3 px-4">Yearly Price</th>
                                        <th className="py-3 px-4">Active Orders</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {products.data.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(product.id)}
                                                    onChange={() => toggleSelect(product.id)}
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold shrink-0">
                                                        <Package className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-1.5">
                                                            <span className="font-bold text-slate-900 dark:text-white">{product.name}</span>
                                                            {product.badge && (
                                                                <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 text-[9px] font-bold">
                                                                    {product.badge}
                                                                </span>
                                                            )}
                                                            {product.is_featured && (
                                                                <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 text-[9px] font-bold">
                                                                    Featured
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 line-clamp-1">{product.tagline || product.slug}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                                                {currencySymbol}{product.monthly_price.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                                                {currencySymbol}{product.half_yearly_price.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                                                {currencySymbol}{product.yearly_price.toLocaleString()}
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
                </div>
            </div>
        </AdminLayout>
    );
}
