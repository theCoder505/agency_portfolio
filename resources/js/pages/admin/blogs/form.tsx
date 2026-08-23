import React, { useState } from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { Blog, Category } from '@/types';
import { ImageUploader } from '@/components/admin/image-uploader';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import {
    ArrowLeft,
    Save,
    Sparkles,
    BookOpen,
    Plus,
    X,
    ExternalLink,
    Eye,
    Star,
    Layers,
    User,
    Tag,
    Clock
} from 'lucide-react';
import { showToast, showSuccessAlert } from '@/lib/swal';

interface BlogFormProps {
    blog: Blog | null;
    categories: Category[];
}

export default function BlogForm({ blog, categories }: BlogFormProps) {
    const isEdit = Boolean(blog);

    // Form state
    const [title, setTitle] = useState(blog?.title || '');
    const [slug, setSlug] = useState(blog?.slug || '');
    const [categoryId, setCategoryId] = useState(blog?.category_id ? String(blog.category_id) : '');
    const [shortDescription, setShortDescription] = useState(blog?.short_description || '');
    const [content, setContent] = useState(blog?.content || '');
    const [authorName, setAuthorName] = useState(blog?.author_name || 'CodeVenture Editorial Team');
    const [authorRole, setAuthorRole] = useState(blog?.author_role || 'Lead Architect');
    const [authorAvatar, setAuthorAvatar] = useState(blog?.author_avatar || '');
    const [readsCount, setReadsCount] = useState<number>(blog?.reads_count || 0);
    const [isFeatured, setIsFeatured] = useState(blog ? blog.is_featured : false);
    const [isPublished, setIsPublished] = useState(blog ? blog.is_published : true);
    const [order, setOrder] = useState(blog?.order || 0);

    // Tags state
    const [tags, setTags] = useState<string[]>(blog?.tags || ['Engineering', 'Architecture', 'Best Practices']);
    const [newTag, setNewTag] = useState('');

    // Thumbnail upload state
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [existingThumbnail, setExistingThumbnail] = useState<string | null>(blog?.thumbnail || null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto slug generator
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

    const addTag = (e: React.KeyboardEvent | React.MouseEvent) => {
        if ('key' in e && e.key !== 'Enter') return;
        e.preventDefault();
        const trimmed = newTag.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setNewTag('');
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('slug', slug);
        formData.append('category_id', categoryId);
        formData.append('short_description', shortDescription);
        formData.append('content', content);
        formData.append('author_name', authorName);
        formData.append('author_role', authorRole);
        formData.append('author_avatar', authorAvatar);
        formData.append('reads_count', String(readsCount));
        formData.append('is_featured', isFeatured ? '1' : '0');
        formData.append('is_published', isPublished ? '1' : '0');
        formData.append('order', String(order));

        // Tags
        tags.forEach((tag, idx) => {
            formData.append(`tags[${idx}]`, tag);
        });

        // Thumbnail file or existing path
        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        } else if (existingThumbnail) {
            formData.append('existing_thumbnail', existingThumbnail);
        } else {
            formData.append('remove_thumbnail', '1');
        }

        if (isEdit && blog) {
            formData.append('_method', 'PUT');
            router.post(`/admin/blogs/${blog.id}`, formData, {
                onFinish: () => setIsSubmitting(false),
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    showToast(String(firstError), 'error');
                },
            });
        } else {
            router.post('/admin/blogs', formData, {
                onFinish: () => setIsSubmitting(false),
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    showToast(String(firstError), 'error');
                },
            });
        }
    };

    return (
        <AdminLayout
            title={isEdit ? `Edit Article: ${blog?.title}` : 'Create New Article'}
            breadcrumbs={[
                { title: 'Blogs & Articles', href: '/admin/blogs' },
                { title: isEdit ? 'Edit Article' : 'Create Article' },
            ]}
        >
            <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-12">
                {/* Header with Back Button and Submit */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/admin/blogs"
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                {isEdit ? 'Edit Blog Article' : 'Create New Blog Article'}
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                {isEdit
                                    ? 'Update content, tags, rich formatting, and manage readership stats.'
                                    : 'Compose and publish a high-quality article for the agency blog.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {isEdit && blog && (
                            <a
                                href={`/blogs/${blog.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                            >
                                <ExternalLink className="h-4 w-4" />
                                <span>Preview Live</span>
                            </a>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            <span>{isSubmitting ? 'Saving...' : isEdit ? 'Update Article' : 'Publish Article'}</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column (Col 1 & 2) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title & Slug Card */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                                <Sparkles className="h-4 w-4 text-indigo-500" />
                                <span>Article Header & Identity</span>
                            </h2>

                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Article Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Architecting High-Throughput Micro-Frontends with React 19"
                                    value={title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                />
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    URL Slug (Auto-generated) <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex items-center">
                                    <span className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-xl text-xs text-slate-500 font-mono">
                                        /blogs/
                                    </span>
                                    <input
                                        type="text"
                                        required
                                        placeholder="architecting-high-throughput-micro-frontends"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className="w-full px-3 py-2.5 text-sm font-mono bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Short Description / Excerpt */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Short Summary / Excerpt
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="A concise 2-3 sentence overview that appears on blog cards, search engines, and social media previews..."
                                    value={shortDescription}
                                    onChange={(e) => setShortDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Rich Text Editor for Main Content */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                                <BookOpen className="h-4 w-4 text-indigo-500" />
                                <span>Article Content (Rich Text)</span>
                            </h2>

                            <RichTextEditor
                                label="Body Description / Full Content"
                                value={content}
                                onChange={setContent}
                                placeholder="Start drafting your comprehensive technical article here..."
                                minHeight="420px"
                                helperText="Format code blocks with <code>, insert quotations with blockquotes, and add subheadings (H2, H3)."
                            />
                        </div>
                    </div>

                    {/* Sidebar Metadata Column (Col 3) */}
                    <div className="space-y-6">
                        {/* Thumbnail Image */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Cover Thumbnail
                            </h2>
                            <ImageUploader
                                label="Upload Article Cover Image"
                                existingImages={existingThumbnail}
                                onChange={(file, existingList) => {
                                    if (file instanceof File) {
                                        setThumbnailFile(file);
                                    } else {
                                        setThumbnailFile(null);
                                    }
                                    setExistingThumbnail(existingList && existingList.length > 0 ? existingList[0] : null);
                                }}
                                helperText="Recommended: 1200x630 (16:9 ratio) PNG, JPG, or WebP up to 10MB"
                            />
                        </div>

                        {/* Category & Taxonomy */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Classification & Category
                            </h2>

                            {/* Category Selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Category
                                </label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">-- Select Category --</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tags Input */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Topic Tags
                                </label>
                                <div className="flex items-center space-x-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Type tag & press Enter..."
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyDown={addTag}
                                        className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
                                        >
                                            <span>#{tag}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="hover:text-rose-500"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Author & Readership Stats */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                                <User className="h-4 w-4 text-indigo-500" />
                                <span>Author & Analytics</span>
                            </h2>

                            {/* Author Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Author Name
                                </label>
                                <input
                                    type="text"
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    placeholder="e.g. Alexander Vance"
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Author Role */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Author Role
                                </label>
                                <input
                                    type="text"
                                    value={authorRole}
                                    onChange={(e) => setAuthorRole(e.target.value)}
                                    placeholder="e.g. Principal Software Architect"
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Author Avatar URL */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Author Avatar (URL)
                                </label>
                                <input
                                    type="url"
                                    value={authorAvatar}
                                    onChange={(e) => setAuthorAvatar(e.target.value)}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* READS COUNT FIELD (Admin Control) */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                <label className="block text-xs font-bold text-indigo-700 dark:text-cyan-400 mb-1.5 flex items-center space-x-1.5">
                                    <Eye className="h-4 w-4" />
                                    <span>Total Reads Count</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        value={readsCount}
                                        onChange={(e) => setReadsCount(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-2.5 text-sm font-mono font-bold bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                        reads
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                    Automatically increments when visitors view the article on the surface.
                                </p>
                            </div>
                        </div>

                        {/* Visibility & Toggles */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Publishing & Options
                            </h2>

                            {/* Is Published Toggle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">Publish Article</p>
                                    <p className="text-[11px] text-slate-500">Make visible on the live website</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isPublished}
                                    onChange={(e) => setIsPublished(e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-5 w-5 cursor-pointer"
                                />
                            </div>

                            {/* Is Featured Toggle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">Feature in Spotlight</p>
                                    <p className="text-[11px] text-slate-500">Showcase in top hero banner</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isFeatured}
                                    onChange={(e) => setIsFeatured(e.target.checked)}
                                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-400 h-5 w-5 cursor-pointer"
                                />
                            </div>

                            {/* Sort Order */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Display Sort Order
                                </label>
                                <input
                                    type="number"
                                    value={order}
                                    onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
