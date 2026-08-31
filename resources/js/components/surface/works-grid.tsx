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
            {/* Background ambient lighting */}
            <div className="absolute top-1/3 -right-20 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute bottom-10 -left-20 w-96 h-96 bg-blue-600/5 dark:bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-14" data-aos="fade-up">
                    <div className="cv-badge mb-3.5">
                        <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Engineered Case Studies</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                        {title}
                    </h2>
                    <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        {subtitle}
                    </p>

                    {/* Category Filter Tabs */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                                selectedCategory === 'all'
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md scale-105 border border-transparent'
                                    : 'bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
                            }`}
                        >
                            All Works ({portfolios.length})
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => setSelectedCategory(category.slug)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                                    selectedCategory === category.slug
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md scale-105 border border-transparent'
                                        : 'bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3x5 Responsive Works Grid (max 15 items on landing page) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPortfolios.slice(0, 15).map((project, idx) => {
                        const isDirect = project.item_type === 'direct_link';
                        const targetUrl = isDirect ? project.direct_url || '#' : `/works/${project.slug}`;

                        return (
                            <div
                                key={project.id}
                                data-aos="fade-up"
                                data-aos-delay={`${(idx % 3) * 100}`}
                                className="cv-card rounded-3xl flex flex-col justify-between overflow-hidden group"
                            >
                                {/* Thumbnail Image & Badges */}
                                <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                                    {project.thumbnail ? (
                                        <img
                                            src={project.thumbnail}
                                            alt={project.title}
                                            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-cyan-950 via-slate-900 to-slate-950 text-cyan-400 font-semibold text-sm">
                                            <span>{project.title}</span>
                                        </div>
                                    )}

                                    {/* Gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                    {/* Top badges: Category & Item Type */}
                                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10">
                                        {project.category && (
                                            <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold border border-white/15 shadow-sm">
                                                {project.category.name}
                                            </span>
                                        )}

                                        <span
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center space-x-1 shadow-sm ${
                                                isDirect
                                                    ? 'bg-amber-500/90 text-white'
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

                                    {/* Bottom image overlay: Views count & YouTube indicator */}
                                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs text-white/90 z-10">
                                        <div className="flex items-center space-x-1.5 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/10 text-[11px]">
                                            <Eye className="h-3 w-3 text-cyan-400" />
                                            <span>{project.views_count.toLocaleString()} views</span>
                                        </div>

                                        {project.youtube_video_url && (
                                            <div className="flex items-center space-x-1 bg-red-600/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold shadow-sm">
                                                <Play className="h-3 w-3 fill-current" />
                                                <span>Demo Video</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content Details */}
                                <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                                    <div className="space-y-2">
                                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
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
                                                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                            {project.tech_stacks.length > 4 && (
                                                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500">
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
                                                className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-white dark:bg-slate-900/90 dark:hover:bg-amber-500 dark:hover:text-white text-slate-800 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200/60 dark:border-slate-800 hover:border-transparent group-hover:shadow-md"
                                            >
                                                <span>Visit Live Project</span>
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        ) : (
                                            <Link
                                                href={targetUrl}
                                                className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white dark:bg-slate-900/90 dark:hover:bg-cyan-500 dark:hover:text-slate-950 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200/60 dark:border-slate-800 hover:border-transparent group-hover:shadow-md"
                                            >
                                                <span>View Project Case Study</span>
                                                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
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
                    <div className="mt-14 text-center" data-aos="fade-up">
                        <Link
                            href="/works"
                            className="cv-btn-primary"
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
