import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Portfolio } from '@/types';
import { SurfaceLayout } from '@/layouts/surface-layout';
import { MasonryGallery } from '@/components/surface/masonry-gallery';
import { YouTubeModal } from '@/components/surface/youtube-modal';
import {
    ArrowLeft,
    ExternalLink,
    Play,
    Calendar,
    User,
    Eye,
    Tag,
    Share2,
    CheckCircle2,
    Layers,
    Code,
    Sparkles,
    ArrowRight
} from 'lucide-react';
import { showToast } from '@/lib/swal';

interface WorkDetailProps {
    portfolio: Portfolio;
    relatedPortfolios: Portfolio[];
}

export default function WorkDetail({ portfolio, relatedPortfolios }: WorkDetailProps) {
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    const handleShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            showToast('Project link copied to clipboard!', 'success');
        }
    };

    // Helper for embedded YouTube
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    const youtubeId = portfolio.youtube_video_url ? getYouTubeId(portfolio.youtube_video_url) : null;

    return (
        <SurfaceLayout
            title={portfolio.title}
            description={portfolio.short_description || `Case study for ${portfolio.title}`}
        >
            {/* Top Back Navigation Bar */}
            <div className="bg-slate-900/30 dark:bg-slate-950/60 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <Link
                        href="/works"
                        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to All Works</span>
                    </Link>

                    <button
                        onClick={handleShare}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Share Case Study</span>
                    </button>
                </div>
            </div>

            {/* Project Header Hero */}
            <section className="py-16 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Meta & Title */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="flex flex-wrap items-center gap-2">
                                {portfolio.category && (
                                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20 text-xs font-bold">
                                        {portfolio.category.name}
                                    </span>
                                )}
                                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center space-x-1">
                                    <Eye className="h-3.5 w-3.5 text-cyan-400" />
                                    <span>{portfolio.views_count.toLocaleString()} visits tracked</span>
                                </span>
                            </div>

                            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                                {portfolio.title}
                            </h1>

                            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                                {portfolio.short_description}
                            </p>

                            {/* Project Attributes Table */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                {portfolio.client_name && (
                                    <div>
                                        <div className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-300 font-bold">Client</div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{portfolio.client_name}</div>
                                    </div>
                                )}
                                {portfolio.completion_date && (
                                    <div>
                                        <div className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-300 font-bold">Delivered</div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{portfolio.completion_date}</div>
                                    </div>
                                )}
                                <div>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Client</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{portfolio.client_name || 'Confidential Client'}</span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Release Year</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{portfolio.completed_year || '2026'}</span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Platform SLA</span>
                                    <span className="text-sm font-semibold text-emerald-500 font-mono">99.9% Uptime</span>
                                </div>
                            </div>

                            {/* Action CTAs */}
                            <div className="pt-2 flex flex-wrap items-center gap-4">
                                {portfolio.project_url && (
                                    <a
                                        href={portfolio.project_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-500/25"
                                    >
                                        <span>Visit Live Website / App</span>
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                )}
                                {portfolio.demo_url && (
                                    <a
                                        href={portfolio.demo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-all shadow-sm"
                                    >
                                        <span>Interactive Demo</span>
                                        <Play className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Large Featured Mockup */}
                        <div className="lg:col-span-6" data-aos="fade-left">
                            <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-950">
                                {portfolio.featured_image ? (
                                    <img
                                        src={portfolio.featured_image}
                                        alt={portfolio.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="aspect-[4/3] flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                                        <Layers className="h-16 w-16 mb-2 text-indigo-400" />
                                        <span className="text-sm font-bold">High Precision Engineering View</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Embedded YouTube Video (if attached) */}
            {youtubeId && (
                <section className="py-12 bg-slate-900/30 dark:bg-slate-950/40">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center space-x-2">
                            <Play className="h-5 w-5 text-red-500 fill-current" />
                            <span>Interactive Video Walkthrough</span>
                        </h3>
                        <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                            <iframe
                                src={`https://www.youtube.com/embed/${youtubeId}`}
                                title={portfolio.title}
                                className="absolute inset-0 h-full w-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* Deep Description & Tech Stack Overview */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    {/* Full HTML Description */}
                    {portfolio.description && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                Architectural Overview & Engineering Details
                            </h2>
                            <div
                                className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: portfolio.description }}
                            />
                        </div>
                    )}

                    {/* Tech Stacks Grid */}
                    {portfolio.tech_stacks && portfolio.tech_stacks.length > 0 && (
                        <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                            <div className="flex items-center space-x-2">
                                <Code className="h-5 w-5 text-cyan-400" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Technologies & Frameworks Utilized
                                </h3>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                {portfolio.tech_stacks.map((tech, idx) => (
                                    <div
                                        key={idx}
                                        className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm"
                                    >
                                        {tech}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Masonry Image Gallery */}
                    {portfolio.gallery_images && portfolio.gallery_images.length > 0 && (
                        <MasonryGallery
                            images={portfolio.gallery_images}
                            projectTitle={portfolio.title}
                        />
                    )}
                </div>
            </section>

            {/* Related Projects Carousel */}
            {relatedPortfolios && relatedPortfolios.length > 0 && (
                <section className="py-16 bg-slate-50/70 dark:bg-slate-950/40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                                Related Projects
                            </h3>
                            <Link href="/works" className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline">
                                View All
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedPortfolios.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/works/${item.slug}`}
                                    className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all"
                                >
                                    <div className="aspect-[16/10] overflow-hidden bg-slate-950">
                                        {item.thumbnail && (
                                            <img
                                                src={item.thumbnail}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        )}
                                    </div>
                                    <div className="p-4 space-y-1">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-slate-500 line-clamp-1">
                                            {item.short_description}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Video Modal */}
            <YouTubeModal
                videoUrl={portfolio.youtube_video_url}
                isOpen={isVideoOpen}
                onClose={() => setIsVideoOpen(false)}
            />
        </SurfaceLayout>
    );
}
