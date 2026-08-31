import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    Code2,
    Layers,
    Play,
    Rocket,
    Shield,
    Sparkles,
    Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { AppSettings } from '@/types';

const TOTAL_FRAMES = 300;

export interface SurfaceHeroStats {
    projects_delivered?: number | string;
    client_satisfaction?: string;
    trustpilot_score?: string;
    total_reviews?: string;
    years_experience?: string;
}

export interface SurfaceHeroProps {
    settings?: AppSettings;
    stats?: SurfaceHeroStats;
    onOpenVideo?: () => void;
    isWhatsAppEnabled?: boolean;
}

export default function SurfaceHero({
    settings,
    stats,
    onOpenVideo,
    isWhatsAppEnabled,
}: SurfaceHeroProps) {
    const sectionRef = useRef<HTMLElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const framesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES + 1).fill(null));

    const targetFrameRef = useRef<number>(1);
    const currentFrameRef = useRef<number>(1);
    const isInitialFrameDrawnRef = useRef<boolean>(false);
    const animFrameIdRef = useRef<number | null>(null);

    const [loadedCount, setLoadedCount] = useState<number>(0);
    const [isLoaderHidden, setIsLoaderHidden] = useState<boolean>(false);
    const [scrollProgress, setScrollProgress] = useState<number>(0);

    const brandName = settings?.brand_name || 'CodeVenture Tech';
    const whatsappActive =
        isWhatsAppEnabled !== undefined
            ? isWhatsAppEnabled
            : settings?.whatsapp_enabled !== '0' && settings?.whatsapp_enabled !== false;

    const targetPhone = settings?.whatsapp_number || settings?.contact_phone || '+15552345678';
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        settings?.whatsapp_message_prompt || `Hello ${brandName}, I would like to discuss building a web platform.`
    )}`;

    // Generates 3-digit zero-padded frame paths (/images/frames/ezgif-frame-001.jpg)
    const getFrameUrl = (index: number) => {
        const paddedIndex = String(index).padStart(3, '0');
        return `/images/hero/ezgif-frame-${paddedIndex}.jpg`;
    };

    // Renders specified frame to canvas using image cover calculation
    const renderFrame = (frameIndex: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const safeIndex = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(frameIndex)));
        let img = framesRef.current[safeIndex];

        // Fallback to nearest preloaded frame if current frame image is downloading
        if (!img || !img.complete || img.naturalWidth === 0) {
            for (let offset = 1; offset <= 30; offset++) {
                const prev = safeIndex - offset;
                if (
                    prev >= 1 &&
                    framesRef.current[prev] &&
                    framesRef.current[prev]!.complete &&
                    framesRef.current[prev]!.naturalWidth > 0
                ) {
                    img = framesRef.current[prev];
                    break;
                }
                const next = safeIndex + offset;
                if (
                    next <= TOTAL_FRAMES &&
                    framesRef.current[next] &&
                    framesRef.current[next]!.complete &&
                    framesRef.current[next]!.naturalWidth > 0
                ) {
                    img = framesRef.current[next];
                    break;
                }
            }
        }

        if (!img || !img.complete || img.naturalWidth === 0) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cw = canvas.width;
        const ch = canvas.height;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;

        // Cover fit logic
        const scale = Math.max(cw / iw, ch / ih);
        const nw = iw * scale;
        const nh = ih * scale;
        const cx = (cw - nw) / 2;
        const cy = (ch - nh) / 2;

        ctx.drawImage(img, cx, cy, nw, nh);
    };

    // Handles Retina/High-DPI displays while ensuring canvas fits viewport
    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        renderFrame(Math.round(currentFrameRef.current));
    };

    // Update target frame based on sticky scroll container progress
    const updateTargetFrame = () => {
        const heroSection = sectionRef.current;
        if (!heroSection) return;

        const rect = heroSection.getBoundingClientRect();
        const scrollableDistance = heroSection.offsetHeight - window.innerHeight;

        if (scrollableDistance <= 0) return;

        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));
        setScrollProgress(progress);

        // Map progress (0.0 to 0.88) to frames (1 to 300).
        // The remaining progress (0.88 to 1.0) locks on frame 300 before unpinning to next section.
        const PLAYBACK_END_RATIO = 0.88;
        const normalizedProgress = Math.min(1, progress / PLAYBACK_END_RATIO);

        targetFrameRef.current = 1 + normalizedProgress * (TOTAL_FRAMES - 1);
    };

    useEffect(() => {
        let isMounted = true;

        // Priority 1: First frame for instant render
        const firstImg = new Image();
        firstImg.src = getFrameUrl(1);
        firstImg.onload = () => {
            if (!isMounted) return;
            framesRef.current[1] = firstImg;
            setLoadedCount((prev) => prev + 1);

            if (!isInitialFrameDrawnRef.current) {
                renderFrame(1);
                isInitialFrameDrawnRef.current = true;
            }
            startBatchLoading();
        };
        firstImg.onerror = () => {
            if (!isMounted) return;
            startBatchLoading();
        };

        // Priority 2: Asynchronous batch preloading for the remaining frames
        const startBatchLoading = () => {
            for (let i = 2; i <= TOTAL_FRAMES; i++) {
                const img = new Image();
                img.src = getFrameUrl(i);
                img.onload = () => {
                    if (!isMounted) return;
                    framesRef.current[i] = img;
                    setLoadedCount((prev) => prev + 1);
                };
                img.onerror = () => {
                    if (!isMounted) return;
                    setLoadedCount((prev) => prev + 1);
                };
            }
        };

        // Smooth Lerp Animation Loop
        const animate = () => {
            const delta = targetFrameRef.current - currentFrameRef.current;
            if (Math.abs(delta) > 0.001) {
                currentFrameRef.current += delta * 0.35;
                renderFrame(Math.round(currentFrameRef.current));
            }
            animFrameIdRef.current = requestAnimationFrame(animate);
        };

        const handleScroll = () => {
            updateTargetFrame();
        };

        const handleResize = () => {
            resizeCanvas();
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });

        // Initial setup
        resizeCanvas();
        updateTargetFrame();
        animFrameIdRef.current = requestAnimationFrame(animate);

        return () => {
            isMounted = false;
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            if (animFrameIdRef.current) {
                cancelAnimationFrame(animFrameIdRef.current);
            }
        };
    }, []);

    // Manage preloader fadeout
    const loadPercent = Math.min(100, Math.floor((loadedCount / TOTAL_FRAMES) * 100));
    useEffect(() => {
        if (loadPercent >= 100 || loadedCount >= 45) {
            const timer = setTimeout(() => {
                setIsLoaderHidden(true);
            }, 750);
            return () => clearTimeout(timer);
        }
    }, [loadPercent, loadedCount]);

    // Stage Visibility States
    const isCard1Visible = scrollProgress < 0.28;
    const isCard2Visible = scrollProgress >= 0.35 && scrollProgress < 0.70;
    const isScrollHintVisible = scrollProgress <= 0.03;

    return (
        <section
            id="hero-section"
            ref={sectionRef}
            className="relative bg-[#070b19] dark:bg-[#070b19] h-[450vh] sm:h-[500vh] select-none -mt-20"
        >
            {/* Sticky Screen Pinned Container */}
            <div
                id="hero-pin"
                className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-[#070b19] z-10"
            >
                {/* High-Performance Canvas Element */}
                <canvas
                    id="hero-canvas"
                    ref={canvasRef}
                    className="w-full h-full object-cover block pointer-events-none"
                />

                {/* Soft Ambient Vignette & Gradient Overlays for High-Contrast Readability */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#070b19]/85 via-transparent to-[#070b19] z-10" />
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-transparent via-[#070b19]/50 to-[#070b19]/95 z-10" />

                {/* Preloader Spinner & Progress */}
                {!isLoaderHidden && (
                    <div
                        className={`absolute inset-0 bg-[#070b19] flex flex-col items-center justify-center transition-opacity duration-700 z-30 pointer-events-none ${loadPercent >= 100 || loadedCount >= 45
                                ? 'opacity-0'
                                : 'opacity-100'
                            }`}
                    >
                        <div className="relative w-16 h-16 mb-4">
                            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
                            <div className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                            </div>
                        </div>
                        <span className="text-cyan-200/90 text-xs font-mono font-bold tracking-widest uppercase">
                            Loading Experience... {loadPercent}%
                        </span>
                    </div>
                )}

                {/* Hero Overlay Stage 1: Initial Brand & Agency Showcase */}
                <div
                    className={`absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-4xl transition-all duration-700 text-center ${isCard1Visible
                            ? 'opacity-100 scale-100 pointer-events-auto'
                            : 'opacity-0 scale-95 pointer-events-none'
                        }`}
                >

                    {/* Brand Headline */}
                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] mb-5 drop-shadow-2xl">
                        We Build{' '}
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                            High-Performance
                        </span>{' '}
                        <br className="hidden sm:inline" />
                        Web Platforms That Scale.
                    </h1>

                    {/* Brand Description */}
                    <p className="text-sm sm:text-base md:text-lg text-slate-200/95 font-normal leading-relaxed max-w-2xl mx-auto mb-8 drop-shadow-md">
                        {settings?.tagline ||
                            settings?.about_text ||
                            'Transforming complex visions into pristine, ultra-responsive digital software. From multi-tenant SaaS to interactive 3D web applications.'}
                    </p>

                    {/* Action CTAs */}
                    <div className="flex flex-wrap gap-4 justify-center items-center">
                        <Link
                            href="/works"
                            className="px-8 py-4 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-[length:200%_auto] hover:bg-right transition-all duration-500 shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 text-center"
                        >
                            <span>Explore Our Works ({stats?.projects_delivered || 15}+ Case Studies)</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>

                        {onOpenVideo ? (
                            <button
                                type="button"
                                onClick={onOpenVideo}
                                className="px-7 py-4 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider text-white border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 text-center shadow-sm"
                            >
                                <div className="h-6 w-6 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md">
                                    <Play className="h-3 w-3 fill-current ml-0.5" />
                                </div>
                                <span>Watch Showreel</span>
                            </button>
                        ) : (
                            <Link
                                href="/contact"
                                className="px-7 py-4 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider text-white border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-center"
                            >
                                <span>Get In Touch</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        )}
                    </div>

                    {/* Trust Badges / Stats Highlights */}
                    <div className="mt-8 pt-4 flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-xs font-semibold text-slate-300/90">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-cyan-400" />
                            <span>Sub-Second Page Speed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-emerald-400" />
                            <span>Enterprise Architecture</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Code2 className="h-4 w-4 text-indigo-400" />
                            <span>Laravel 12 &amp; React 19</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-amber-400" />
                            <span>{stats?.client_satisfaction || '99.4%'} Satisfaction</span>
                        </div>
                    </div>
                </div>

                {/* Hero Overlay Stage 2: Appears Mid-Scroll with Engineering Capabilities */}
                <div
                    className={`absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-4xl transition-all duration-700 text-center ${isCard2Visible
                            ? 'opacity-100 scale-100 pointer-events-auto'
                            : 'opacity-0 scale-95 pointer-events-none'
                        }`}
                >
                    {/* Headline */}
                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-tight mb-12 drop-shadow-2xl">
                        Architecting <br /> The Next Era of <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-cyan-300 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Digital Dominance
                        </span>
                    </h2>


                    {/* Feature Highlight Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                        <div className="p-5 rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 text-left hover:border-indigo-500/50 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2.5 font-bold text-xs">
                                01
                            </div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                SaaS Engineering
                            </h3>
                            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                                Multi-tenant architectures, real-time telemetry, and scalable subscription billing.
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 text-left hover:border-purple-500/50 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 mb-2.5 font-bold text-xs">
                                02
                            </div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                AI &amp; Smart Workspaces
                            </h3>
                            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                                Generative LLM streaming, vector embeddings, and custom workflow automations.
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 text-left hover:border-cyan-500/50 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2.5 font-bold text-xs">
                                03
                            </div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                3D &amp; Sub-Second Web
                            </h3>
                            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                                Interactive Three.js visualizers, 99+ Core Web Vitals, and extreme edge latency.
                            </p>
                        </div>
                    </div>

                    {/* Explore Link */}
                    <div className="flex flex-wrap justify-center items-center gap-4">
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/20"
                        >
                            <Rocket className="h-4 w-4" />
                            <span>Schedule Technical Discovery</span>
                        </Link>
                        <Link
                            href="/works"
                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider text-white bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                            <Layers className="h-4 w-4 text-cyan-400" />
                            <span>Browse Case Studies</span>
                        </Link>
                    </div>
                </div>

                {/* Scroll Indicator Hint */}
                <div
                    id="scroll-hint"
                    className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none transition-all duration-500 ${isScrollHintVisible
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-4'
                        }`}
                >
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-300/80 font-medium drop-shadow-md">
                        Scroll to explore
                    </span>
                    <div className="w-5 h-9 border-2 border-indigo-400/40 rounded-full flex justify-center p-1 backdrop-blur-md bg-slate-900/50 shadow-lg">
                        <div className="w-1.5 h-2.5 bg-cyan-400 rounded-full animate-bounce" />
                    </div>
                </div>
            </div>
        </section>
    );
}

export { SurfaceHero, SurfaceHero as HeroSection };
