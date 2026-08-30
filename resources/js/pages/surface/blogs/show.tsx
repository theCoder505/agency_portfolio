import React from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import { SurfaceLayout } from '@/layouts/surface-layout';
import { Blog, SharedData } from '@/types';
import {
    Calendar,
    Clock,
    Eye,
    ChevronRight,
    ArrowLeft,
    Share2,
    Twitter,
    Linkedin,
    Facebook,
    Link as LinkIcon,
    Sparkles,
    User,
    ArrowUpRight,
    BookOpen,
    Tag
} from 'lucide-react';
import { showToast } from '@/lib/swal';

interface BlogShowPageProps {
    blog: Blog;
    relatedBlogs: Blog[];
}

export default function BlogShowPage({ blog, relatedBlogs }: BlogShowPageProps) {
    const { app_settings } = usePage<SharedData>().props;
    const brandName = app_settings?.brand_name || 'CodeVenture Tech';

    // Calculate approximate read time
    const getReadTime = (content?: string | null, excerpt?: string | null) => {
        const text = (content || '') + ' ' + (excerpt || '');
        const cleanText = text.replace(/<[^>]*>?/gm, '');
        const words = cleanText.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        return `${Math.max(1, minutes)} min read`;
    };

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleCopyLink = () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            showToast('Article link copied to clipboard!', 'success');
        }
    };

    const shareOnTwitter = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const shareOnLinkedIn = () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const shareOnFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <SurfaceLayout
            title={`${blog.title}`}
            description={blog.short_description || `Read "${blog.title}" on ${brandName}.`}
        >
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pb-20">
                {/* Article Header & Breadcrumbs */}
                <header className="relative pt-8 pb-12 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-500/10 dark:from-indigo-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

                    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                        {/* Breadcrumb Navigation */}
                        <nav
                            data-aos="fade-down"
                            className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400"
                        >
                            <Link href="/" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
                                Home
                            </Link>
                            <ChevronRight className="h-3.5 w-3.5" />
                            <Link href="/blogs" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
                                Blogs
                            </Link>
                            <ChevronRight className="h-3.5 w-3.5" />
                            <span className="text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                                {blog.title}
                            </span>
                        </nav>

                        {/* Metadata Badges Row */}
                        <div
                            data-aos="fade-up"
                            className="flex flex-wrap items-center gap-3 text-xs"
                        >
                            {blog.category && (
                                <Link
                                    href={`/blogs?category=${blog.category.slug}`}
                                    className="px-3 py-1 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-cyan-400 border border-indigo-200/60 dark:border-indigo-800/60 hover:bg-indigo-100 transition-colors"
                                >
                                    {blog.category.name}
                                </Link>
                            )}

                            <span className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>
                                    {blog.published_at
                                        ? new Date(blog.published_at).toLocaleDateString(undefined, {
                                              month: 'long',
                                              day: 'numeric',
                                              year: 'numeric',
                                          })
                                        : new Date(blog.created_at).toLocaleDateString()}
                                </span>
                            </span>

                            <span className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{getReadTime(blog.content, blog.short_description)}</span>
                            </span>

                            {/* Prominent Reads Count Chip */}
                            <span className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full font-mono text-xs font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                                <Eye className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                                <span>{(blog.reads_count || 0).toLocaleString()} reads</span>
                            </span>
                        </div>

                        {/* Article Main Title */}
                        <h1
                            data-aos="fade-up"
                            data-aos-delay="100"
                            className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.2]"
                        >
                            {blog.title}
                        </h1>

                        {/* Excerpt / Lead */}
                        {blog.short_description && (
                            <p
                                data-aos="fade-up"
                                data-aos-delay="150"
                                className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium"
                            >
                                {blog.short_description}
                            </p>
                        )}

                        {/* Author Card Row */}
                        <div
                            data-aos="fade-up"
                            data-aos-delay="200"
                            className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            <div className="flex items-center space-x-3.5">
                                {blog.author_avatar ? (
                                    <img
                                        src={blog.author_avatar}
                                        alt={blog.author_name || 'Author'}
                                        className="h-12 w-12 rounded-full object-cover border-2 border-indigo-500/20"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white font-bold flex items-center justify-center text-base shadow-md">
                                        {blog.author_name ? blog.author_name.charAt(0) : 'C'}
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                        {blog.author_name || 'CodeVenture Editorial Team'}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {blog.author_role || 'Staff Engineering Specialist'}
                                    </p>
                                </div>
                            </div>

                            {/* Quick Share Buttons */}
                            <div className="flex items-center space-x-2">
                                <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">Share:</span>
                                <button
                                    onClick={shareOnTwitter}
                                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors shadow-xs"
                                    title="Share on X / Twitter"
                                >
                                    <Twitter className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={shareOnLinkedIn}
                                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors shadow-xs"
                                    title="Share on LinkedIn"
                                >
                                    <Linkedin className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={shareOnFacebook}
                                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors shadow-xs"
                                    title="Share on Facebook"
                                >
                                    <Facebook className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={handleCopyLink}
                                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors shadow-xs"
                                    title="Copy Link to Clipboard"
                                >
                                    <LinkIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Article Content Container */}
                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
                    {/* Cover Thumbnail */}
                    {blog.thumbnail && (
                        <div
                            data-aos="zoom-in"
                            className="relative rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-slate-200/80 dark:border-slate-800/80 bg-slate-950 aspect-[16/9]"
                        >
                            <img
                                src={blog.thumbnail}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Rich Formatted Article Body */}
                    <div
                        data-aos="fade-up"
                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-12 shadow-sm"
                    >
                        <div
                            className="blog-content text-slate-800 dark:text-slate-200"
                            dangerouslySetInnerHTML={{ __html: blog.content || '<p>No content provided.</p>' }}
                        />

                        {/* Article Tags */}
                        {blog.tags && blog.tags.length > 0 && (
                            <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 mr-2 flex items-center space-x-1">
                                    <Tag className="h-3.5 w-3.5" />
                                    <span>Topics:</span>
                                </span>
                                {blog.tags.map((tag, tIdx) => (
                                    <Link
                                        key={tIdx}
                                        href={`/blogs?tag=${encodeURIComponent(tag)}`}
                                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors"
                                    >
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Share Box & Author Box */}
                    <div
                        data-aos="fade-up"
                        className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center space-x-4">
                            {blog.author_avatar ? (
                                <img
                                    src={blog.author_avatar}
                                    alt={blog.author_name || 'Author'}
                                    className="h-16 w-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                                />
                            ) : (
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white font-bold flex items-center justify-center text-xl shadow">
                                    {blog.author_name ? blog.author_name.charAt(0) : 'C'}
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400">Written by</p>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {blog.author_name || 'CodeVenture Editorial Team'}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {blog.author_role || 'Staff Engineering Specialist'} • {brandName}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleCopyLink}
                                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-cyan-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-colors"
                            >
                                <LinkIcon className="h-4 w-4" />
                                <span>Copy Link</span>
                            </button>
                            <Link
                                href="/blogs"
                                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white text-xs font-bold transition-all shadow"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Back to Blogs</span>
                            </Link>
                        </div>
                    </div>

                    {/* Related Articles Section */}
                    {relatedBlogs && relatedBlogs.length > 0 && (
                        <div className="space-y-6 pt-8">
                            <div className="flex items-center justify-between">
                                <h2
                                    data-aos="fade-right"
                                    className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2"
                                >
                                    <Sparkles className="h-5 w-5 text-indigo-500" />
                                    <span>Related Insights & Articles</span>
                                </h2>
                                <Link
                                    href="/blogs"
                                    className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline flex items-center space-x-1"
                                >
                                    <span>View all</span>
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedBlogs.map((rel, idx) => (
                                    <Link
                                        key={rel.id}
                                        href={`/blogs/${rel.slug}`}
                                        data-aos="fade-up"
                                        data-aos-delay={`${idx * 100}`}
                                        className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/50 p-4 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
                                    >
                                        <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 relative">
                                            {rel.thumbnail ? (
                                                <img
                                                    src={rel.thumbnail}
                                                    alt={rel.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-indigo-400/40">
                                                    <BookOpen className="h-8 w-8" />
                                                </div>
                                            )}
                                            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur font-mono text-[10px] text-cyan-400 font-bold">
                                                {(rel.reads_count || 0).toLocaleString()} reads
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 flex-grow">
                                            {rel.category && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400">
                                                    {rel.category.name}
                                                </span>
                                            )}
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors leading-snug">
                                                {rel.title}
                                            </h3>
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                            <span>{getReadTime(rel.content, rel.short_description)}</span>
                                            <ArrowUpRight className="h-4 w-4 text-indigo-600 dark:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bottom CTA Box */}
                    <div
                        data-aos="zoom-in"
                        className="rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl text-center space-y-4"
                    >
                        <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                            Ready to Transform Your Digital Infrastructure?
                        </h3>
                        <p className="text-sm text-indigo-200 max-w-xl mx-auto leading-relaxed">
                            Work directly with the engineering minds behind these technical articles. We build high-throughput SaaS platforms and bespoke web applications.
                        </p>
                        <div className="pt-2 flex justify-center">
                            <Link
                                href="/contact"
                                className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-95"
                            >
                                Start a Conversation
                            </Link>
                        </div>
                    </div>
                </article>
            </div>
        </SurfaceLayout>
    );
}
