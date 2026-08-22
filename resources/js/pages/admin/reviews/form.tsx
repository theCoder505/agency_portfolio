import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { Review } from '@/types';
import { ImageUploader } from '@/components/admin/image-uploader';
import { ArrowLeft, Save, Star } from 'lucide-react';

interface ReviewFormProps {
    review: Review | null;
}

export default function ReviewForm({ review }: ReviewFormProps) {
    const isEdit = Boolean(review);

    const [authorName, setAuthorName] = useState(review?.author_name || '');
    const [authorRole, setAuthorRole] = useState(review?.author_role || '');
    const [company, setCompany] = useState(review?.company || '');
    const [rating, setRating] = useState(review?.rating || 5);
    const [reviewTitle, setReviewTitle] = useState(review?.review_title || '');
    const [reviewText, setReviewText] = useState(review?.review_text || '');
    const [source, setSource] = useState(review?.source || 'trustpilot');
    const [reviewDate, setReviewDate] = useState(review?.review_date || '');
    const [verifiedPurchase, setVerifiedPurchase] = useState(review ? review.verified_purchase : true);
    const [isFeatured, setIsFeatured] = useState(review ? review.is_featured : true);

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [existingAvatar, setExistingAvatar] = useState<string | null>(review?.author_avatar || null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('author_name', authorName);
        formData.append('author_role', authorRole);
        formData.append('company', company);
        formData.append('rating', String(rating));
        formData.append('review_title', reviewTitle);
        formData.append('review_text', reviewText);
        formData.append('source', source);
        formData.append('review_date', reviewDate);
        formData.append('verified_purchase', verifiedPurchase ? '1' : '0');
        formData.append('is_featured', isFeatured ? '1' : '0');

        if (avatarFile) {
            formData.append('author_avatar', avatarFile);
        }

        if (isEdit && review) {
            formData.append('_method', 'PUT');
            router.post(`/admin/reviews/${review.id}`, formData, {
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post('/admin/reviews', formData, {
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    return (
        <AdminLayout
            title={isEdit ? `Edit Review from ${review?.author_name}` : 'New Review / Testimonial'}
            breadcrumbs={[
                { title: 'Reviews', href: '/admin/reviews' },
                { title: isEdit ? 'Edit' : 'Create' },
            ]}
        >
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href="/admin/reviews"
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Reviews List</span>
                    </Link>

                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                        {isEdit ? 'Edit Review' : 'Create New Review'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Author Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    placeholder="e.g. David Thorne"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Author Role / Title</label>
                                <input
                                    type="text"
                                    value={authorRole}
                                    onChange={(e) => setAuthorRole(e.target.value)}
                                    placeholder="e.g. CTO"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Company Name</label>
                                <input
                                    type="text"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    placeholder="e.g. NexusCloud Inc."
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Star Rating (1 to 5) *</label>
                                <select
                                    value={rating}
                                    onChange={(e) => setRating(Number(e.target.value))}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                                >
                                    <option value={5}>★★★★★ (5 Stars - Excellent)</option>
                                    <option value={4}>★★★★☆ (4 Stars - Great)</option>
                                    <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                                    <option value={2}>★★☆☆☆ (2 Stars - Poor)</option>
                                    <option value={1}>★☆☆☆☆ (1 Star - Bad)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Review Headline / Title *</label>
                            <input
                                type="text"
                                required
                                value={reviewTitle}
                                onChange={(e) => setReviewTitle(e.target.value)}
                                placeholder="e.g. Transformed our SaaS architecture beyond expectations!"
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Review Quote Text *</label>
                            <textarea
                                required
                                rows={4}
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Detailed feedback quote from client..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                            />
                        </div>

                        {/* Author Avatar with Live Preview */}
                        <ImageUploader
                            label="Author Avatar Photo (Live Preview)"
                            multiple={false}
                            existingImages={existingAvatar}
                            onChange={(file) => setAvatarFile(file instanceof File ? file : null)}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Source Platform</label>
                                <select
                                    value={source}
                                    onChange={(e) => setSource(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                                >
                                    <option value="trustpilot">Trustpilot</option>
                                    <option value="clutch">Clutch.co</option>
                                    <option value="direct">Direct Client Feedback</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Review Date</label>
                                <input
                                    type="date"
                                    value={reviewDate}
                                    onChange={(e) => setReviewDate(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                            <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isFeatured}
                                    onChange={(e) => setIsFeatured(e.target.checked)}
                                    className="rounded border-slate-300 dark:border-slate-700 text-indigo-600"
                                />
                                <span>Display in Homepage Swiper Carousel</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <Link
                            href="/admin/reviews"
                            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Review'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
