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
    FileCheck2,
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

    // SVG Geometry and Path State
    const [svgSize, setSvgSize] = useState<{ width: number; height: number }>({ width: 1000, height: 1600 });
    const [path1Data, setPath1Data] = useState<string>('');
    const [path2Data, setPath2Data] = useState<string>('');
    const [path3Data, setPath3Data] = useState<string>('');

    const [card1TargetPos, setCard1TargetPos] = useState<{ x: number; y: number } | null>(null);
    const [card2TargetPos, setCard2TargetPos] = useState<{ x: number; y: number } | null>(null);
    const [card3TargetPos, setCard3TargetPos] = useState<{ x: number; y: number } | null>(null);

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

    // Build orthogonal circuit path with rounded corners from point A to point B
    const createRoutedOrthogonalPath = (
        pA: { x: number; y: number }, 
        pB: { x: number; y: number }, 
        busY: number,
        r: number = 24
    ) => {
        const dx = pB.x - pA.x;

        // If horizontally aligned (< 8px difference), render a straight clean vertical pipe
        if (Math.abs(dx) < 8) {
            return `M ${pA.x} ${pA.y} L ${pA.x} ${pB.y}`;
        }

        const goingLeft = dx < 0;
        const sign = goingLeft ? -1 : 1;
        const safeR = Math.max(0, Math.min(r, Math.abs(dx) / 2, Math.abs(busY - pA.y) / 2, Math.abs(pB.y - busY) / 2));

        if (safeR < 2) {
            return `M ${pA.x} ${pA.y} L ${pA.x} ${busY} L ${pB.x} ${busY} L ${pB.x} ${pB.y}`;
        }

        return [
            `M ${pA.x} ${pA.y}`,
            `L ${pA.x} ${busY - safeR}`,
            `Q ${pA.x} ${busY}, ${pA.x + sign * safeR} ${busY}`,
            `L ${pB.x - sign * safeR} ${busY}`,
            `Q ${pB.x} ${busY}, ${pB.x} ${busY + safeR}`,
            `L ${pB.x} ${pB.y}`
        ].join(' ');
    };

    // Recalculate exact orthogonal paths connecting the cards
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

        const pOrigin = getCenter(originRef.current);
        const p1In = getCenter(card1InRef.current);
        const p1Out = getCenter(card1OutRef.current);
        const p2In = getCenter(card2InRef.current);
        const p2Out = getCenter(card2OutRef.current);
        const p3In = getCenter(card3InRef.current);

        setCard1TargetPos({ x: p1In.x, y: p1In.y });
        setCard2TargetPos({ x: p2In.x, y: p2In.y });
        setCard3TargetPos({ x: p3In.x, y: p3In.y });

        // Path 1 Bus Height: Below top section to prevent any text or element overlap
        const topSectionBottom = topRect.bottom - cRect.top;
        const busY1 = Math.max(topSectionBottom + 20, pOrigin.y + (p1In.y - pOrigin.y) * 0.45);

        // Path 2 Bus Height: Halfway between Card 1 bottom and Card 2 top
        const busY2 = p1Out.y + (p2In.y - p1Out.y) * 0.5;

        // Path 3 Bus Height: Halfway between Card 2 bottom and Card 3 top
        const busY3 = p2Out.y + (p3In.y - p2Out.y) * 0.5;

        const d1 = createRoutedOrthogonalPath(pOrigin, p1In, busY1, 24);
        const d2 = createRoutedOrthogonalPath(p1Out, p2In, busY2, 24);
        const d3 = createRoutedOrthogonalPath(p2Out, p3In, busY3, 24);

        setSvgSize({ width: cRect.width, height: cRect.height });
        setPath1Data(d1);
        setPath2Data(d2);
        setPath3Data(d3);

        setTimeout(() => {
            if (path1Ref.current) setPath1Len(path1Ref.current.getTotalLength() || 600);
            if (path2Ref.current) setPath2Len(path2Ref.current.getTotalLength() || 600);
            if (path3Ref.current) setPath3Len(path3Ref.current.getTotalLength() || 600);
        }, 40);
    }, []);

    // Calculate dynamic segment progress based on viewport scroll
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

        // Helper to calculate progress between source and target socket
        const calcProgress = (source: HTMLElement, target: HTMLElement) => {
            const sRect = source.getBoundingClientRect();
            const tRect = target.getBoundingClientRect();

            const startTrigger = vh * 0.85; // Source enters viewport
            const endTrigger = vh * 0.55;   // Target arrives in comfortable viewing area

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
    }, []);

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
        }, 150);

        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('scroll', onScroll);
            observer.disconnect();
            clearTimeout(timer);
        };
    }, [updateGeometry, handleScroll]);

    const isStep1Active = p1Progress >= 0.92;
    const isStep2Active = p2Progress >= 0.92;
    const isStep3Active = p3Progress >= 0.92;

    return (
        <section className="relative py-16 sm:py-24 lg:py-28 overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-purple-500 selection:text-white transition-colors duration-300">
            {/* Ambient Lighting Orbs */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] lg:w-[1000px] h-[500px] lg:h-[700px] bg-gradient-to-tr from-purple-300/30 via-fuchsia-200/25 to-cyan-200/30 dark:from-purple-900/25 dark:via-fuchsia-900/15 dark:to-cyan-900/25 rounded-full blur-[140px] lg:blur-[180px] pointer-events-none" />
            <div className="absolute top-10 right-10 w-72 sm:w-96 h-72 sm:h-96 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-300/20 dark:bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                {/* Main Enclosing Showcase Card */}
                <div 
                    ref={containerRef}
                    className="rounded-3xl bg-white/95 dark:bg-[#070913]/90 border border-purple-200/80 dark:border-purple-500/25 p-5 sm:p-8 lg:p-12 shadow-2xl shadow-purple-500/5 dark:shadow-purple-950/50 relative overflow-hidden backdrop-blur-2xl transition-colors duration-300"
                >
                    {/* Corner Ambient Glows */}
                    <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-400/20 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-fuchsia-400/20 dark:bg-fuchsia-500/15 rounded-full blur-3xl pointer-events-none" />

                    {/* ========================================================================= */}
                    {/* ORTHOGONAL STEPPED CIRCUIT PIPELINE SVG OVERLAY (ALL DEVICES)             */}
                    {/* ========================================================================= */}
                    {path1Data && (
                        <svg 
                            className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
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
                                    <feGaussianBlur stdDeviation="3.5" result="blur" />
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

                            {/* 2. Dynamic Circuit Pipeline 1 (Code Editor -> Card 1) */}
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
                                    strokeDasharray="8 26"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="cv-wire-flow"
                                    style={{ strokeDashoffset: path1Len * (1 - p1Progress) }}
                                />
                            )}

                            {/* Downward Arrow 1 (Fixed Downward at Card 1 Input) */}
                            {card1TargetPos && (
                                <g transform={`translate(${card1TargetPos.x}, ${card1TargetPos.y - 10})`}>
                                    {isStep1Active && (
                                        <circle cx="0" cy="0" r="14" fill="rgba(217, 70, 239, 0.25)" className="animate-ping" />
                                    )}
                                    <path
                                        d="M -6 -3 L 0 5 L 6 -3 Z"
                                        fill={isStep1Active ? "#d946ef" : "#a855f7"}
                                        filter="url(#pipeGlowEffect)"
                                    />
                                    <path
                                        d="M -4 -2 L 0 4 L 4 -2 Z"
                                        fill="#ffffff"
                                    />
                                </g>
                            )}

                            {/* 3. Dynamic Circuit Pipeline 2 (Card 1 -> Card 2) */}
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
                                        strokeDasharray="8 26"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="cv-wire-flow"
                                        style={{ strokeDashoffset: path2Len * (1 - p2Progress) }}
                                    />
                                </>
                            )}

                            {/* Downward Arrow 2 (Fixed Downward at Card 2 Input) */}
                            {card2TargetPos && (
                                <g transform={`translate(${card2TargetPos.x}, ${card2TargetPos.y - 10})`}>
                                    {isStep2Active && (
                                        <circle cx="0" cy="0" r="14" fill="rgba(217, 70, 239, 0.25)" className="animate-ping" />
                                    )}
                                    <path
                                        d="M -6 -3 L 0 5 L 6 -3 Z"
                                        fill={isStep2Active ? "#d946ef" : "#a855f7"}
                                        filter="url(#pipeGlowEffect)"
                                    />
                                    <path
                                        d="M -4 -2 L 0 4 L 4 -2 Z"
                                        fill="#ffffff"
                                    />
                                </g>
                            )}

                            {/* 4. Dynamic Circuit Pipeline 3 (Card 2 -> Card 3) */}
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
                                        strokeDasharray="8 26"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="cv-wire-flow"
                                        style={{ strokeDashoffset: path3Len * (1 - p3Progress) }}
                                    />
                                </>
                            )}

                            {/* Downward Arrow 3 (Fixed Downward at Card 3 Input) */}
                            {card3TargetPos && (
                                <g transform={`translate(${card3TargetPos.x}, ${card3TargetPos.y - 10})`}>
                                    {isStep3Active && (
                                        <circle cx="0" cy="0" r="14" fill="rgba(217, 70, 239, 0.25)" className="animate-ping" />
                                    )}
                                    <path
                                        d="M -6 -3 L 0 5 L 6 -3 Z"
                                        fill={isStep3Active ? "#d946ef" : "#a855f7"}
                                        filter="url(#pipeGlowEffect)"
                                    />
                                    <path
                                        d="M -4 -2 L 0 4 L 4 -2 Z"
                                        fill="#ffffff"
                                    />
                                </g>
                            )}
                        </svg>
                    )}

                    {/* ========================================================================= */}
                    {/* TOP SECTION: Split Hero Showcase & IDE Header                            */}
                    {/* ========================================================================= */}
                    <div 
                        ref={topSectionRef}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center pb-12 sm:pb-16 relative z-10"
                    >
                        {/* Left Column: Headline & Action */}
                        <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-left" data-aos="fade-right">
                            {/* Pill Badge */}
                            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-100/90 dark:bg-purple-950/80 border border-purple-300/80 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 text-xs font-bold tracking-wide shadow-sm">
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
                            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 max-w-md pt-1">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your work email address"
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
                            <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 max-w-md space-y-2 shadow-inner">
                                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                                    <span className="flex items-center space-x-1.5">
                                        <Terminal className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                        <span className="font-medium">Run this to install. No code changes needed.</span>
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
                                <div className="font-mono text-[11px] text-purple-700 dark:text-purple-300 truncate bg-white dark:bg-slate-950/90 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800/70 shadow-sm flex items-center space-x-2">
                                    <span className="text-slate-400 select-none font-bold">$</span>
                                    <span className="truncate">{installCommand}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Multi-Layer Glassmorphic IDE Showcase */}
                        <div className="lg:col-span-6 relative flex items-center justify-center pt-2 sm:pt-4" data-aos="fade-left">
                            {/* Layer 1: Back glass card (Subtle background depth) */}
                            <div className="hidden sm:block absolute top-0 right-4 sm:right-8 w-[90%] h-48 rounded-2xl bg-gradient-to-br from-purple-500/10 to-slate-200/50 dark:from-purple-900/30 dark:to-slate-900/50 border border-purple-300/40 dark:border-purple-500/20 backdrop-blur-xl p-5 shadow-xl">
                                <div className="space-y-2.5 opacity-40">
                                    <div className="h-2 w-1/3 bg-purple-500/50 rounded-full" />
                                    <div className="h-2 w-3/4 bg-slate-400 dark:bg-slate-600 rounded-full" />
                                    <div className="h-2 w-1/2 bg-slate-400 dark:bg-slate-600 rounded-full" />
                                </div>
                            </div>

                            {/* Floating Top Left Badge */}
                            <div className="hidden sm:flex absolute -top-3 left-4 sm:left-8 z-20 h-10 w-10 rounded-xl bg-purple-600/20 dark:bg-purple-600/30 border border-purple-400/50 items-center justify-center shadow-lg shadow-purple-500/20 backdrop-blur-md">
                                <Code2 className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                            </div>

                            {/* Layer 2: Main Floating Interactive IDE Terminal */}
                            <div className="relative z-10 w-full sm:w-[94%] rounded-2xl bg-slate-900 dark:bg-[#0a0c1a]/95 text-white border border-purple-500/30 dark:border-purple-500/40 backdrop-blur-2xl p-4 sm:p-6 shadow-2xl shadow-purple-950/30 dark:shadow-purple-950/60 space-y-3.5 sm:space-y-4">
                                {/* Window Traffic Light Header */}
                                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                    <div className="flex items-center space-x-1.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500/90" />
                                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/90" />
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/90" />
                                    </div>
                                    <span className="text-[10px] sm:text-[11px] font-mono text-purple-300/90 flex items-center space-x-1.5">
                                        <Activity className="h-3 w-3 text-cyan-400 animate-pulse" />
                                        <span>pipeline.review.ts</span>
                                    </span>
                                </div>

                                {/* Synthetic Code Preview Lines */}
                                <div className="space-y-2 font-mono text-[10px] sm:text-[11.5px] leading-relaxed overflow-x-auto">
                                    <div className="flex items-center space-x-2 text-slate-400 whitespace-nowrap">
                                        <span className="text-purple-400 font-bold">import</span>
                                        <span className="text-cyan-300">{`{ auditEngine }`}</span>
                                        <span className="text-purple-400 font-bold">from</span>
                                        <span className="text-emerald-300">'@codeventure/telemetry'</span>;
                                    </div>
                                    <div className="flex items-center space-x-2 text-slate-400 pl-2 sm:pl-3 whitespace-nowrap">
                                        <span className="text-fuchsia-400">const</span>
                                        <span className="text-amber-300">securityReport</span>
                                        <span>=</span>
                                        <span className="text-purple-400">await</span>
                                        <span className="text-cyan-300">auditEngine.inspect()</span>;
                                    </div>
                                    <div className="flex items-center space-x-2 text-emerald-400/90 pl-2 sm:pl-3 whitespace-nowrap">
                                        <span>// 0 Vulnerabilities • 100% Type Safe</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-slate-400 pl-2 sm:pl-3 whitespace-nowrap">
                                        <span className="text-purple-400">return</span>
                                        <span className="text-cyan-300">securityReport.approveDeployment()</span>;
                                    </div>
                                </div>

                                {/* IDE Footer with Status Badge & Pipe Origin Output */}
                                <div className="flex items-center justify-between pt-3 border-t border-slate-800/90 relative">
                                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/90 border border-purple-500/50 text-[10px] font-mono text-purple-300 shadow-md">
                                        <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                                        <span>codeventure.io</span>
                                    </div>

                                    {/* PIPELINE VERIFIED BADGE */}
                                    <div className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-[10px] font-bold text-emerald-300 flex items-center space-x-1.5 shadow-md cursor-default">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                        <span>Verified</span>
                                    </div>

                                    {/* PIPELINE STREAM ORIGIN SOCKET (Positioned at bottom center of IDE) */}
                                    <div 
                                        ref={originRef}
                                        className="absolute -bottom-6 sm:-bottom-7 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 px-3.5 py-0.5 rounded-full bg-slate-900 dark:bg-[#0a0c1a] border border-purple-500/80 text-[10px] font-mono font-bold text-purple-300 shadow-lg shadow-purple-950/60 z-20"
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                                        <span>STREAM OUT</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* STAGGERED STEP CARDS: STEP 01 (LEFT) -> STEP 02 (RIGHT) -> STEP 03 (MID)  */}
                    {/* ========================================================================= */}
                    <div className="space-y-20 sm:space-y-28 lg:space-y-32 pt-8 sm:pt-12 relative z-10">

                        {/* ----------------------------------------------------------------- */}
                        {/* STEP 01: LEFT CARD (Bug & Deep Code Review)                       */}
                        {/* ----------------------------------------------------------------- */}
                        <div className="grid grid-cols-1 lg:grid-cols-12">
                            <div className="w-full max-w-2xl mx-auto lg:max-w-none lg:mx-0 lg:col-span-8 lg:col-start-1" data-aos="fade-right">
                                <div className={`rounded-3xl bg-white/95 dark:bg-[#0c0e22]/95 border-2 p-5 sm:p-7 lg:p-8 relative z-30 shadow-xl transition-all duration-500 group ${
                                    isStep1Active 
                                        ? 'border-purple-500 dark:border-purple-400 shadow-purple-500/20 dark:shadow-purple-950/60 scale-[1.01]' 
                                        : 'border-slate-200 dark:border-purple-500/25'
                                }`}>
                                    {/* Top Center Input Port Socket (Pipe Entry) */}
                                    <div 
                                        ref={card1InRef} 
                                        className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 px-3 sm:px-3.5 py-0.5 rounded-full bg-purple-600 text-[10px] font-mono font-bold text-white shadow-md shadow-purple-600/50 whitespace-nowrap"
                                    >
                                        <span className={`h-1.5 w-1.5 rounded-full ${isStep1Active ? 'bg-emerald-300 animate-ping' : 'bg-white'}`} />
                                        <span>PIPE IN • 01</span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800/80">
                                        <div className="flex items-center space-x-3.5 sm:space-x-4">
                                            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform flex-shrink-0">
                                                <Bug className="h-6 w-6 sm:h-7 sm:w-7" />
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                    <span className="text-[10px] sm:text-[11px] font-mono font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                                                        Step 01 / Core Static Audit
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                                                        Automated & Manual
                                                    </span>
                                                </div>
                                                <h3 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors mt-0.5">
                                                    Bug & Deep Code Review
                                                </h3>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300/90 leading-relaxed">
                                        Vetted expert professional engineers review, refactor, and harden your codebase for maximum velocity. We perform thorough AST static code analysis, optimize resource bottlenecks, and ensure 100% type safety.
                                    </p>

                                    {/* Feature Badges Grid */}
                                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                                        <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                            <span className="truncate">0 False Positives</span>
                                        </div>
                                        <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <FileCheck2 className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                            <span className="truncate">Type Safety Audit</span>
                                        </div>
                                        <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <Cpu className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                                            <span className="truncate">Memory & AST Tuning</span>
                                        </div>
                                    </div>

                                    {/* Bottom Center Output Port Socket (Pipe Exit) */}
                                    <div 
                                        ref={card1OutRef}
                                        className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 px-3 sm:px-3.5 py-0.5 rounded-full bg-slate-900 dark:bg-[#0a0c1a] border border-purple-400 text-[10px] font-mono font-bold text-purple-300 shadow-lg whitespace-nowrap"
                                    >
                                        <span className={`h-1.5 w-1.5 rounded-full ${isStep1Active ? 'bg-cyan-400 animate-ping' : 'bg-purple-400'}`} />
                                        <span>PIPE OUT • 01</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ----------------------------------------------------------------- */}
                        {/* STEP 02: RIGHT CARD (Security Assessment & Pen-Test)              */}
                        {/* ----------------------------------------------------------------- */}
                        <div className="grid grid-cols-1 lg:grid-cols-12">
                            <div className="w-full max-w-2xl mx-auto lg:max-w-none lg:mx-0 lg:col-span-8 lg:col-start-5" data-aos="fade-left">
                                <div className={`rounded-3xl z-30 bg-gradient-to-br from-purple-50/90 via-white/95 to-fuchsia-50/80 dark:from-purple-950/40 dark:via-[#0c0e22]/95 dark:to-[#0c0e22]/95 border-2 p-5 sm:p-7 lg:p-8 relative shadow-2xl transition-all duration-500 group ${
                                    isStep2Active
                                        ? 'border-fuchsia-500 dark:border-fuchsia-400 shadow-fuchsia-500/20 dark:shadow-purple-900/60 scale-[1.01]'
                                        : 'border-fuchsia-300/80 dark:border-fuchsia-500/40'
                                }`}>
                                    {/* Top Center Input Port Socket (Pipe Entry) */}
                                    <div 
                                        ref={card2InRef}
                                        className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 px-3 sm:px-3.5 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-600 to-pink-600 text-[10px] font-mono font-bold text-white shadow-md shadow-fuchsia-600/50 whitespace-nowrap"
                                    >
                                        <span className={`h-1.5 w-1.5 rounded-full ${isStep2Active ? 'bg-emerald-300 animate-ping' : 'bg-white'}`} />
                                        <span>PIPE IN • 02</span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-fuchsia-200/60 dark:border-purple-500/20">
                                        <div className="flex items-center space-x-3.5 sm:space-x-4">
                                            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-tr from-purple-500 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-fuchsia-500/40 group-hover:scale-105 transition-transform flex-shrink-0">
                                                <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7" />
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                    <span className="text-[10px] sm:text-[11px] font-mono font-black text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-wider">
                                                        Step 02 / Zero-Day Defense
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-full bg-fuchsia-100 dark:bg-fuchsia-950/80 text-fuchsia-700 dark:text-fuchsia-300 text-[10px] font-black uppercase tracking-wider">
                                                        ⚡ Active Shield
                                                    </span>
                                                </div>
                                                <h3 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-300 transition-colors mt-0.5">
                                                    Security Assessment & Pen-Test
                                                </h3>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300/90 leading-relaxed">
                                        Experienced cybersecurity analysts and red-team engineers pen-test your project for zero-day vulnerabilities, API authentication exploits, SQL injections, and sensitive credential leaks before deploying to production.
                                    </p>

                                    {/* Feature Badges Grid */}
                                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-4 border-t border-slate-100 dark:border-purple-500/20">
                                        <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-fuchsia-200/40 dark:border-purple-500/20 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <Lock className="h-4 w-4 text-fuchsia-500 flex-shrink-0" />
                                            <span className="truncate">OWASP Top 10 Guard</span>
                                        </div>
                                        <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-fuchsia-200/40 dark:border-purple-500/20 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                            <span className="truncate">SOC-2 Compliance</span>
                                        </div>
                                        <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-fuchsia-200/40 dark:border-purple-500/20 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <Zap className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                            <span className="truncate">Secret Leak Shield</span>
                                        </div>
                                    </div>

                                    {/* Bottom Center Output Port Socket (Pipe Exit) */}
                                    <div 
                                        ref={card2OutRef}
                                        className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 px-3 sm:px-3.5 py-0.5 rounded-full bg-slate-900 dark:bg-[#0a0c1a] border border-fuchsia-400 text-[10px] font-mono font-bold text-fuchsia-300 shadow-lg whitespace-nowrap"
                                    >
                                        <span className={`h-1.5 w-1.5 rounded-full ${isStep2Active ? 'bg-cyan-400 animate-ping' : 'bg-fuchsia-400'}`} />
                                        <span>PIPE OUT • 02</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ----------------------------------------------------------------- */}
                        {/* STEP 03: MIDDLE CARD (Real-Time Architectural Support)            */}
                        {/* ----------------------------------------------------------------- */}
                        <div className="max-w-4xl mx-auto" data-aos="fade-up">
                            <div className="w-full max-w-2xl mx-auto lg:max-w-none relative z-30">
                                <div className={`rounded-3xl bg-white/95 dark:bg-[#0c0e22]/95 border-2 p-5 sm:p-7 lg:p-8 relative shadow-2xl transition-all duration-500 group ${
                                    isStep3Active
                                        ? 'border-cyan-400 dark:border-cyan-400 shadow-cyan-500/20 dark:shadow-cyan-950/50 scale-[1.01]'
                                        : 'border-cyan-200 dark:border-cyan-500/30'
                                }`}>
                                    {/* Top Center Input Port Socket (Pipe Entry) */}
                                    <div 
                                        ref={card3InRef}
                                        className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 px-3.5 sm:px-4 py-0.5 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 text-[10px] font-mono font-bold text-white shadow-md shadow-cyan-600/50 whitespace-nowrap"
                                    >
                                        <span className={`h-1.5 w-1.5 rounded-full ${isStep3Active ? 'bg-emerald-300 animate-ping' : 'bg-white'}`} />
                                        <span>PIPE IN • 03</span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800/80">
                                        <div className="flex items-center space-x-3.5 sm:space-x-4">
                                            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform flex-shrink-0">
                                                <Headphones className="h-6 w-6 sm:h-7 sm:w-7" />
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                    <span className="text-[10px] sm:text-[11px] font-mono font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                                                        Step 03 / Senior Guidance
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold">
                                                        Direct Lead SLA
                                                    </span>
                                                </div>
                                                <h3 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors mt-0.5">
                                                    Real-Time Architectural Support
                                                </h3>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300/90 leading-relaxed">
                                        Get instant architectural guidance and unblock complex cloud infrastructure barriers. Our senior principal architects conduct live pair-debugging, infrastructure reviews, and roadmap planning whenever your team hits an impasse.
                                    </p>

                                    {/* Feature Badges Grid */}
                                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                                        <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <Zap className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                            <span className="truncate">&lt; 15-Min Response SLA</span>
                                        </div>
                                        <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <Code2 className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                                            <span className="truncate">Live Pair-Debugging</span>
                                        </div>
                                        <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                            <span className="truncate">Dedicated Staff Lead</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* BOTTOM ACTION FOOTER                                                      */}
                    {/* ========================================================================= */}
                    <div className="mt-16 sm:mt-24 pt-8 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-slate-600 dark:text-slate-400 relative z-10">
                        <div className="flex items-center space-x-2.5 text-center sm:text-left">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse flex-shrink-0" />
                            <span className="font-medium text-slate-700 dark:text-slate-300">100% Automated Code Telemetry & Human Senior Architectural Review</span>
                        </div>

                        <Link
                            href="/custom-orders/request"
                            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 dark:bg-purple-600/20 dark:hover:bg-purple-600/30 border border-purple-400/40 text-purple-700 dark:text-purple-200 font-bold hover:text-purple-900 dark:hover:text-white transition-all hover:scale-105 shadow-sm active:scale-95"
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
