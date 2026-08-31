import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from '@inertiajs/react';
import { 
    Code2, 
    ShieldCheck, 
    Headphones, 
    Copy, 
    Check, 
    Sparkles, 
    Terminal, 
    Bug,
    CheckCircle2,
    Zap,
    Lock,
    ArrowRight,
    Cpu,
    Activity,
    FileCheck2
} from 'lucide-react';
import { showToast } from '@/lib/swal';

export const PipelineFlowSection: React.FC = () => {
    const [copied, setCopied] = useState(false);
    const [email, setEmail] = useState('');
    const installCommand = 'curl -sSL https://app.codeventure.tech/install/v3 | bash';

    // DOM Refs for dynamic socket calculation
    const containerRef = useRef<HTMLDivElement>(null);
    const topSectionRef = useRef<HTMLDivElement>(null);
    const originRef = useRef<HTMLDivElement>(null);
    const card1InRef = useRef<HTMLDivElement>(null);
    const card1OutRef = useRef<HTMLDivElement>(null);
    const card2InRef = useRef<HTMLDivElement>(null);
    const card2OutRef = useRef<HTMLDivElement>(null);
    const card3InRef = useRef<HTMLDivElement>(null);

    // SVG Geometry and Path Refs
    const [svgSize, setSvgSize] = useState<{ width: number; height: number }>({ width: 1000, height: 1600 });
    const [path1Data, setPath1Data] = useState<string>('');
    const [path2Data, setPath2Data] = useState<string>('');
    const [path3Data, setPath3Data] = useState<string>('');

    const [path1Len, setPath1Len] = useState<number>(600);
    const [path2Len, setPath2Len] = useState<number>(600);
    const [path3Len, setPath3Len] = useState<number>(600);

    const path1Ref = useRef<SVGPathElement>(null);
    const path2Ref = useRef<SVGPathElement>(null);
    const path3Ref = useRef<SVGPathElement>(null);

    // Scroll Progress per individual path segment (0 to 1)
    const [p1Progress, setP1Progress] = useState<number>(0);
    const [p2Progress, setP2Progress] = useState<number>(0);
    const [p3Progress, setP3Progress] = useState<number>(0);

    // Dynamic Arrowhead positions & angles along the drawing path
    const [arrow1, setArrow1] = useState<{ x: number; y: number; angle: number } | null>(null);
    const [arrow2, setArrow2] = useState<{ x: number; y: number; angle: number } | null>(null);
    const [arrow3, setArrow3] = useState<{ x: number; y: number; angle: number } | null>(null);

    // Copy to clipboard
    const handleCopy = () => {
        navigator.clipboard.writeText(installCommand);
        setCopied(true);
        showToast('Install command copied to clipboard!', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    // Newsletter subscription
    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        showToast('Thank you! Our engineering team will reach out shortly.', 'success');
        setEmail('');
    };

    // Build orthogonal circuit path with rounded corners from point A to point B via a specific horizontal bus level
    const createRoutedOrthogonalPath = (
        pA: { x: number; y: number }, 
        pB: { x: number; y: number }, 
        busY: number,
        r: number = 20
    ) => {
        const goingLeft = pB.x < pA.x;
        const sign = goingLeft ? -1 : 1;
        const safeR = Math.min(r, Math.abs(pB.x - pA.x) / 2, Math.abs(busY - pA.y) / 2, Math.abs(pB.y - busY) / 2);

        return [
            `M ${pA.x} ${pA.y}`,
            `L ${pA.x} ${busY - safeR}`,
            `Q ${pA.x} ${busY}, ${pA.x + sign * safeR} ${busY}`,
            `L ${pB.x - sign * safeR} ${busY}`,
            `Q ${pB.x} ${busY}, ${pB.x} ${busY + safeR}`,
            `L ${pB.x} ${pB.y}`
        ].join(' ');
    };

    // Recalculate exact orthogonal paths connecting the staggered cards
    const updateGeometry = useCallback(() => {
        if (
            !containerRef.current || 
            !topSectionRef.current ||
            !originRef.current || 
            !card1InRef.current || 
            !card1OutRef.current || 
            !card2InRef.current || 
            !card2OutRef.current || 
            !card3InRef.current
        ) {
            return;
        }

        const cRect = containerRef.current.getBoundingClientRect();
        const topRect = topSectionRef.current.getBoundingClientRect();

        const getCenter = (el: HTMLElement) => {
            const r = el.getBoundingClientRect();
            return {
                x: r.left + r.width / 2 - cRect.left,
                y: r.top + r.height / 2 - cRect.top
            };
        };

        const originRect = originRef.current.getBoundingClientRect();
        // Pipe starts directly from the code card terminal bottom
        const pOrigin = {
            x: originRect.left + originRect.width / 2 - cRect.left,
            y: originRect.bottom - cRect.top
        };

        const p1In = getCenter(card1InRef.current);
        const p1Out = getCenter(card1OutRef.current);
        const p2In = getCenter(card2InRef.current);
        const p2Out = getCenter(card2OutRef.current);
        const p3In = getCenter(card3InRef.current);

        // Path 1 Bus Height: MUST be completely below the entire top section so it never overflows the left div/form
        const topSectionBottom = topRect.bottom - cRect.top;
        const busY1 = Math.max(topSectionBottom + 24, pOrigin.y + (p1In.y - pOrigin.y) * 0.65);

        // Path 2 Bus Height: Halfway between Card 1 bottom and Card 2 top
        const busY2 = p1Out.y + (p2In.y - p1Out.y) * 0.5;

        // Path 3 Bus Height: Halfway between Card 2 bottom and Card 3 top
        const busY3 = p2Out.y + (p3In.y - p2Out.y) * 0.5;

        // Path 1: From Code Card bottom -> Straight Down past top section -> Turn Left -> Down into Card 1 Top
        const d1 = createRoutedOrthogonalPath(pOrigin, p1In, busY1, 22);
        // Path 2: From Card 1 Bottom -> Straight Down -> Turn Right -> Down into Card 2 Top
        const d2 = createRoutedOrthogonalPath(p1Out, p2In, busY2, 22);
        // Path 3: From Card 2 Bottom -> Straight Down -> Turn Left -> Down into Card 3 Top
        const d3 = createRoutedOrthogonalPath(p2Out, p3In, busY3, 22);

        setSvgSize({ width: cRect.width, height: cRect.height });
        setPath1Data(d1);
        setPath2Data(d2);
        setPath3Data(d3);

        setTimeout(() => {
            if (path1Ref.current) setPath1Len(path1Ref.current.getTotalLength() || 600);
            if (path2Ref.current) setPath2Len(path2Ref.current.getTotalLength() || 600);
            if (path3Ref.current) setPath3Len(path3Ref.current.getTotalLength() || 600);
        }, 50);
    }, []);

    // Calculate dynamic segment progress based on when each target card approaches viewport
    const handleScroll = useCallback(() => {
        if (
            !originRef.current || 
            !card1InRef.current || 
            !card1OutRef.current || 
            !card2InRef.current || 
            !card2OutRef.current || 
            !card3InRef.current
        ) {
            return;
        }

        const vh = window.innerHeight;

        // Helper to calculate progress between a source element and target card
        // The pipe starts drawing when the source is scrolled into view (top 85% of screen)
        // and reaches 100% right when the target card arrives at the comfortable viewing zone (top 55% of screen)
        const calcProgress = (source: HTMLElement, target: HTMLElement) => {
            const sRect = source.getBoundingClientRect();
            const tRect = target.getBoundingClientRect();

            const startTrigger = vh * 0.85; // When source scrolls above 85% of viewport
            const endTrigger = vh * 0.55;   // When target card enters 55% of viewport

            const totalDist = tRect.top - sRect.top + (startTrigger - endTrigger);
            if (totalDist <= 0) return 1;

            const scrolledDist = startTrigger - sRect.top;
            return Math.max(0, Math.min(1, scrolledDist / totalDist));
        };

        const prog1 = calcProgress(originRef.current, card1InRef.current);
        const prog2 = calcProgress(card1OutRef.current, card2InRef.current);
        const prog3 = calcProgress(card2OutRef.current, card3InRef.current);

        setP1Progress(prog1);
        setP2Progress(prog2);
        setP3Progress(prog3);

        // Update Moving Arrowhead 1 along Path 1
        if (path1Ref.current && path1Len > 0 && prog1 > 0.02) {
            const curL = path1Len * prog1;
            const pt = path1Ref.current.getPointAtLength(curL);
            const ptNext = path1Ref.current.getPointAtLength(Math.min(curL + 2, path1Len));
            const angle = Math.atan2(ptNext.y - pt.y, ptNext.x - pt.x) * (180 / Math.PI);
            setArrow1({ x: pt.x, y: pt.y, angle });
        } else {
            setArrow1(null);
        }

        // Update Moving Arrowhead 2 along Path 2
        if (path2Ref.current && path2Len > 0 && prog2 > 0.02) {
            const curL = path2Len * prog2;
            const pt = path2Ref.current.getPointAtLength(curL);
            const ptNext = path2Ref.current.getPointAtLength(Math.min(curL + 2, path2Len));
            const angle = Math.atan2(ptNext.y - pt.y, ptNext.x - pt.x) * (180 / Math.PI);
            setArrow2({ x: pt.x, y: pt.y, angle });
        } else {
            setArrow2(null);
        }

        // Update Moving Arrowhead 3 along Path 3
        if (path3Ref.current && path3Len > 0 && prog3 > 0.02) {
            const curL = path3Len * prog3;
            const pt = path3Ref.current.getPointAtLength(curL);
            const ptNext = path3Ref.current.getPointAtLength(Math.min(curL + 2, path3Len));
            const angle = Math.atan2(ptNext.y - pt.y, ptNext.x - pt.x) * (180 / Math.PI);
            setArrow3({ x: pt.x, y: pt.y, angle });
        } else {
            setArrow3(null);
        }
    }, [path1Len, path2Len, path3Len]);

    useEffect(() => {
        updateGeometry();
        handleScroll();

        const onResize = () => {
            updateGeometry();
            handleScroll();
        };

        const onScroll = () => {
            requestAnimationFrame(handleScroll);
        };

        window.addEventListener('resize', onResize);
        window.addEventListener('scroll', onScroll, { passive: true });

        const observer = new ResizeObserver(() => {
            updateGeometry();
            handleScroll();
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        const timer = setTimeout(() => {
            updateGeometry();
            handleScroll();
        }, 200);

        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('scroll', onScroll);
            observer.disconnect();
            clearTimeout(timer);
        };
    }, [updateGeometry, handleScroll]);

    const isStep1Active = p1Progress >= 0.95;
    const isStep2Active = p2Progress >= 0.95;
    const isStep3Active = p3Progress >= 0.95;

    return (
        <section className="relative py-20 sm:py-28 overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-purple-500 selection:text-white transition-colors duration-300">
            {/* Ambient Lighting Orbs */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-gradient-to-tr from-purple-300/30 via-fuchsia-200/25 to-cyan-200/30 dark:from-purple-900/25 dark:via-fuchsia-900/15 dark:to-cyan-900/25 rounded-full blur-[160px] pointer-events-none" />
            <div className="absolute top-10 right-10 w-96 h-96 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-300/20 dark:bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                {/* Main Enclosing Showcase Card */}
                <div 
                    ref={containerRef}
                    className="rounded-3xl bg-white/95 dark:bg-[#070913]/90 border border-purple-200/80 dark:border-purple-500/25 p-6 sm:p-10 lg:p-14 shadow-2xl shadow-purple-500/5 dark:shadow-purple-950/50 relative overflow-hidden backdrop-blur-2xl transition-colors duration-300"
                >
                    {/* Corner Ambient Glows */}
                    <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-400/20 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-fuchsia-400/20 dark:bg-fuchsia-500/15 rounded-full blur-3xl pointer-events-none" />

                    {/* ========================================================================= */}
                    {/* ORTHOGONAL STEPPED CIRCUIT PIPELINE SVG OVERLAY                          */}
                    {/* ========================================================================= */}
                    {path1Data && (
                        <svg 
                            className="hidden md:block absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
                            viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
                            fill="none"
                        >
                            <defs>
                                <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#a855f7" />
                                    <stop offset="50%" stopColor="#d946ef" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>

                                <filter id="pipeGlowEffect" x="-30%" y="-30%" width="160%" height="160%">
                                    <feGaussianBlur stdDeviation="4" result="blur" />
                                    <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* 1. Base Inactive Ambient Circuit Lines */}
                            <path d={path1Data} stroke="currentColor" className="text-purple-200/50 dark:text-purple-950/40" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            <path d={path2Data} stroke="currentColor" className="text-purple-200/50 dark:text-purple-950/40" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            <path d={path3Data} stroke="currentColor" className="text-purple-200/50 dark:text-purple-950/40" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                            {/* 2. Dynamic Scroll-Drawn Circuit Pipeline 1 (IDE -> Card 1 Left) */}
                            <path
                                ref={path1Ref}
                                d={path1Data}
                                stroke="url(#circuitGrad)"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter="url(#pipeGlowEffect)"
                                style={{
                                    strokeDasharray: path1Len,
                                    strokeDashoffset: path1Len * (1 - p1Progress),
                                    transition: 'stroke-dashoffset 0.06s linear'
                                }}
                            />
                            {p1Progress > 0.05 && (
                                <path
                                    d={path1Data}
                                    stroke="#ffffff"
                                    strokeWidth="2"
                                    strokeDasharray="8 30"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="cv-wire-flow"
                                    style={{ strokeDashoffset: path1Len * (1 - p1Progress) }}
                                />
                            )}

                            {/* Moving Arrow 1 */}
                            {arrow1 && p1Progress > 0.02 && (
                                <g transform={`translate(${arrow1.x}, ${arrow1.y}) rotate(${arrow1.angle})`}>
                                    <circle cx="0" cy="0" r="14" fill="rgba(217, 70, 239, 0.25)" className="animate-ping" />
                                    <circle cx="0" cy="0" r="6" fill="#d946ef" filter="url(#pipeGlowEffect)" />
                                    <circle cx="0" cy="0" r="3" fill="#ffffff" />
                                    <path d="M 3 -6 L 14 0 L 3 6 Z" fill="#d946ef" filter="url(#pipeGlowEffect)" />
                                    <path d="M 3 -4 L 11 0 L 3 4 Z" fill="#ffffff" />
                                </g>
                            )}

                            {/* 3. Dynamic Circuit Pipeline 2 (Card 1 Bottom -> Card 2 Right Top) */}
                            {p2Progress > 0 && (
                                <>
                                    <path
                                        ref={path2Ref}
                                        d={path2Data}
                                        stroke="url(#circuitGrad)"
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        filter="url(#pipeGlowEffect)"
                                        style={{
                                            strokeDasharray: path2Len,
                                            strokeDashoffset: path2Len * (1 - p2Progress),
                                            transition: 'stroke-dashoffset 0.06s linear'
                                        }}
                                    />
                                    <path
                                        d={path2Data}
                                        stroke="#ffffff"
                                        strokeWidth="2"
                                        strokeDasharray="8 30"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="cv-wire-flow"
                                        style={{ strokeDashoffset: path2Len * (1 - p2Progress) }}
                                    />
                                </>
                            )}

                            {/* Moving Arrow 2 */}
                            {arrow2 && p2Progress > 0.02 && (
                                <g transform={`translate(${arrow2.x}, ${arrow2.y}) rotate(${arrow2.angle})`}>
                                    <circle cx="0" cy="0" r="14" fill="rgba(217, 70, 239, 0.25)" className="animate-ping" />
                                    <circle cx="0" cy="0" r="6" fill="#d946ef" filter="url(#pipeGlowEffect)" />
                                    <circle cx="0" cy="0" r="3" fill="#ffffff" />
                                    <path d="M 3 -6 L 14 0 L 3 6 Z" fill="#d946ef" filter="url(#pipeGlowEffect)" />
                                    <path d="M 3 -4 L 11 0 L 3 4 Z" fill="#ffffff" />
                                </g>
                            )}

                            {/* 4. Dynamic Circuit Pipeline 3 (Card 2 Bottom -> Card 3 Middle Top) */}
                            {p3Progress > 0 && (
                                <>
                                    <path
                                        ref={path3Ref}
                                        d={path3Data}
                                        stroke="url(#circuitGrad)"
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        filter="url(#pipeGlowEffect)"
                                        style={{
                                            strokeDasharray: path3Len,
                                            strokeDashoffset: path3Len * (1 - p3Progress),
                                            transition: 'stroke-dashoffset 0.06s linear'
                                        }}
                                    />
                                    <path
                                        d={path3Data}
                                        stroke="#ffffff"
                                        strokeWidth="2"
                                        strokeDasharray="8 30"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="cv-wire-flow"
                                        style={{ strokeDashoffset: path3Len * (1 - p3Progress) }}
                                    />
                                </>
                            )}

                            {/* Moving Arrow 3 */}
                            {arrow3 && p3Progress > 0.02 && (
                                <g transform={`translate(${arrow3.x}, ${arrow3.y}) rotate(${arrow3.angle})`}>
                                    <circle cx="0" cy="0" r="14" fill="rgba(217, 70, 239, 0.25)" className="animate-ping" />
                                    <circle cx="0" cy="0" r="6" fill="#d946ef" filter="url(#pipeGlowEffect)" />
                                    <circle cx="0" cy="0" r="3" fill="#ffffff" />
                                    <path d="M 3 -6 L 14 0 L 3 6 Z" fill="#d946ef" filter="url(#pipeGlowEffect)" />
                                    <path d="M 3 -4 L 11 0 L 3 4 Z" fill="#ffffff" />
                                </g>
                            )}
                        </svg>
                    )}

                    {/* ========================================================================= */}
                    {/* TOP SECTION: Split Hero Showcase & IDE Header                            */}
                    {/* ========================================================================= */}
                    <div 
                        ref={topSectionRef}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pb-14 relative z-10"
                    >
                        {/* Left Column: Headline & Action */}
                        <div className="lg:col-span-6 space-y-6" data-aos="fade-right">
                            {/* Pill Badge */}
                            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 text-xs font-bold tracking-wide shadow-sm">
                                <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 animate-pulse" />
                                <span>We're in High-Velocity Beta!</span>
                            </div>

                            {/* Main Title */}
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                                On-Demand Code Review from{' '}
                                <span className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-500 dark:from-purple-400 dark:via-fuchsia-300 dark:to-cyan-300 bg-clip-text text-transparent">
                                    Expert Engineers
                                </span>
                            </h2>

                            {/* Subtitle */}
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300/90 leading-relaxed max-w-xl">
                                Take your open source projects or enterprise platforms to the next level through continuous code telemetry and expert review. Reduce bugs, patch vulnerabilities, and ship rock-solid releases!
                            </p>

                            {/* Email Signup Form */}
                            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 max-w-md pt-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email address"
                                    required
                                    className="flex-1 px-4 py-3 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 dark:shadow-purple-900/40 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
                                >
                                    Sign Up
                                </button>
                            </form>

                            {/* Terminal Install Snippet Box */}
                            <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 max-w-md space-y-1.5 shadow-inner">
                                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                                    <span className="flex items-center space-x-1.5">
                                        <Terminal className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                        <span>Run this to install. No code changes needed.</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                        title="Copy install command"
                                    >
                                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                                <div className="font-mono text-[11px] text-purple-700 dark:text-purple-300 truncate bg-white dark:bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800/60 shadow-sm">
                                    https://app.codeventure.tech/brand/0f4030brand/0f4030
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Multi-Layer Glassmorphic IDE Showcase */}
                        <div className="lg:col-span-6 relative flex items-center justify-center min-h-[320px] sm:min-h-[380px]" data-aos="fade-left">
                            {/* Layer 1: Back glass card */}
                            <div className="absolute top-0 right-4 sm:right-12 w-[85%] h-52 rounded-2xl bg-gradient-to-br from-purple-500/10 to-slate-200/50 dark:from-purple-900/30 dark:to-slate-900/50 border border-purple-300/40 dark:border-purple-500/20 backdrop-blur-xl p-5 shadow-xl">
                                <div className="space-y-2.5 opacity-40">
                                    <div className="h-2 w-1/3 bg-purple-500/50 rounded-full" />
                                    <div className="h-2 w-3/4 bg-slate-400 dark:bg-slate-600 rounded-full" />
                                    <div className="h-2 w-1/2 bg-slate-400 dark:bg-slate-600 rounded-full" />
                                    <div className="h-2 w-2/3 bg-slate-400 dark:bg-slate-600 rounded-full" />
                                </div>
                            </div>

                            {/* Floating Top Badge */}
                            <div className="absolute top-2 left-6 sm:left-12 z-20 h-10 w-10 rounded-xl bg-purple-600/20 dark:bg-purple-600/30 border border-purple-400/50 flex items-center justify-center shadow-lg shadow-purple-500/20 backdrop-blur-md">
                                <Code2 className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                            </div>

                            {/* Layer 2: Main Floating Interactive IDE Terminal */}
                            <div className="relative z-10 w-full sm:w-[92%] rounded-2xl bg-slate-900 dark:bg-[#0a0c1a]/95 text-white border border-purple-500/30 dark:border-purple-500/40 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl shadow-purple-950/30 dark:shadow-purple-950/60 space-y-4">
                                {/* Window Traffic Light Header */}
                                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                    <div className="flex items-center space-x-1.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500/90" />
                                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/90" />
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/90" />
                                    </div>
                                    <span className="text-[10px] font-mono text-purple-300/80 flex items-center space-x-1">
                                        <Activity className="h-3 w-3 text-cyan-400 animate-pulse" />
                                        <span>pipeline.review.ts</span>
                                    </span>
                                </div>

                                {/* Synthetic Code Preview Lines */}
                                <div className="space-y-2 font-mono text-[11px] sm:text-xs">
                                    <div className="flex items-center space-x-2 text-slate-400">
                                        <span className="text-purple-400 font-bold">import</span>
                                        <span className="text-cyan-300">{`{ auditEngine }`}</span>
                                        <span className="text-purple-400 font-bold">from</span>
                                        <span className="text-emerald-300">'@codeventure/telemetry'</span>;
                                    </div>
                                    <div className="flex items-center space-x-2 text-slate-400 pl-3">
                                        <span className="text-fuchsia-400">const</span>
                                        <span className="text-amber-300">securityReport</span>
                                        <span>=</span>
                                        <span className="text-purple-400">await</span>
                                        <span className="text-cyan-300">auditEngine.inspect()</span>;
                                    </div>
                                    <div className="flex items-center space-x-2 text-emerald-400/90 pl-3">
                                        <span>// 0 Vulnerabilities • 100% Type Safe</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-slate-400 pl-3">
                                        <span className="text-purple-400">return</span>
                                        <span className="text-cyan-300">securityReport.approveDeployment()</span>;
                                    </div>
                                </div>

                                {/* Bottom Pill Output Node (Pipe Starts Directly Here from Code Card) */}
                                <div 
                                    ref={originRef}
                                    className="flex items-center justify-between pt-3 border-t border-slate-800/90 relative"
                                >
                                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/90 border border-purple-500/50 text-[10px] font-mono text-purple-300 shadow-md">
                                        <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                                        <span>codeventure.io</span>
                                    </div>

                                    {/* PIPELINE VERIFIED ORIGIN SOCKET */}
                                    <div className="relative flex items-center">
                                        <div className="px-3.5 py-1.5 rounded-full bg-purple-950/90 dark:bg-purple-950/90 border border-purple-400/80 text-[10px] font-bold text-purple-200 flex items-center space-x-1.5 shadow-lg shadow-purple-950/50 cursor-default">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                                            <span>Pipeline Verified</span>
                                            <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping ml-0.5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* STAGGERED STEP CARDS: STEP 01 (LEFT) -> STEP 02 (RIGHT) -> STEP 03 (MID)  */}
                    {/* ========================================================================= */}
                    <div className="space-y-24 sm:space-y-36 pt-4 relative z-10">

                        {/* ----------------------------------------------------------------- */}
                        {/* STEP 01: LEFT CARD (Bug & Deep Code Review)                       */}
                        {/* ----------------------------------------------------------------- */}
                        <div className="grid grid-cols-1 lg:grid-cols-12">
                            <div className="lg:col-span-7 lg:col-start-1" data-aos="fade-right">
                                <div className={`rounded-3xl bg-white/95 dark:bg-[#0c0e22]/95 border-2 p-6 sm:p-8 relative shadow-xl transition-all duration-500 group ${
                                    isStep1Active 
                                        ? 'border-purple-500 dark:border-purple-400 shadow-purple-500/20 dark:shadow-purple-950/60 scale-[1.01]' 
                                        : 'border-slate-200 dark:border-purple-500/25'
                                }`}>
                                    {/* Top Center Input Port Socket (Pipe Entry) */}
                                    <div 
                                        ref={card1InRef} 
                                        className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center space-x-2 px-3 py-0.5 rounded-full bg-purple-600 text-[10px] font-mono font-bold text-white shadow-md shadow-purple-600/50"
                                    >
                                        <span className={`h-1.5 w-1.5 rounded-full ${isStep1Active ? 'bg-emerald-300 animate-ping' : 'bg-white'}`} />
                                        <span>PIPE IN • 01</span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800/80">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform flex-shrink-0">
                                                <Bug className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-[11px] font-mono font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                                                        Step 01 / Core Static Audit
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                                                        Automated & Manual
                                                    </span>
                                                </div>
                                                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                                                    Bug & Deep Code Review
                                                </h3>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-300/90 leading-relaxed">
                                        Vetted expert professional engineers review, refactor, and harden your codebase for maximum velocity. We perform thorough AST static code analysis, optimize resource bottlenecks, and ensure 100% type safety.
                                    </p>

                                    {/* Feature Badges Grid */}
                                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                                        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                            <span>0 False Positives</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <FileCheck2 className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                            <span>Type Safety Audit</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <Cpu className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                                            <span>Memory & AST Tuning</span>
                                        </div>
                                    </div>

                                    {/* Bottom Center Output Port Socket (Pipe Exit) */}
                                    <div 
                                        ref={card1OutRef}
                                        className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-slate-900 dark:bg-purple-950 border border-purple-400 text-[10px] font-mono text-purple-300 shadow-lg"
                                    >
                                        <span className={`h-2 w-2 rounded-full ${isStep1Active ? 'bg-cyan-400 animate-ping' : 'bg-purple-400'}`} />
                                        <span>PIPE OUT • 01</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ----------------------------------------------------------------- */}
                        {/* STEP 02: RIGHT CARD (Security Assessment & Pen-Test)              */}
                        {/* ----------------------------------------------------------------- */}
                        <div className="grid grid-cols-1 lg:grid-cols-12">
                            <div className="lg:col-span-7 lg:col-start-6" data-aos="fade-left">
                                <div className={`rounded-3xl bg-gradient-to-br from-purple-50/90 via-white/95 to-fuchsia-50/80 dark:from-purple-950/40 dark:via-[#0c0e22]/95 dark:to-[#0c0e22]/95 border-2 p-6 sm:p-8 relative shadow-2xl transition-all duration-500 group ${
                                    isStep2Active
                                        ? 'border-fuchsia-500 dark:border-fuchsia-400 shadow-fuchsia-500/20 dark:shadow-purple-900/60 scale-[1.01]'
                                        : 'border-fuchsia-300/80 dark:border-fuchsia-500/40'
                                }`}>
                                    {/* Top Center Input Port Socket (Pipe Entry) */}
                                    <div 
                                        ref={card2InRef}
                                        className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center space-x-2 px-3 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-600 to-pink-600 text-[10px] font-mono font-bold text-white shadow-md shadow-fuchsia-600/50"
                                    >
                                        <span className={`h-1.5 w-1.5 rounded-full ${isStep2Active ? 'bg-emerald-300 animate-ping' : 'bg-white'}`} />
                                        <span>PIPE IN • 02</span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-fuchsia-200/60 dark:border-purple-500/20">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-500 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-fuchsia-500/40 group-hover:scale-105 transition-transform flex-shrink-0">
                                                <ShieldCheck className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-[11px] font-mono font-black text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-wider">
                                                        Step 02 / Zero-Day Defense
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-full bg-fuchsia-100 dark:bg-fuchsia-950/80 text-fuchsia-700 dark:text-fuchsia-300 text-[10px] font-black uppercase tracking-wider">
                                                        ⚡ Direct Active Shield
                                                    </span>
                                                </div>
                                                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-300 transition-colors">
                                                    Security Assessment & Pen-Test
                                                </h3>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-300/90 leading-relaxed">
                                        Experienced cybersecurity analysts and red-team engineers pen-test your project for zero-day vulnerabilities, API authentication exploits, SQL injections, and sensitive credential leaks before deploying to production.
                                    </p>

                                    {/* Feature Badges Grid */}
                                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-purple-500/20">
                                        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <Lock className="h-4 w-4 text-fuchsia-500 flex-shrink-0" />
                                            <span>OWASP Top 10 Guard</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                            <span>SOC-2 Compliance</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <Zap className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                            <span>Secret Leak Shield</span>
                                        </div>
                                    </div>

                                    {/* Bottom Center Output Port Socket (Pipe Exit) */}
                                    <div 
                                        ref={card2OutRef}
                                        className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-slate-900 dark:bg-purple-950 border border-fuchsia-400 text-[10px] font-mono text-fuchsia-300 shadow-lg"
                                    >
                                        <span className={`h-2 w-2 rounded-full ${isStep2Active ? 'bg-cyan-400 animate-ping' : 'bg-fuchsia-400'}`} />
                                        <span>PIPE OUT • 02</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ----------------------------------------------------------------- */}
                        {/* STEP 03: MIDDLE CARD (Real-Time Architectural Support)            */}
                        {/* ----------------------------------------------------------------- */}
                        <div className="max-w-3xl mx-auto" data-aos="fade-up">
                            <div className={`rounded-3xl bg-white/95 dark:bg-[#0c0e22]/95 border-2 p-6 sm:p-8 relative shadow-2xl transition-all duration-500 group ${
                                isStep3Active
                                    ? 'border-cyan-400 dark:border-cyan-400 shadow-cyan-500/20 dark:shadow-cyan-950/50 scale-[1.01]'
                                    : 'border-cyan-200 dark:border-cyan-500/30'
                            }`}>
                                {/* Top Center Input Port Socket (Pipe Entry) */}
                                <div 
                                    ref={card3InRef}
                                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center space-x-2 px-4 py-0.5 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 text-[10px] font-mono font-bold text-white shadow-md shadow-cyan-600/50"
                                >
                                    <span className={`h-1.5 w-1.5 rounded-full ${isStep3Active ? 'bg-emerald-300 animate-ping' : 'bg-white'}`} />
                                    <span>PIPE IN • 03 (TERMINAL NODE)</span>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800/80">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform flex-shrink-0">
                                            <Headphones className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-[11px] font-mono font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                                                    Step 03 / Senior Guidance
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold">
                                                    Direct Lead SLA
                                                </span>
                                            </div>
                                            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                                                Real-Time Architectural Support
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300/90 leading-relaxed">
                                    Get instant architectural guidance and unblock complex cloud infrastructure barriers. Our senior principal architects conduct live pair-debugging, infrastructure reviews, and roadmap planning whenever your team hits an impasse.
                                </p>

                                {/* Feature Badges Grid */}
                                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                                    <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        <Zap className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                        <span>&lt; 15-Min Response SLA</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        <Code2 className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                                        <span>Live Pair-Debugging</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                        <span>Dedicated Staff Lead</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* BOTTOM ACTION FOOTER                                                      */}
                    {/* ========================================================================= */}
                    <div className="mt-20 pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400 relative z-10">
                        <div className="flex items-center space-x-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                            <span className="font-medium">100% Automated Code Telemetry & Human Senior Architectural Review</span>
                        </div>

                        <Link
                            href="/custom-orders/request"
                            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 dark:bg-purple-600/20 dark:hover:bg-purple-600/30 border border-purple-400/40 text-purple-700 dark:text-purple-200 font-bold hover:text-purple-900 dark:hover:text-white transition-all hover:scale-105 shadow-sm"
                        >
                            <span>Request Architecture Review</span>
                            <ArrowRight className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};
