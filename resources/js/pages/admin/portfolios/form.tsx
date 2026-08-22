import React, { useState } from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { Category, Portfolio } from '@/types';
import { ImageUploader } from '@/components/admin/image-uploader';
import {
    ArrowLeft,
    Save,
    Sparkles,
    Layers,
    Plus,
    X,
    ExternalLink,
    Play,
    Star
} from 'lucide-react';
import { showToast, showSuccessAlert } from '@/lib/swal';

interface PortfolioFormProps {
    portfolio: Portfolio | null;
    categories: Category[];
}

export default function PortfolioForm({ portfolio, categories }: PortfolioFormProps) {
    const isEdit = Boolean(portfolio);

    // Initial state
    const [title, setTitle] = useState(portfolio?.title || '');
    const [slug, setSlug] = useState(portfolio?.slug || '');
    const [categoryId, setCategoryId] = useState(portfolio?.category_id ? String(portfolio.category_id) : '');
    const [itemType, setItemType] = useState<'direct_link' | 'in_app_link'>(portfolio?.item_type || 'in_app_link');
    const [directUrl, setDirectUrl] = useState(portfolio?.direct_url || '');
    const [youtubeVideoUrl, setYoutubeVideoUrl] = useState(portfolio?.youtube_video_url || '');
    const [clientName, setClientName] = useState(portfolio?.client_name || '');
    const [completionDate, setCompletionDate] = useState(portfolio?.completion_date || '');
    const [shortDescription, setShortDescription] = useState(portfolio?.short_description || '');
    const [description, setDescription] = useState(portfolio?.description || '');
    const [isFeatured, setIsFeatured] = useState(portfolio ? portfolio.is_featured : false);
    const [isActive, setIsActive] = useState(portfolio ? portfolio.is_active : true);
    const [order, setOrder] = useState(portfolio?.order || 0);

    // Tech stacks tag input state
    const [techStacks, setTechStacks] = useState<string[]>(portfolio?.tech_stacks || ['React', 'Laravel', 'Tailwind CSS']);
    const [newTag, setNewTag] = useState('');

    // Upload Files state
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [existingThumbnail, setExistingThumbnail] = useState<string | null>(portfolio?.thumbnail || null);

    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [existingGallery, setExistingGallery] = useState<string[]>(portfolio?.gallery_images || []);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add tech stack tag
    const addTag = (e: React.KeyboardEvent | React.MouseEvent) => {
        if ('key' in e && e.key !== 'Enter') return;
        e.preventDefault();
        const trimmed = newTag.trim();
        if (trimmed && !techStacks.includes(trimmed)) {
            setTechStacks([...techStacks, trimmed]);
            setNewTag('');
        }
    };

    const removeTag = (tag: string) => {
        setTechStacks(techStacks.filter((t) => t !== tag));
    };

    // Auto-generate slug from title if empty
    const handleTitleChange = (val: string) => {
        setTitle(val);
        if (!isEdit || !slug) {
            setSlug(
                val
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)+/g, '')
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('slug', slug);
        formData.append('category_id', categoryId);
        formData.append('item_type', itemType);
        formData.append('direct_url', directUrl);
        formData.append('youtube_video_url', youtubeVideoUrl);
        formData.append('client_name', clientName);
        formData.append('completion_date', completionDate);
        formData.append('short_description', shortDescription);
        formData.append('description', description);
        formData.append('is_featured', isFeatured ? '1' : '0');
        formData.append('is_active', isActive ? '1' : '0');
        formData.append('order', String(order));

        // Tech stacks
        techStacks.forEach((tag, idx) => {
            formData.append(`tech_stacks[${idx}]`, tag);
        });

        // Single Thumbnail
        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }

        // Masonry Gallery Images
        galleryFiles.forEach((file) => {
            formData.append('gallery_images[]', file);
        });

        // Existing Gallery images to preserve
        existingGallery.forEach((imgUrl, idx) => {
            formData.append(`existing_gallery[${idx}]`, imgUrl);
        });

        if (isEdit && portfolio) {
            formData.append('_method', 'PUT');
            router.post(`/admin/portfolios/${portfolio.id}`, formData, {
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post('/admin/portfolios', formData, {
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    return (
        <AdminLayout
            title={isEdit ? `Edit "${portfolio?.title}"` : 'Add New Portfolio Project'}
            breadcrumbs={[
                { title: 'Portfolios', href: '/admin/portfolios' },
                { title: isEdit ? 'Edit' : 'Create' },
            ]}
        >
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back link */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/admin/portfolios"
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to All Projects</span>
                    </Link>

                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                        {isEdit ? 'Edit Project Details' : 'Create New Portfolio Project'}
                    </h2>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                        {/* Title & Slug */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Project Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    placeholder="e.g. NexusCloud Enterprise Platform"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    URL Slug
                                </label>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="nexuscloud-enterprise-platform"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Category & Item Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Category
                                </label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select a Category...</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Item Action Behavior <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={itemType}
                                    onChange={(e) => setItemType(e.target.value as 'direct_link' | 'in_app_link')}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-indigo-600 dark:text-cyan-400"
                                >
                                    <option value="in_app_link">In-App Link (Detailed Case Study + Masonry Gallery)</option>
                                    <option value="direct_link">Direct Link (Redirects directly to live URL)</option>
                                </select>
                            </div>
                        </div>

                        {/* Direct URL & YouTube Video URL */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    <span>Direct Live URL {itemType === 'direct_link' ? '(Required for Direct Link)' : '(Optional)'}</span>
                                </label>
                                <input
                                    type="url"
                                    value={directUrl}
                                    onChange={(e) => setDirectUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                                    <Play className="h-3.5 w-3.5 text-red-500" />
                                    <span>YouTube Demo / Video Showcase URL</span>
                                </label>
                                <input
                                    type="text"
                                    value={youtubeVideoUrl}
                                    onChange={(e) => setYoutubeVideoUrl(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Client & Date */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Client / Brand Name
                                </label>
                                <input
                                    type="text"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    placeholder="e.g. Nexus Global Inc."
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Completion Date / Timeline
                                </label>
                                <input
                                    type="text"
                                    value={completionDate}
                                    onChange={(e) => setCompletionDate(e.target.value)}
                                    placeholder="e.g. May 2026"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Tech Stacks Tag Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Tech Stacks & Frameworks
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {techStacks.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-cyan-400 text-xs font-bold"
                                    >
                                        <span>{tag}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="hover:text-red-500"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={addTag}
                                    placeholder="Type technology (e.g. Next.js) and press Enter"
                                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700"
                                >
                                    Add Tag
                                </button>
                            </div>
                        </div>

                        {/* Short Description */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Tagline / Short Summary (Card Preview)
                            </label>
                            <textarea
                                rows={2}
                                value={shortDescription}
                                onChange={(e) => setShortDescription(e.target.value)}
                                placeholder="A brief one or two sentence summary shown on portfolio cards..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Full HTML Description */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Detailed Description & Case Study (HTML / Rich Text)
                            </label>
                            <textarea
                                rows={6}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="<h3>Architecture Overview</h3><p>Detailed breakdown of features, problems solved, and metrics...</p>"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                            />
                        </div>

                        {/* Image Uploaders with LIVE PREVIEWS */}
                        <div className="grid grid-cols-1 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                            {/* Primary Thumbnail */}
                            <ImageUploader
                                label="Primary Thumbnail Image (Live Preview)"
                                multiple={false}
                                existingImages={existingThumbnail}
                                onChange={(file, existing) => {
                                    if (file instanceof File) {
                                        setThumbnailFile(file);
                                    } else {
                                        setThumbnailFile(null);
                                    }
                                    if (existing && existing.length > 0) {
                                        setExistingThumbnail(existing[0]);
                                    } else {
                                        setExistingThumbnail(null);
                                    }
                                }}
                            />

                            {/* Masonry Gallery Multi-Image Uploader */}
                            <ImageUploader
                                label="Masonry Screenshot Gallery Images (Live Multi-Image Preview, Optional)"
                                multiple={true}
                                maxFiles={8}
                                existingImages={existingGallery}
                                onChange={(files, existing) => {
                                    if (Array.isArray(files)) {
                                        setGalleryFiles(files);
                                    }
                                    if (existing) {
                                        setExistingGallery(existing);
                                    }
                                }}
                                helperText="Upload project screenshots for the Masonry interactive lightbox viewer."
                            />
                        </div>

                        {/* Switches: Featured, Active, Order */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isFeatured}
                                    onChange={(e) => setIsFeatured(e.target.checked)}
                                    className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                    <div className="text-xs font-bold text-slate-900 dark:text-white">Featured Project</div>
                                    <div className="text-[10px] text-slate-500">Pinned to top of landing page</div>
                                </div>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                    <div className="text-xs font-bold text-slate-900 dark:text-white">Publish Active</div>
                                    <div className="text-[10px] text-slate-500">Visible to public visitors</div>
                                </div>
                            </label>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    value={order}
                                    onChange={(e) => setOrder(Number(e.target.value))}
                                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end space-x-4">
                        <Link
                            href="/admin/portfolios"
                            className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs shadow-xl shadow-indigo-500/25 flex items-center space-x-2 transition-all hover:scale-105"
                        >
                            <Save className="h-4 w-4" />
                            <span>{isSubmitting ? 'Saving Project...' : isEdit ? 'Update Project' : 'Save & Publish'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
