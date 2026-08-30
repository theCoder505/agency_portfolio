import React, { useState, useMemo } from 'react';
import { router, Link } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { Review, PaginatedData } from '@/types';
import { Plus, Edit, Trash2, Star, Search, ShieldCheck, Eye, EyeOff, X } from 'lucide-react';
import { confirmAction, showToast } from '@/lib/swal';
import { Pagination } from '@/components/ui/pagination';
import { useClientDataTable } from '@/hooks/use-client-data-table';

interface ReviewIndexProps {
    reviews: Review[] | PaginatedData<Review>;
}

export default function ReviewIndex({ reviews }: ReviewIndexProps) {
    const [source, setSource] = useState('all');

    const allReviewsList = useMemo(() => {
        return Array.isArray(reviews) ? reviews : reviews?.data || [];
    }, [reviews]);

    // Source filter
    const filteredBySource = useMemo(() => {
        if (source === 'all') return allReviewsList;
        return allReviewsList.filter((r) => r.source === source);
    }, [allReviewsList, source]);

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
    } = useClientDataTable<Review>({
        items: filteredBySource,
        pageSize: 10,
        searchFields: ['author_name', 'company', 'author_role', 'review_title', 'review_text', 'source'],
    });

    const handleSourceFilter = (newSource: string) => {
        setSource(newSource);
        setCurrentPage(1);
    };

    const handleToggleFeatured = (review: Review) => {
        router.post(`/admin/reviews/${review.id}/toggle-featured`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                showToast(`Review visibility updated!`, 'success');
            },
        });
    };

    const handleDelete = async (review: Review) => {
        const confirmed = await confirmAction({
            title: `Delete review by ${review.author_name}?`,
            text: 'This will remove the review from the Trustpilot carousel.',
            confirmButtonText: 'Yes, delete review',
        });

        if (confirmed) {
            router.delete(`/admin/reviews/${review.id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout
            title="Manage Reviews & Trustpilot"
            breadcrumbs={[{ title: 'Reviews' }]}
        >
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Client Reviews & Testimonials
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Manage Trustpilot verified reviews and testimonials for the homepage carousel.
                        </p>
                    </div>

                    <Link
                        href="/admin/reviews/create"
                        className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Review</span>
                    </Link>
                </div>

                {/* Filters & Search Bar */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                    <form onSubmit={handleImmediateSearch} className="relative w-full sm:w-80">
                        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search author, company, review text..."
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

                    <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs self-stretch sm:self-auto justify-center">
                        {['all', 'trustpilot', 'clutch', 'google', 'direct'].map((st) => (
                            <button
                                key={st}
                                onClick={() => handleSourceFilter(st)}
                                className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                                    source === st
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
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Author & Client</th>
                                <th className="p-4">Rating</th>
                                <th className="p-4">Review Title & Text</th>
                                <th className="p-4">Source</th>
                                <th className="p-4">Featured</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {paginatedItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-slate-400">
                                        No reviews found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedItems.map((review) => (
                                    <tr key={review.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-9 w-9 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
                                                    {review.author_avatar ? (
                                                        <img src={review.author_avatar} alt={review.author_name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center font-bold text-slate-600">
                                                            {review.author_name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                                                        {review.author_name}
                                                    </div>
                                                    <div className="text-slate-500 text-[10px]">
                                                        {review.author_role} {review.company ? `• ${review.company}` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center space-x-1">
                                                {[...Array(review.rating)].map((_, i) => (
                                                    <div key={i} className="h-3.5 w-3.5 bg-emerald-500 rounded-sm flex items-center justify-center text-[9px] text-white">
                                                        ★
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 max-w-sm">
                                            <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                                                "{review.review_title}"
                                            </div>
                                            <p className="text-slate-500 text-xs line-clamp-2 mt-0.5">
                                                {review.review_text}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px]">
                                                {review.source}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleFeatured(review)}
                                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1.5 transition-all ${
                                                    review.is_featured
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                                }`}
                                                title={review.is_featured ? 'Click to hide from frontend showcase' : 'Click to show on frontend showcase'}
                                            >
                                                {review.is_featured ? (
                                                    <>
                                                        <Eye className="h-3 w-3" />
                                                        <span>Showcase Active</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff className="h-3 w-3" />
                                                        <span>Hidden (Disabled)</span>
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={`/admin/reviews/${review.id}/edit`}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    title="Edit Review"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(review)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                                    title="Delete Review"
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
                        itemLabel="reviews"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
