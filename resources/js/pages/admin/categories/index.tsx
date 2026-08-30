import React, { useState, useMemo } from 'react';
import { router, Link } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { Category, PaginatedData } from '@/types';
import { Plus, Edit, Trash2, FolderTree, Search, Check, X, Layers } from 'lucide-react';
import { confirmAction } from '@/lib/swal';
import { Pagination } from '@/components/ui/pagination';
import { useClientDataTable } from '@/hooks/use-client-data-table';

interface CategoryIndexProps {
    categories: Category[] | PaginatedData<Category>;
}

export default function CategoryIndex({ categories }: CategoryIndexProps) {
    const allCategoriesList = useMemo(() => {
        return Array.isArray(categories) ? categories : categories?.data || [];
    }, [categories]);

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
    } = useClientDataTable<Category>({
        items: allCategoriesList,
        pageSize: 10,
        searchFields: ['name', 'slug', 'description'],
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const [formName, setFormName] = useState('');
    const [formSlug, setFormSlug] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formOrder, setFormOrder] = useState(0);
    const [formIsActive, setFormIsActive] = useState(true);

    const openCreateModal = () => {
        setEditingCategory(null);
        setFormName('');
        setFormSlug('');
        setFormDescription('');
        setFormOrder(0);
        setFormIsActive(true);
        setIsModalOpen(true);
    };

    const openEditModal = (cat: Category) => {
        setEditingCategory(cat);
        setFormName(cat.name);
        setFormSlug(cat.slug);
        setFormDescription(cat.description || '');
        setFormOrder(cat.order);
        setFormIsActive(cat.is_active);
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name: formName,
            slug: formSlug,
            description: formDescription,
            order: formOrder,
            is_active: formIsActive,
        };

        if (editingCategory) {
            router.put(`/admin/categories/${editingCategory.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            router.post('/admin/categories', payload, {
                preserveScroll: true,
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const handleDelete = async (cat: Category) => {
        const confirmed = await confirmAction({
            title: `Delete Category "${cat.name}"?`,
            text: 'Portfolios assigned to this category will become uncategorized.',
            confirmButtonText: 'Yes, delete category',
        });

        if (confirmed) {
            router.delete(`/admin/categories/${cat.id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout
            title="Manage Categories"
            breadcrumbs={[{ title: 'Categories' }]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Portfolio Categories
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Organize products and portfolio works into clean filtering categories.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Category</span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <form onSubmit={handleImmediateSearch} className="relative w-full sm:w-80">
                        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search categories..."
                            className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
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
                </div>

                {/* Table */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Slug</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Projects Count</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {paginatedItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-slate-400">
                                        No categories found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedItems.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="p-4 font-bold text-slate-900 dark:text-white text-sm">
                                            {cat.name}
                                        </td>
                                        <td className="p-4 font-mono text-slate-400 text-xs">
                                            {cat.slug}
                                        </td>
                                        <td className="p-4 text-slate-500 max-w-xs truncate">
                                            {cat.description || '—'}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-cyan-400 font-bold text-xs">
                                                {cat.portfolios_count ?? 0} projects
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {cat.is_active ? (
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 font-bold text-[10px]">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => openEditModal(cat)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    title="Edit Category"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                                    title="Delete Category"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <Pagination
                        from={from}
                        to={to}
                        total={totalItems}
                        currentPage={currentPage}
                        lastPage={totalPages}
                        onPageChange={setCurrentPage}
                        itemLabel="categories"
                    />
                </div>
            </div>

            {/* Create / Edit Category Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                {editingCategory ? 'Edit Category' : 'Create New Category'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="e.g. Fintech, Healthcare, E-Commerce"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    URL Slug (Leave blank to auto-generate)
                                </label>
                                <input
                                    type="text"
                                    value={formSlug}
                                    onChange={(e) => setFormSlug(e.target.value)}
                                    placeholder="e.g. fintech"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    placeholder="Short summary of this portfolio category..."
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex items-center space-x-6">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={formOrder}
                                        onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                                        className="w-24 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer mt-5">
                                    <input
                                        type="checkbox"
                                        checked={formIsActive}
                                        onChange={(e) => setFormIsActive(e.target.checked)}
                                        className="rounded border-slate-300 dark:border-slate-700 text-indigo-600"
                                    />
                                    <span>Active</span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md"
                                >
                                    Save Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
