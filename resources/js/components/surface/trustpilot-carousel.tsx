import React, { useState, useEffect } from 'react';
import { Review, AppSettings } from '@/types';
import { Star, ShieldCheck, ChevronLeft, ChevronRight, Quote, ArrowUpRight } from 'lucide-react';

interface TrustpilotCarouselProps {
    reviews: Review[];
    settings?: AppSettings;
}

export const TrustpilotCarousel: React.FC<TrustpilotCarouselProps> = ({ reviews, settings }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoplay, setIsAutoplay] = useState(true);

    const trustpilotScore = settings?.trustpilot_score || '4.9';
    const trustpilotCount = settings?.trustpilot_reviews_count || '140+';
    const trustpilotUrl = settings?.trustpilot_url || 'https://www.trustpilot.com';

    useEffect(() => {
        if (!isAutoplay || reviews.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % reviews.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isAutoplay, reviews.length]);

    if (reviews.length === 0) return null;

    const currentReview = reviews[currentIndex];

    return (
        <section className="relative py-24 overflow-hidden border-t border-slate-200/60 dark:border-cyan-500/10">
            {/* Background ambient lighting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header & Trustpilot Rating Pill */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12" data-aos="fade-up">
                    <div>
                        <div className="cv-badge mb-3.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Verified Client Feedback</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                            Trusted by High-Growth Teams Worldwide
                        </h2>
                    </div>

                    {/* Trustpilot Score Badge */}
                    <a
                        href={trustpilotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 md:mt-0 inline-flex items-center space-x-3 p-3 rounded-2xl cv-card shadow-sm hover:border-emerald-500 transition-all group"
                    >
                        <div className="flex items-center space-x-1 text-emerald-500">
                            <Star className="h-5 w-5 fill-current" />
                            <span className="font-bold text-sm text-slate-900 dark:text-white">Trustpilot</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-4 w-4 bg-emerald-500 rounded-sm flex items-center justify-center text-[10px] text-white">
                                    ★
                                </div>
                            ))}
                        </div>
                        <div className="text-xs">
                            <span className="font-bold text-slate-900 dark:text-white">{trustpilotScore}</span>
                            <span className="text-slate-500 dark:text-slate-400"> / 5.0 ({trustpilotCount} reviews)</span>
                        </div>
                        <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    </a>
                </div>

                {/* Main Carousel Card */}
                <div
                    data-aos="fade-up"
                    className="cv-card relative rounded-3xl p-8 sm:p-12 shadow-xl border-cyan-500/20"
                    onMouseEnter={() => setIsAutoplay(false)}
                    onMouseLeave={() => setIsAutoplay(true)}
                >
                    <Quote className="absolute top-8 right-8 h-20 w-20 text-slate-200/50 dark:text-cyan-500/10 pointer-events-none" />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        {/* Review Content */}
                        <div className="lg:col-span-8 space-y-5">
                            {/* Stars */}
                            <div className="flex items-center space-x-1.5">
                                {[...Array(currentReview.rating)].map((_, i) => (
                                    <div key={i} className="h-5 w-5 bg-emerald-500 rounded flex items-center justify-center text-xs text-white">
                                        ★
                                    </div>
                                ))}
                                <span className="ml-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                    Verified Project
                                </span>
                            </div>

                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                                "{currentReview.review_title}"
                            </h3>

                            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                                {currentReview.review_text}
                            </p>

                            {/* Author details */}
                            <div className="flex items-center space-x-4 pt-4 border-t border-slate-200/60 dark:border-cyan-500/10">
                                {currentReview.author_avatar ? (
                                    <img
                                        src={currentReview.author_avatar}
                                        alt={currentReview.author_name}
                                        className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-500/30"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-base">
                                        {currentReview.author_name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">
                                        {currentReview.author_name}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {currentReview.author_role} {currentReview.company ? `• ${currentReview.company}` : ''}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation and Thumbnails */}
                        <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-between space-y-6">
                            {/* Controls */}
                            <div className="flex items-center space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1))}
                                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200/60 dark:border-cyan-500/20 text-slate-700 dark:text-slate-200 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95"
                                    aria-label="Previous review"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentIndex((prev) => (prev + 1) % reviews.length)}
                                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200/60 dark:border-cyan-500/20 text-slate-700 dark:text-slate-200 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95"
                                    aria-label="Next review"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Indicator Dots */}
                            <div className="flex items-center space-x-2">
                                {reviews.map((_, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`h-2.5 rounded-full transition-all duration-300 ${
                                            idx === currentIndex
                                                ? 'w-8 bg-emerald-500'
                                                : 'w-2.5 bg-slate-300 dark:bg-slate-800 hover:bg-slate-400'
                                        }`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
