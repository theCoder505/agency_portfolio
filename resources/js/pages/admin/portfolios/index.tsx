import React, { useState, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { Category, Portfolio, PaginatedData } from '@/types';
import { DateRangeFilter } from '@/components/admin/date-range-filter';
import { Pagination } from '@/components/ui/pagination';
import { useClientDataTable } from '@/hooks/use-client-data-table';
import {
    Plus,
    Search,
    Trash2,
    Edit,
    ExternalLink,
    Layers,
    Eye,
    Star,
    Check,
    X,
    Filter,
    Play
} from 'lucide-react';
import { confirmAction, showToast } from '@/lib/swal';

interface PortfolioIndexProps {
    portfolios: Portfolio[] | PaginatedData<Portfolio>;
    categories: Category[];
}

export default function PortfolioIndex({ portfolios, categories }: PortfolioIndexProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [categoryId, setCategoryId] = useState('all');
    const [itemType, setItemType] = useState('all');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const allPortfoliosList = useMemo(() => {
        return Array.isArray(portfolios) ? portfolios : portfolios?.data || [];
    }, [portfolios]);

    // Multi-criteria filter for category, itemType, and date range
    const filteredByFilters = useMemo(() => {
        return allPortfoliosList.filter((item) => {
            if (categoryId !== 'all' && String(item.category_id) !== String(categoryId)) {
                return false;
            }
            if (itemType !== 'all' && item.item_type !== itemType) {
                return false;
            }
            if (fromDate && toDate && item.created_at) {
                const itemDate = new Date(item.created_at).getTime();
                const start = new Date(fromDate + ' 00:00:00').getTime();
                const end = new Date(toDate + ' 23:59:59').getTime();
                if (itemDate < start || itemDate > end) return false;
            }
            return true;
        });
    }, [allPortfoliosList, categoryId, itemType, fromDate, toDate]);

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
    } = useClientDataTable<Portfolio>({
        items: filteredByFilters,
        pageSize: 10,
        searchFields: ['title', 'client_name', 'short_description', 'category.name', 'tech_stacks'],
    });

    const handleCategoryChange = (cat: string) => {
        setCategoryId(cat);
        setCurrentPage(1);
    };

    const handleItemTypeChange = (type: string) => {
        setItemType(type);
        setCurrentPage(1);
    };

    const handleDateApply = (fromVal: string, toVal: string) => {
        setFromDate(fromVal);
        setToDate(toVal);
        setCurrentPage(1);
    };

    const handleDateClear = () => {
        setFromDate('');
        setToDate('');
        setCurrentPage(1);
    };

    // Toggle single selection
    const toggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Select all on current page
    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedItems.length && paginatedItems.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedItems.map((p) => p.id));
        }
    };

    // Single Delete
    const handleDelete = async (portfolio: Portfolio) => {
        const confirmed = await confirmAction({
            title: `Delete "${portfolio.title}"?`,
            text: 'This will permanently remove the project and its associated visitor analytics.',
            confirmButtonText: 'Yes, delete project',
        });

        if (confirmed) {
            router.delete(`/admin/portfolios/${portfolio.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds((prev) => prev.filter((id) => id !== portfolio.id));
                },
            });
        }
    };

    // Bulk Delete
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        const confirmed = await confirmAction({
            title: `Delete ${selectedIds.length} Selected Projects?`,
            text: 'Are you sure you want to delete the selected items?',
            confirmButtonText: `Delete ${selectedIds.length} Projects`,
        });

        if (confirmed) {
            router.post(
                '/admin/portfolios/bulk-delete',
                { ids: selectedIds },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSelectedIds([]);
                    },
                }
            );
        }
    };

    return (
        <AdminLayout
            title="Manage Portfolios & Products"
            breadcrumbs={[{ title: 'Portfolios' }]}
        >
            <div className="space-y-6">
                {/* Header with Title and Add CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Portfolios & Product Showcase
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Manage direct-link and deep in-app case studies. Track visit frequencies.
                        </p>
                    </div>

                    <Link
                        href="/admin/portfolios/create"
                        className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Create New Project</span>
                    </Link>
                </div>

                {/* Filter and Bulk Action Toolbar */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Search */}
                        <form onSubmit={handleImmediateSearch} className="flex items-center relative w-full sm:w-72">
                            <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search projects..."
                                className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </form>

                        {/* Category & Type Selectors */}
                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                value={categoryId ?? 'all'}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold"
                            >
                                <option value="all">All Categories</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={itemType ?? 'all'}
                                onChange={(e) => handleItemTypeChange(e.target.value)}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold"
                            >
                                <option value="all">All Item Types</option>
                                <option value="in_app_link">In-App Case Study</option>
                                <option value="direct_link">Direct Live Link</option>
                            </select>

                            {/* Date Filter */}
                            <DateRangeFilter
                                fromDate={fromDate}
                                toDate={toDate}
                                onApply={handleDateApply}
                                onClear={handleDateClear}
                            />
                        </div>
                    </div>

                    {/* Bulk Selection Bar */}
                    {selectedIds.length > 0 && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-xs animate-in fade-in">
                            <span className="font-bold text-indigo-900 dark:text-indigo-200">
                                {selectedIds.length} project(s) selected
                            </span>
                            <button
                                onClick={handleBulkDelete}
                                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Bulk Delete</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Data Table */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === paginatedItems.length && paginatedItems.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </th>
                                    <th className="p-4">Project</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Item Type</th>
                                    <th className="p-4">Tracked Visits</th>
                                    <th className="p-4">Featured</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {paginatedItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-slate-400">
                                            No portfolio products found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedItems.map((portfolio) => {
                                        const isSelected = selectedIds.includes(portfolio.id);
                                        const isDirect = portfolio.item_type === 'direct_link';

                                        return (
                                            <tr
                                                key={portfolio.id}
                                                className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                                                    isSelected ? 'bg-indigo-50/60 dark:bg-indigo-950/40' : ''
                                                }`}
                                            >
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelect(portfolio.id)}
                                                        className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                </td>

                                                {/* Thumbnail & Title */}
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-12 w-16 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                                                            {portfolio.thumbnail ? (
                                                                <img
                                                                    src={portfolio.thumbnail}
                                                                    alt={portfolio.title}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-[9px] text-slate-500">
                                                                    No img
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 dark:text-white text-sm">
                                                                {portfolio.title}
                                                            </div>
                                                            <div className="text-[11px] text-slate-400">
                                                                {portfolio.client_name || 'Internal Product'} • {portfolio.completion_date || '2026'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Category */}
                                                <td className="p-4">
                                                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                                                        {portfolio.category?.name || 'Uncategorized'}
                                                    </span>
                                                </td>

                                                {/* Item Type */}
                                                <td className="p-4">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                                            isDirect
                                                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                                                : 'bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20'
                                                        }`}
                                                    >
                                                        {isDirect ? 'Direct Link' : 'In-App Link'}
                                                    </span>
                                                </td>

                                                {/* Views Count */}
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-1 font-bold text-cyan-600 dark:text-cyan-400">
                                                        <Eye className="h-3.5 w-3.5" />
                                                        <span>{portfolio.views_count.toLocaleString()}</span>
                                                    </div>
                                                </td>

                                                {/* Featured */}
                                                <td className="p-4">
                                                    {portfolio.is_featured ? (
                                                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold text-[10px] flex items-center space-x-1 w-max">
                                                            <Star className="h-3 w-3 fill-current" />
                                                            <span>Featured</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 text-[11px]">—</span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <a
                                                            href={isDirect ? portfolio.direct_url || '#' : `/works/${portfolio.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                            title="Preview Project"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                        </a>

                                                        <Link
                                                            href={`/admin/portfolios/${portfolio.id}/edit`}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                            title="Edit Project"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Link>

                                                        <button
                                                            onClick={() => handleDelete(portfolio)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                                            title="Delete Project"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        from={from}
                        to={to}
                        total={totalItems}
                        currentPage={currentPage}
                        lastPage={totalPages}
                        onPageChange={setCurrentPage}
                        itemLabel="projects"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
