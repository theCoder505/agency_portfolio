import React, { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { SurfaceLayout } from '@/layouts/surface-layout';
import { Blog, Category, PaginatedData } from '@/types';
import { Pagination } from '@/components/ui/pagination';
import { useClientDataTable } from '@/hooks/use-client-data-table';
import {
    Search,
    BookOpen,
    Sparkles,
    Eye,
    Calendar,
    Clock,
    ArrowRight,
    Flame,
    Compass,
    X,
} from 'lucide-react';

interface BlogIndexPageProps {
    blogs: Blog[] | PaginatedData<Blog>;
    featuredBlog: Blog | null;
    categories: (Category & { blogs_count?: number })[];
}

export default function BlogIndexPage({
    blogs,
    featuredBlog,
    categories,
}: BlogIndexPageProps) {
    const [activeCategory, setActiveCategory] = useState('all');
    const [activeTag, setActiveTag] = useState('');

    const allBlogsList = useMemo(() => {
        return Array.isArray(blogs) ? blogs : blogs?.data || [];
    }, [blogs]);

    // Filter by Category and Tag
    const filteredByCategoryAndTag = useMemo(() => {
        return allBlogsList.filter((blog) => {
            if (activeCategory !== 'all' && blog.category?.slug !== activeCategory) {
                return false;
            }
            if (activeTag && (!blog.tags || !blog.tags.includes(activeTag))) {
                return false;
            }
            return true;
        });
    }, [allBlogsList, activeCategory, activeTag]);

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
    } = useClientDataTable<Blog>({
        items: filteredByCategoryAndTag,
        pageSize: 9,
        searchFields: ['title', 'short_description', 'author_name', 'tags', 'category.name', 'content'],
    });

    // Calculate approximate read time (200 words/min)
    const getReadTime = (content?: string | null, excerpt?: string | null) => {
        const text = (content || '') + ' ' + (excerpt || '');
        const cleanText = text.replace(/<[^>]*>?/gm, '');
        const words = cleanText.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        return `${Math.max(1, minutes)} min read`;
    };

    const handleCategoryClick = (catSlug: string) => {
        setActiveCategory(catSlug);
        setCurrentPage(1);
    };

    const handleTagClick = (t: string) => {
        setActiveTag(prev => prev === t ? '' : t);
        setCurrentPage(1);
    };

    const handleResetAll = () => {
        clearSearch();
        setActiveCategory('all');
        setActiveTag('');
        setCurrentPage(1);
    };

    // Calculate total count of all blogs across categories
    const totalBlogsCount = categories.reduce((acc, c) => acc + (c.blogs_count || 0), 0);

    return (
        <SurfaceLayout
            title="Tech Insights, Engineering & Architecture Blogs"
            description="Explore in-depth articles on software architecture, React 19, high-performance cloud SaaS, AI orchestration, and modern web development."
        >
            <div className="min-h-screen transition-colors duration-300">
                {/* Hero Header Section */}
                <section className="relative pt-12 pb-16 overflow-hidden">
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Eyebrow badge */}
                        <div
                            data-aos="fade-down"
                            className="cv-badge mb-6"
                        >
                            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                            <span>CodeVenture Engineering Chronicles</span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                            <div className="lg:col-span-7 space-y-4" data-aos="fade-up">
                                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                                    Architectural Insights &{' '}
                                    <span className="cv-gradient-text">
                                        Modern Web Innovation
                                    </span>
                                </h1>
                                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                                    Deep dives, production case studies, benchmark analyses, and design patterns from our senior engineers and digital architects.
                                </p>
                            </div>

                            {/* Search Bar */}
                            <div className="lg:col-span-5" data-aos="fade-up" data-aos-delay="100">
                                <form onSubmit={handleImmediateSearch} className="relative">
                                    <div className="relative flex items-center">
                                        <Search className="absolute left-4 h-5 w-5 text-cyan-500 pointer-events-none" />
                                        <input
                                            type="text"
                                            placeholder="Search topics, frameworks, tutorials..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white/80 dark:bg-[#01121e]/80 border border-slate-200 dark:border-cyan-500/20 text-sm text-slate-900 dark:text-white placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                                        />
                                        {search && (
                                            <button
                                                type="button"
                                                onClick={clearSearch}
                                                className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Category Filter Tabs */}
                        <div
                            data-aos="fade-up"
                            data-aos-delay="200"
                            className="mt-10 flex gap-2 p-2 flex-wrap items-center overflow-x-auto pb-2 scrollbar-none"
                        >
                            <button
                                type="button"
                                onClick={() => handleCategoryClick('all')}
                                className={`flex-shrink-0 inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    activeCategory === 'all'
                                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-105'
                                        : 'bg-white dark:bg-[#01121e] text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-cyan-500/20 hover:border-cyan-500/50'
                                }`}
                            >
                                <Compass className="h-3.5 w-3.5" />
                                <span>All Articles</span>
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-[#010a10] text-slate-700 dark:text-cyan-400 font-mono">
                                    {totalBlogsCount || allBlogsList.length}
                                </span>
                            </button>

                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => handleCategoryClick(category.slug)}
                                    className={`flex-shrink-0 inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                        activeCategory === category.slug
                                            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-105'
                                            : 'bg-white dark:bg-[#01121e] text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-cyan-500/20 hover:border-cyan-500/50'
                                    }`}
                                >
                                    <span>{category.name}</span>
                                    {category.blogs_count !== undefined && (
                                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                                            activeCategory === category.slug
                                                ? 'bg-[#010a10] text-cyan-400'
                                                : 'bg-slate-100 dark:bg-[#010a10] text-slate-500 dark:text-slate-400'
                                        }`}>
                                            {category.blogs_count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
                    {/* Featured Spotlight Article (Shown on first page when not searching) */}
                    {featuredBlog && activeCategory === 'all' && !search && !activeTag && (
                        <div
                            data-aos="fade-up"
                            className="cv-card relative group rounded-3xl overflow-hidden shadow-xl transition-all duration-300"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                                {/* Featured Image */}
                                <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto overflow-hidden bg-slate-900">
                                    {featuredBlog.thumbnail ? (
                                        <img
                                            src={featuredBlog.thumbnail}
                                            alt={featuredBlog.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-tr from-indigo-900 to-slate-950 flex items-center justify-center">
                                            <BookOpen className="h-16 w-16 text-cyan-400/40" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent lg:hidden" />

                                    {/* Spotlight Badge */}
                                    <div className="absolute top-4 left-4 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500 text-slate-950 text-xs font-black tracking-wide uppercase shadow-lg">
                                        <Flame className="h-3.5 w-3.5 text-slate-950" />
                                        <span>Featured Spotlight</span>
                                    </div>
                                </div>

                                {/* Content Details */}
                                <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                                    <div className="space-y-4">
                                        {/* Metadata Row */}
                                        <div className="flex flex-wrap items-center gap-3 text-xs">
                                            {featuredBlog.category && (
                                                <span className="cv-badge">
                                                    {featuredBlog.category.name}
                                                </span>
                                            )}
                                            <span className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>{getReadTime(featuredBlog.content, featuredBlog.short_description)}</span>
                                            </span>

                                            {/* Reads Count Chip */}
                                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60">
                                                <Eye className="h-3 w-3 text-cyan-500" />
                                                <span>{(featuredBlog.reads_count || 0).toLocaleString()} reads</span>
                                            </span>
                                        </div>

                                        <Link href={`/blogs/${featuredBlog.slug}`}>
                                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                                {featuredBlog.title}
                                            </h2>
                                        </Link>

                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                                            {featuredBlog.short_description}
                                        </p>
                                    </div>

                                    {/* Author & CTA */}
                                    <div className="pt-6 border-t border-slate-100 dark:border-cyan-500/10 flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            {featuredBlog.author_avatar ? (
                                                <img
                                                    src={featuredBlog.author_avatar}
                                                    alt={featuredBlog.author_name || 'Author'}
                                                    className="h-10 w-10 rounded-full object-cover border border-cyan-500/30"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow">
                                                    {featuredBlog.author_name ? featuredBlog.author_name.charAt(0) : 'A'}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white">
                                                    {featuredBlog.author_name || 'CodeVenture Lead'}
                                                </p>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    {featuredBlog.published_at ? new Date(featuredBlog.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                                                </p>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/blogs/${featuredBlog.slug}`}
                                            className="cv-btn-primary text-xs py-2 px-4"
                                        >
                                            <span>Read Article</span>
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Articles Grid Section */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                                    <BookOpen className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                                    <span>
                                        {activeCategory !== 'all'
                                            ? `${categories.find((c) => c.slug === activeCategory)?.name || 'Filtered'} Articles`
                                            : 'All Published Articles'}
                                    </span>
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                    Showing {paginatedItems.length} of {totalItems} total publications
                                </p>
                            </div>
                        </div>

                        {paginatedItems.length === 0 ? (
                            <div
                                data-aos="fade-up"
                                className="text-center py-20 cv-card rounded-3xl p-8 border-dashed"
                            >
                                <BookOpen className="h-12 w-12 mx-auto text-slate-400 mb-3 opacity-60" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No articles found</h3>
                                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                                    We couldn't find any articles matching your search query. Try clearing the search or exploring another category.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleResetAll}
                                    className="cv-btn-primary text-xs"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {paginatedItems.map((blog, idx) => (
                                    <article
                                        key={blog.id}
                                        data-aos="fade-up"
                                        data-aos-delay={`${(idx % 3) * 100}`}
                                        className="cv-card group flex flex-col rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                                    >
                                        {/* Card Thumbnail */}
                                        <Link
                                            href={`/blogs/${blog.slug}`}
                                            className="relative aspect-[16/10] overflow-hidden bg-slate-950 block"
                                        >
                                            {blog.thumbnail ? (
                                                <img
                                                    src={blog.thumbnail}
                                                    alt={blog.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-tr from-slate-900 to-indigo-950 flex items-center justify-center">
                                                    <BookOpen className="h-10 w-10 text-cyan-400/40" />
                                                </div>
                                            )}

                                            {/* Category Tag Over Image */}
                                            {blog.category && (
                                                <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold tracking-wide">
                                                    {blog.category.name}
                                                </div>
                                            )}

                                            {/* Reads Count Pill Over Image */}
                                            <div className="absolute bottom-3.5 right-3.5 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/10 text-cyan-400 font-mono text-[11px] font-bold">
                                                <Eye className="h-3 w-3 text-cyan-400" />
                                                <span>{(blog.reads_count || 0).toLocaleString()}</span>
                                            </div>
                                        </Link>

                                        {/* Card Body */}
                                        <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                                            <div className="space-y-2.5">
                                                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>
                                                        {blog.published_at
                                                            ? new Date(blog.published_at).toLocaleDateString(undefined, {
                                                                  month: 'short',
                                                                  day: 'numeric',
                                                                  year: 'numeric',
                                                              })
                                                            : 'Recently'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{getReadTime(blog.content, blog.short_description)}</span>
                                                </div>

                                                <Link href={`/blogs/${blog.slug}`}>
                                                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
                                                        {blog.title}
                                                    </h3>
                                                </Link>

                                                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                    {blog.short_description}
                                                </p>
                                            </div>

                                            {/* Tags preview */}
                                            {blog.tags && blog.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {blog.tags.slice(0, 3).map((tag, tIdx) => (
                                                        <span
                                                            key={tIdx}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleTagClick(tag);
                                                            }}
                                                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold cursor-pointer transition-colors ${
                                                                activeTag === tag
                                                                    ? 'bg-cyan-500 text-slate-950 font-bold'
                                                                    : 'bg-slate-100 dark:bg-[#01121e] text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-cyan-500/15 hover:border-cyan-500/40'
                                                            }`}
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Footer Info */}
                                            <div className="pt-4 border-t border-slate-100 dark:border-cyan-500/10 flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    {blog.author_avatar ? (
                                                        <img
                                                            src={blog.author_avatar}
                                                            alt={blog.author_name || 'Author'}
                                                            className="h-7 w-7 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-[#01121e] border border-slate-300 dark:border-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                                            {blog.author_name ? blog.author_name.charAt(0) : 'A'}
                                                        </div>
                                                    )}
                                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                                                        {blog.author_name || 'Editorial'}
                                                    </span>
                                                </div>

                                                <Link
                                                    href={`/blogs/${blog.slug}`}
                                                    className="inline-flex items-center space-x-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform"
                                                >
                                                    <span>Read</span>
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                        {/* Pagination Links */}
                        <div className="pt-8">
                            <Pagination
                                from={from}
                                to={to}
                                total={totalItems}
                                currentPage={currentPage}
                                lastPage={totalPages}
                                onPageChange={setCurrentPage}
                                itemLabel="articles"
                            />
                        </div>
                    </div>

                    {/* Bottom CTA Banner */}
                    <div
                        data-aos="zoom-in"
                        className="cv-card relative rounded-3xl p-8 sm:p-12 overflow-hidden text-white shadow-2xl border-cyan-500/30"
                    >
                        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="relative max-w-2xl space-y-4">
                            <div className="cv-badge">
                                <span>Build With Us</span>
                            </div>
                            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                                Have an Ambitious Digital Product in Mind?
                            </h2>
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                                Let's collaborate to build high-performance SaaS applications, AI workflows, and digital platforms engineered for scale.
                            </p>
                            <div className="pt-2 flex flex-wrap items-center gap-3">
                                <Link
                                    href="/contact"
                                    className="cv-btn-primary text-xs sm:text-sm"
                                >
                                    Schedule Technical Consultation
                                </Link>
                                <Link
                                    href="/works"
                                    className="cv-btn-secondary text-xs sm:text-sm"
                                >
                                    Explore Our Works
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SurfaceLayout>
    );
}
