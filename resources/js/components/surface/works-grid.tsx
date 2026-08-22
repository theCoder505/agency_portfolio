import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Category, Portfolio } from '@/types';
import { ExternalLink, Eye, ArrowRight, Sparkles, Play, Layers } from 'lucide-react';

interface WorksGridProps {
    portfolios: Portfolio[];
    categories: Category[];
    showViewAll?: boolean;
    title?: string;
    subtitle?: string;
}

export const WorksGrid: React.FC<WorksGridProps> = ({
    portfolios,
    categories,
    showViewAll = true,
    title = 'Engineered for Performance & Scale',
    subtitle = 'Explore our featured web applications, SaaS platforms, and digital products crafted with modern architecture.',
}) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Filter items according to category
    const filteredPortfolios =
        selectedCategory === 'all'
            ? portfolios
            : portfolios.filter(
                  (p) => p.category?.slug === selectedCategory || String(p.category_id) === selectedCategory
              );

    return (
        <section id="works" className="py-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/3 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20 text-xs font-bold mb-3">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Portfolio Showcase</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        {title}
                    </h2>
                    <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
                        {subtitle}
                    </p>

                    {/* Category Filter Tabs */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                                selectedCategory === 'all'
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md scale-105'
                                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                            }`}
                        >
                            All Works ({portfolios.length})
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.slug)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                                    selectedCategory === category.slug
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md scale-105'
                                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3x5 Responsive Works Grid (max 15 items on landing page) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPortfolios.slice(0, 15).map((project) => {
                        const isDirect = project.item_type === 'direct_link';
                        const targetUrl = isDirect ? project.direct_url || '#' : `/works/${project.slug}`;

                        return (
                            <div
                                key={project.id}
                                className="group relative flex flex-col rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-md hover:shadow-2xl hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-300 overflow-hidden"
                            >
                                {/* Thumbnail Image & Badges */}
                                <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                                    {project.thumbnail ? (
                                        <img
                                            src={project.thumbnail}
                                            alt={project.title}
                                            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-900/50 to-slate-950 text-indigo-400 font-semibold text-sm">
                                            <span>{project.title}</span>
                                        </div>
                                    )}

                                    {/* Gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                                    {/* Top badges: Category & Item Type */}
                                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                                        {project.category && (
                                            <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10">
                                                {project.category.name}
                                            </span>
                                        )}

                                        <span
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center space-x-1 ${
                                                isDirect
                                                    ? 'bg-amber-500/90 text-white'
                                                    : 'bg-indigo-600/90 text-white'
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

                                    {/* Bottom image overlay: Views count & YouTube indicator */}
                                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs text-white/90">
                                        <div className="flex items-center space-x-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md">
                                            <Eye className="h-3.5 w-3.5 text-cyan-400" />
                                            <span>{project.views_count.toLocaleString()} views</span>
                                        </div>

                                        {project.youtube_video_url && (
                                            <div className="flex items-center space-x-1 bg-red-600/80 backdrop-blur-sm px-2 py-1 rounded-md text-[11px] font-bold">
                                                <Play className="h-3 w-3 fill-current" />
                                                <span>Video Demo</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content Details */}
                                <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                                            {project.title}
                                        </h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                                            {project.short_description || project.title}
                                        </p>
                                    </div>

                                    {/* Tech Stack Pills */}
                                    {project.tech_stacks && project.tech_stacks.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {project.tech_stacks.slice(0, 4).map((tech, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                            {project.tech_stacks.length > 4 && (
                                                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500">
                                                    +{project.tech_stacks.length - 4}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    <div className="pt-2">
                                        {isDirect ? (
                                            <a
                                                href={targetUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-white dark:bg-slate-800 dark:hover:bg-amber-500 dark:hover:text-white text-slate-800 dark:text-slate-200 text-xs font-bold transition-all group-hover:shadow-md"
                                            >
                                                <span>Visit Live Project</span>
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        ) : (
                                            <Link
                                                href={targetUrl}
                                                className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 dark:hover:text-white text-slate-800 dark:text-slate-200 text-xs font-bold transition-all group-hover:shadow-md"
                                            >
                                                <span>View Project Case Study</span>
                                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* View All Works CTA */}
                {showViewAll && (
                    <div className="mt-14 text-center">
                        <Link
                            href="/works"
                            className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-sm shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
                        >
                            <span>Explore All Agency Works</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};
