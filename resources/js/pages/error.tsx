import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import { ThemeToggle } from '@/components/surface/theme-toggle';
import {
    Home,
    ArrowLeft,
    RefreshCw,
    LayoutDashboard,
    Layers,
    FolderGit2,
    Settings,
    User,
    ShoppingBag,
    Receipt,
    Mail,
    Compass,
    Copy,
    Check,
    ShieldAlert,
    AlertTriangle,
    ServerCrash,
    HelpCircle,
    Sparkles,
    Globe,
    Shield,
    Terminal,
    ChevronRight
} from 'lucide-react';

export type PanelType = 'surface' | 'admin' | 'customer';

interface ErrorPageProps {
    status: number;
    panel?: PanelType;
    message?: string | null;
}

interface ErrorMeta {
    title: string;
    badge: string;
    subtitle: string;
    description: string;
    color: string;
    glowColor: string;
    accentGradient: string;
    icon: React.ElementType;
}

const ERROR_META: Record<number, ErrorMeta> = {
    404: {
        title: '404',
        badge: 'HTTP 404 // RESOURCE NOT FOUND',
        subtitle: 'Lost in the Digital Expanse',
        description: "The page or destination you are searching for has drifted into deep space. It may have been moved, renamed, deleted, or never existed in this sector.",
        color: '#06b6d4',
        glowColor: 'rgba(6, 182, 212, 0.35)',
        accentGradient: 'from-cyan-500 via-sky-500 to-indigo-600',
        icon: Compass,
    },
    505: {
        title: '505',
        badge: 'HTTP 505 // PROTOCOL MISMATCH',
        subtitle: 'HTTP Version Not Supported',
        description: 'The server does not support the HTTP protocol version used in the request. Our gateway requires standard HTTP/1.1 or HTTP/2 secure transport.',
        color: '#f59e0b',
        glowColor: 'rgba(245, 158, 11, 0.35)',
        accentGradient: 'from-amber-500 via-orange-500 to-rose-600',
        icon: ServerCrash,
    },
    500: {
        title: '500',
        badge: 'HTTP 500 // INTERNAL SERVER ANOMALY',
        subtitle: 'Core Engine Interruption',
        description: 'An unexpected exception occurred on our processing cluster. Our automated telemetry systems have registered this incident for engineering review.',
        color: '#ef4444',
        glowColor: 'rgba(239, 68, 68, 0.35)',
        accentGradient: 'from-rose-500 via-red-500 to-pink-600',
        icon: AlertTriangle,
    },
    503: {
        title: '503',
        badge: 'HTTP 503 // SERVICE UPGRADE ACTIVE',
        subtitle: 'Maintenance in Progress',
        description: 'We are applying scheduled architectural upgrades and high-performance optimizations. Services will resume normal operations in moments.',
        color: '#8b5cf6',
        glowColor: 'rgba(139, 92, 246, 0.35)',
        accentGradient: 'from-violet-500 via-purple-500 to-indigo-600',
        icon: Sparkles,
    },
    403: {
        title: '403',
        badge: 'HTTP 403 // ACCESS FORBIDDEN',
        subtitle: 'Restricted Security Perimeter',
        description: 'You do not have clearance or sufficient role privileges to enter this sector. If you believe this is an error, please verify your credentials.',
        color: '#f97316',
        glowColor: 'rgba(249, 115, 22, 0.35)',
        accentGradient: 'from-orange-500 via-amber-500 to-red-600',
        icon: ShieldAlert,
    },
    419: {
        title: '419',
        badge: 'HTTP 419 // SESSION EXPIRED',
        subtitle: 'Security Token Timeout',
        description: 'Your encrypted session token has timed out due to period of inactivity. Please refresh the page to generate a fresh secure connection.',
        color: '#06b6d4',
        glowColor: 'rgba(6, 182, 212, 0.35)',
        accentGradient: 'from-cyan-500 via-teal-500 to-blue-600',
        icon: RefreshCw,
    },
    429: {
        title: '429',
        badge: 'HTTP 429 // RATE LIMIT TRIGGERED',
        subtitle: 'Request Velocity Exceeded',
        description: 'Too many requests were dispatched in a condensed timeframe. Please pause for a brief moment before sending further commands.',
        color: '#eab308',
        glowColor: 'rgba(234, 179, 8, 0.35)',
        accentGradient: 'from-yellow-500 via-amber-500 to-orange-600',
        icon: AlertTriangle,
    },
};

const DEFAULT_META: ErrorMeta = {
    title: 'ERROR',
    badge: 'HTTP EXCEPTION',
    subtitle: 'Unexpected System Condition',
    description: 'An unhandled state was encountered during request lifecycle execution. You may return to safety or retry your operation.',
    color: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.35)',
    accentGradient: 'from-indigo-500 via-purple-500 to-cyan-500',
    icon: HelpCircle,
};

