import React, { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { Category, Portfolio, PaginatedData } from '@/types';
import { SurfaceLayout } from '@/layouts/surface-layout';
import { Pagination } from '@/components/ui/pagination';
import { useClientDataTable } from '@/hooks/use-client-data-table';
import { Search, ExternalLink, Layers, Eye, Play, ArrowRight, X } from 'lucide-react';

interface WorksIndexProps {
    portfolios: Portfolio[] | PaginatedData<Portfolio>;
    categories: Category[];
}

export default function WorksIndex({ portfolios, categories }: WorksIndexProps) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedType, setSelectedType] = useState('all');

    const allPortfoliosList = useMemo(() => {
        return Array.isArray(portfolios) ? portfolios : portfolios?.data || [];
    }, [portfolios]);

    // Filter by Category and Type first
    const filteredByCategoryAndType = useMemo(() => {
        return allPortfoliosList.filter((project) => {
            if (selectedCategory !== 'all' && project.category?.slug !== selectedCategory) {
                return false;
            }
            if (selectedType !== 'all' && project.item_type !== selectedType) {
                return false;
            }
            return true;
        });
    }, [allPortfoliosList, selectedCategory, selectedType]);

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
        items: filteredByCategoryAndType,
        pageSize: 12,
        searchFields: ['title', 'short_description', 'client_name', 'tech_stacks', 'category.name'],
    });

    const handleCategoryChange = (slug: string) => {
        setSelectedCategory(slug);
        setCurrentPage(1);
    };

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        clearSearch();
        setSelectedCategory('all');
        setSelectedType('all');
        setCurrentPage(1);
    };

    return (
        <SurfaceLayout
            title="Portfolio & Works Showcase"
            description="Explore CodeVenture Tech's complete catalog of high performance web applications, SaaS products, and custom websites."
        >
            {/* Header Banner */}
            <section className="pt-12 pb-16 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl relative z-10">
                    <div className="cv-badge mb-3.5" data-aos="fade-down">
                        <Layers className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Agency Project Archive</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white" data-aos="fade-up">
                        Our Engineered Digital Portfolio
                    </h1>
                    <p className="mt-4 text-base text-slate-600 dark:text-slate-400" data-aos="fade-up" data-aos-delay="100">
                        Browse all web development case studies, direct live apps, and enterprise platforms engineered by our team.
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleImmediateSearch} className="mt-8 max-w-xl mx-auto flex items-center relative" data-aos="fade-up" data-aos-delay="150">
                        <Search className="absolute left-4 h-5 w-5 text-cyan-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by project name, client, or technology..."
                            className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-slate-200 dark:border-cyan-500/20 bg-white/80 dark:bg-[#01121e]/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm text-sm"
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
                    </form>
                </div>
            </section>

            {/* Main Content & Filter Toolbar */}
            <section className="py-16 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-slate-200/60 dark:border-cyan-500/10 mb-10">
                        {/* Categories */}
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleCategoryChange('all')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    selectedCategory === 'all'
                                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                                        : 'bg-slate-100 dark:bg-[#01121e] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-cyan-500/20 hover:border-cyan-500/50'
                                }`}
                            >
                                All Categories
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleCategoryChange(cat.slug)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                        selectedCategory === cat.slug
                                            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                                            : 'bg-slate-100 dark:bg-[#01121e] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-cyan-500/20 hover:border-cyan-500/50'
                                    }`}
                                >
                                    {cat.name} ({cat.portfolios_count ?? 0})
                                </button>
                            ))}
                        </div>

                        {/* Item Type Selector */}
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type:</span>
                            <select
                                value={selectedType}
                                onChange={(e) => handleTypeChange(e.target.value)}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-cyan-500/20 bg-white dark:bg-[#01121e] text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                <option value="all">All Types</option>
                                <option value="in_app_link">In-App Case Studies</option>
                                <option value="direct_link">Direct Live Links</option>
                            </select>
                        </div>
                    </div>

                    {/* Projects Grid */}
                    {paginatedItems.length === 0 ? (
                        <div className="text-center py-20 cv-card rounded-3xl border-dashed">
                            <Layers className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No projects found</h3>
                            <p className="text-xs text-slate-500 mt-1">Try adjusting your search or category filter</p>
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="mt-4 cv-btn-primary text-xs"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {paginatedItems.map((project, idx) => {
                                const isDirect = project.item_type === 'direct_link';
                                const targetUrl = isDirect ? project.direct_url || '#' : `/works/${project.slug}`;

                                return (
                                    <div
                                        key={project.id}
                                        data-aos="fade-up"
                                        data-aos-delay={`${(idx % 3) * 100}`}
                                        className="cv-card group relative flex flex-col rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden"
                                    >
                                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                                            {project.thumbnail ? (
                                                <img
                                                    src={project.thumbnail}
                                                    alt={project.title}
                                                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-900/50 to-slate-950 text-cyan-400 font-semibold text-sm">
                                                    <span>{project.title}</span>
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                            {/* Badges */}
                                            <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                                                {project.category && (
                                                    <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10">
                                                        {project.category.name}
                                                    </span>
                                                )}

                                                <span
                                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center space-x-1 ${
                                                        isDirect
                                                            ? 'bg-amber-500/90 text-slate-950 font-black'
                                                            : 'bg-cyan-500/90 text-slate-950 font-black'
                                                    }`}
                                                >
                                                    {isDirect ? (
                                                        <>
                                                            <ExternalLink className="h-3 w-3" />
                                                            <span>Live Link</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Layers className="h-3 w-3" />
                                                            <span>In-App Details</span>
                                                        </>
                                                    )}
                                                </span>
                                            </div>

                                            {/* Views */}
                                            <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs text-white/90">
                                                <div className="flex items-center space-x-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md">
                                                    <Eye className="h-3.5 w-3.5 text-cyan-400" />
                                                    <span>{project.views_count.toLocaleString()} views</span>
                                                </div>

                                                {project.youtube_video_url && (
                                                    <div className="flex items-center space-x-1 bg-red-600/80 backdrop-blur-sm px-2 py-1 rounded-md text-[11px] font-bold">
                                                        <Play className="h-3 w-3 fill-current" />
                                                        <span>Video</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                                                    {project.title}
                                                </h3>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                                                    {project.short_description || project.title}
                                                </p>
                                            </div>

                                            {project.tech_stacks && project.tech_stacks.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {project.tech_stacks.slice(0, 4).map((tech, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#01121e] text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-cyan-500/15"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="pt-2">
                                                {isDirect ? (
                                                    <a
                                                        href={targetUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-white dark:bg-[#01121e] dark:hover:bg-amber-500 dark:hover:text-slate-950 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200/60 dark:border-cyan-500/20 transition-all"
                                                    >
                                                        <span>Visit Live Project</span>
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                ) : (
                                                    <Link
                                                        href={targetUrl}
                                                        className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-cyan-500 hover:text-slate-950 dark:bg-[#01121e] dark:hover:bg-cyan-500 dark:hover:text-slate-950 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200/60 dark:border-cyan-500/20 transition-all"
                                                    >
                                                        <span>View Case Study</span>
                                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="mt-12">
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
            </section>
        </SurfaceLayout>
    );
}
