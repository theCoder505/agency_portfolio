import React, { useState } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { Blog, Category, PaginatedData } from '@/types';
import { DateRangeFilter } from '@/components/admin/date-range-filter';
import {
    BookOpen,
    Plus,
    Search,
    Trash2,
    Edit3,
    ExternalLink,
    Eye,
    Star,
    CheckCircle2,
    Clock,
    Filter,
    RotateCcw,
    Sparkles,
    Calendar,
    User,
    Tag
} from 'lucide-react';
import { showConfirmDialog, showSuccessAlert, showErrorAlert } from '@/lib/swal';

interface BlogIndexProps {
    blogs: PaginatedData<Blog>;
    categories: Category[];
    filters: {
        search?: string;
        category_id?: string;
        status?: string;
        from_date?: string;
        to_date?: string;
    };
}

export default function BlogIndex({ blogs, categories, filters }: BlogIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/admin/blogs',
            {
                search: search || undefined,
                category_id: categoryId !== 'all' ? categoryId : undefined,
                status: status !== 'all' ? status : undefined,
                from_date: fromDate || undefined,
                to_date: toDate || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setCategoryId('all');
        setStatus('all');
        setFromDate('');
        setToDate('');
        router.get('/admin/blogs', {}, { preserveState: true, replace: true });
    };

    const handleDateChange = (from: string, to: string) => {
        setFromDate(from);
        setToDate(to);
        router.get(
            '/admin/blogs',
            {
                search: search || undefined,
                category_id: categoryId !== 'all' ? categoryId : undefined,
                status: status !== 'all' ? status : undefined,
                from_date: from || undefined,
                to_date: to || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(blogs.data.map((b) => b.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((item) => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleDelete = async (id: number, title: string) => {
        const confirmed = await showConfirmDialog(
            'Delete Blog Article?',
            `Are you sure you want to delete "${title}"? This action cannot be undone.`,
            'Yes, Delete'
        );

        if (confirmed) {
            router.delete(`/admin/blogs/${id}`, {
                onSuccess: () => setSelectedIds((prev) => prev.filter((item) => item !== id)),
            });
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        const confirmed = await showConfirmDialog(
            'Delete Selected Blogs?',
            `Are you sure you want to delete ${selectedIds.length} selected articles?`,
            'Yes, Delete All'
        );

        if (confirmed) {
            router.post(
                '/admin/blogs/bulk-delete',
                { ids: selectedIds },
                {
                    onSuccess: () => setSelectedIds([]),
                }
            );
        }
    };

    const totalReads = blogs.data.reduce((acc, b) => acc + (b.reads_count || 0), 0);

    return (
        <AdminLayout
            title="Blogs & Articles Management"
            breadcrumbs={[{ title: 'Blogs & Articles' }]}
        >
            <div className="space-y-6">
                {/* Header Summary & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
                            <BookOpen className="h-7 w-7 text-indigo-600 dark:text-cyan-400" />
                            <span>Blogs & Articles</span>
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Publish articles, edit rich content, customize tags, and monitor total readership metrics.
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Quick Stats Pill */}
                        <div className="hidden sm:flex items-center space-x-3 px-3.5 py-1.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 text-xs">
                            <div className="flex items-center space-x-1.5 text-indigo-700 dark:text-indigo-300 font-semibold">
                                <Eye className="h-4 w-4" />
                                <span>Page Total Reads:</span>
                                <span className="font-bold text-indigo-900 dark:text-indigo-100">{totalReads.toLocaleString()}</span>
                            </div>
                        </div>

                        <Link
                            href="/admin/blogs/create"
                            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Create Article</span>
                        </Link>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                        {/* Search Input */}
                        <div className="lg:col-span-4 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search by title, author, or keywords..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="lg:col-span-3">
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">All Categories</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="lg:col-span-2">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">All Statuses</option>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                                <option value="featured">Featured Only</option>
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="lg:col-span-3 flex items-center space-x-2">
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl transition-all"
                            >
                                Apply Filters
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
                                title="Reset Filters"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </button>
                        </div>
                    </form>

                    {/* Date Range Picker */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <DateRangeFilter
                            fromDate={fromDate}
                            toDate={toDate}
                            onChange={handleDateChange}
                        />
                    </div>
                </div>

                {/* Bulk Actions Floating Toolbar */}
                {selectedIds.length > 0 && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center justify-between animate-in fade-in">
                        <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                            {selectedIds.length} article(s) selected
                        </span>
                        <button
                            type="button"
                            onClick={handleBulkDelete}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow transition-all"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Bulk Delete</span>
                        </button>
                    </div>
                )}

                {/* Blogs Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-4 w-10">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={
                                                blogs.data.length > 0 &&
                                                selectedIds.length === blogs.data.length
                                            }
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                        />
                                    </th>
                                    <th className="p-4">Article</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Author</th>
                                    {/* Prominently Highlight Reads Count */}
                                    <th className="p-4 text-center">
                                        <span className="inline-flex items-center space-x-1 text-indigo-600 dark:text-cyan-400">
                                            <Eye className="h-3.5 w-3.5" />
                                            <span>Reads Count</span>
                                        </span>
                                    </th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4">Published</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {blogs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
                                            <BookOpen className="h-10 w-10 mx-auto text-slate-400 mb-2 opacity-50" />
                                            <p className="font-semibold">No blog articles found.</p>
                                            <p className="text-xs mt-1">Try adjusting your filters or create your first post.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    blogs.data.map((blog) => (
                                        <tr
                                            key={blog.id}
                                            className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                                        >
                                            {/* Select Checkbox */}
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(blog.id)}
                                                    onChange={() => handleSelectOne(blog.id)}
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                                />
                                            </td>

                                            {/* Thumbnail & Title */}
                                            <td className="p-4">
                                                <div className="flex items-center space-x-3.5">
                                                    <div className="h-14 w-20 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                                                        {blog.thumbnail ? (
                                                            <img
                                                                src={blog.thumbnail}
                                                                alt={blog.title}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">
                                                                No Image
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 max-w-sm">
                                                        <div className="flex items-center space-x-1.5">
                                                            {blog.is_featured && (
                                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                                    Featured
                                                                </span>
                                                            )}
                                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                                {blog.title}
                                                            </h3>
                                                        </div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                                            /blogs/{blog.slug}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="p-4 whitespace-nowrap">
                                                {blog.category ? (
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                                                        {blog.category.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </td>

                                            {/* Author */}
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    {blog.author_avatar ? (
                                                        <img
                                                            src={blog.author_avatar}
                                                            alt={blog.author_name || 'Author'}
                                                            className="h-6 w-6 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                                            {blog.author_name ? blog.author_name.charAt(0) : 'A'}
                                                        </div>
                                                    )}
                                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                        {blog.author_name || 'Editorial Team'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* READS COUNT (PROMINENT BADGE) */}
                                            <td className="p-4 text-center whitespace-nowrap">
                                                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 font-mono text-xs font-bold shadow-xs">
                                                    <Eye className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                                                    <span>{(blog.reads_count || 0).toLocaleString()}</span>
                                                    <span className="text-[10px] text-cyan-500 font-normal">reads</span>
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="p-4 text-center whitespace-nowrap">
                                                {blog.is_published ? (
                                                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        <span>Published</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                                                        <Clock className="h-3 w-3" />
                                                        <span>Draft</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Published Date */}
                                            <td className="p-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                                                {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : new Date(blog.created_at).toLocaleDateString()}
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 text-right whitespace-nowrap">
                                                <div className="inline-flex items-center space-x-1.5">
                                                    <a
                                                        href={`/blogs/${blog.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-cyan-400 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
                                                        title="View Live on Surface"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                    <Link
                                                        href={`/admin/blogs/${blog.id}/edit`}
                                                        className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
                                                        title="Edit Article"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(blog.id, blog.title)}
                                                        className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
                                                        title="Delete Article"
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
                    </div>

                    {/* Pagination Links */}
                    {blogs.links && blogs.links.length > 3 && (
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Showing {blogs.from || 0} to {blogs.to || 0} of {blogs.total} articles
                            </span>
                            <div className="flex items-center space-x-1">
                                {blogs.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveScroll
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                                            link.active
                                                ? 'bg-indigo-600 text-white'
                                                : link.url
                                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                : 'text-slate-400 pointer-events-none'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