export default function ErrorPage({ status = 404, panel: serverPanel, message }: ErrorPageProps) {
    const { app_settings } = usePage<SharedData>().props;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [copied, setCopied] = useState(false);
    const [showDiagnostics, setShowDiagnostics] = useState(false);

    // Determine initial active panel from props or window location
    const [activePanel, setActivePanel] = useState<PanelType>(() => {
        if (serverPanel) return serverPanel;
        if (typeof window !== 'undefined') {
            const p = window.location.pathname;
            if (p.startsWith('/admin')) return 'admin';
            if (p.startsWith('/customer')) return 'customer';
        }
        return 'surface';
    });

    const info = ERROR_META[status] || DEFAULT_META;
    const brandName = app_settings?.brand_name || 'CodeVenture Tech';

    // Particle background animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;
        let w = (canvas.width = window.innerWidth);
        let h = (canvas.height = window.innerHeight);

        const onResize = () => {
            if (!canvas) return;
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', onResize);

        const PARTICLE_COUNT = 45;
        const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 1.8 + 0.6,
            alpha: Math.random() * 0.45 + 0.15,
            color: Math.random() > 0.5 ? info.color : '#6366f1',
        }));

        const draw = () => {
            ctx.clearRect(0, 0, w, h);

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 110) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(99,102,241,${0.12 * (1 - dist / 110)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            for (const p of particles) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fill();
                ctx.globalAlpha = 1.0;

                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
            }

            animId = requestAnimationFrame(draw);
        };

        draw();
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', onResize);
        };
    }, [info.color]);

    const handleCopyDiagnostics = () => {
        const diagnosticsData = `[${brandName} System Diagnostic Report]
Status: HTTP ${status} (${info.subtitle})
Panel: ${activePanel.toUpperCase()}
Timestamp: ${new Date().toISOString()}
URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}
User-Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}
Message: ${message || 'None'}`;

        navigator.clipboard.writeText(diagnosticsData).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    return (
        <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans relative overflow-hidden transition-colors duration-300">
            <Head title={`${info.title} - ${info.subtitle} | ${brandName}`}>
                {app_settings?.favicon && <link rel="icon" type="image/x-icon" href={app_settings.favicon} />}
            </Head>

            {/* Particle Animation Background */}
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-70" />

            {/* Glowing Ambient Gradient Orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div
                    className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[550px] rounded-full blur-[140px] opacity-25 dark:opacity-20 animate-pulse"
                    style={{ background: `radial-gradient(circle, ${info.color} 0%, rgba(99,102,241,0.2) 60%, transparent 80%)`, animationDuration: '7s' }}
                />
                <div
                    className="absolute -bottom-32 right-1/4 w-[600px] h-[500px] rounded-full blur-[140px] opacity-15 dark:opacity-20"
                    style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)' }}
                />
                {/* Cyber Grid Lines */}
                <div
                    className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                    style={{
                        backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
                        backgroundSize: '48px 48px',
                    }}
                />
            </div>

            {/* Top Navigation Bar */}
            <header className="relative z-20 w-full px-6 py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/75 dark:bg-slate-950/70 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        {app_settings?.logo ? (
                            <img src={app_settings.logo} alt={brandName} className="h-8 md:h-9 w-auto object-contain transition-transform group-hover:scale-105" />
                        ) : (
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-cyan-500/20">
                                CV
                            </div>
                        )}
                    </Link>

                    {/* Panel Mode Indicator & Theme Toggle */}
                    <div className="flex items-center gap-3">
                        {/* Active Panel Pill */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300 shadow-sm">
                            {activePanel === 'admin' ? (
                                <Link href="/admin/dashboard" className='flex items-center gap-2'>
                                    <Shield className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                                    <span>Admin Panel</span>
                                </Link>
                            ) : activePanel === 'customer' ? (
                                <Link href="/customer/dashboard" className='flex items-center gap-2'>
                                    <User className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                    <span>Customer Portal</span>
                                </Link>
                            ) : (
                                <Link href="/" className='flex items-center gap-2'>
                                    <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                    <span>Surface Website</span>
                                </Link>
                            )}
                        </div>

                        {/* Theme Toggle */}
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Main Interactive Error Stage */}
            <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 py-12 sm:py-16 text-center">
                <div className="w-full max-w-4xl mx-auto flex flex-col items-center">

                    {/* Glowing Status Badge */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md mb-6 shadow-sm">
                        <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: info.color }} />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: info.color }} />
                        </span>
                        <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300">
                            {info.badge}
                        </span>
                    </div>

                    {/* Giant Holographic Number with Glow */}
                    <div className="relative select-none my-2">
                        {/* Background Ghost Blur */}
                        <span
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[140px] sm:text-[200px] md:text-[250px] font-black tracking-tighter opacity-15 blur-md"
                            style={{ color: info.color }}
                        >
                            {info.title}
                        </span>

                        {/* Foreground Vibrant Number */}
                        <h1
                            className={`text-[100px] sm:text-[150px] md:text-[190px] font-black tracking-tight leading-none bg-gradient-to-r ${info.accentGradient} bg-clip-text text-transparent drop-shadow-[0_0_40px_${info.glowColor}]`}
                        >
                            {info.title}
                        </h1>
                    </div>

                    {/* Subtitle & Description */}
                    <div className="max-w-2xl mx-auto mt-2 mb-8">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                            {info.subtitle}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                            {message ? message : info.description}
                        </p>
                    </div>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
                    >
                        <Home className="w-4 h-4" />
                        <span>Back to Homepage</span>
                    </Link>
                </div>
            </main>

            {/* Bottom Footer Watermark */}
            <footer className="relative z-20 w-full py-4 border-t border-slate-200 dark:border-slate-900/80 bg-white/60 dark:bg-slate-950/60 text-center text-xs text-slate-500 dark:text-slate-600">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p>© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
                    <p className="font-mono text-[11px] tracking-widest text-slate-400 dark:text-slate-600 uppercase">System Error Handler v2.5</p>
                </div>
            </footer>
        </div>
    );
}
