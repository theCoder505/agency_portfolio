import React, { useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';

interface ErrorPageProps {
    status: number;
}

const ERROR_MESSAGES: Record<number, { title: string; subtitle: string; description: string }> = {
    404: {
        title: '404',
        subtitle: 'Page Not Found',
        description: "The page you're looking for has drifted into the void. It may have been moved, deleted, or never existed.",
    },
    403: {
        title: '403',
        subtitle: 'Access Forbidden',
        description: "You don't have permission to access this resource. If you believe this is a mistake, please contact support.",
    },
    500: {
        title: '500',
        subtitle: 'Server Error',
        description: 'Something went wrong on our end. Our engineers have been notified and are working to fix it.',
    },
    503: {
        title: '503',
        subtitle: 'Service Unavailable',
        description: 'We are currently undergoing maintenance. We will be back online shortly. Thank you for your patience.',
    },
    419: {
        title: '419',
        subtitle: 'Page Expired',
        description: 'Your session has expired. Please refresh the page and try again.',
    },
};

const DEFAULT_ERROR = {
    title: 'Error',
    subtitle: 'Unexpected Error',
    description: 'Something unexpected happened. Please try again or return to the homepage.',
};

export default function ErrorPage({ status }: ErrorPageProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const info = ERROR_MESSAGES[status] || DEFAULT_ERROR;

    // Animated particle field
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;

        const onResize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', onResize);

        // Floating particles
        const PARTICLE_COUNT = 60;
        const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 2 + 0.5,
            alpha: Math.random() * 0.5 + 0.1,
            color: Math.random() > 0.5 ? '#22d3ee' : '#6366f1',
        }));

        const draw = () => {
            ctx.clearRect(0, 0, w, h);

            // Draw connections between close particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(99,102,241,${0.15 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.6;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw & move particles
            for (const p of particles) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, '0');
                ctx.fill();

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
    }, []);

    const is404 = status === 404;

    return (
        <>
            <Head title={`${info.title} - ${info.subtitle}`} />

            {/* Full-page dark canvas */}
            <div style={{
                position: 'fixed', inset: 0,
                background: '#020617',
                fontFamily: "'Satoshi Variable', 'Satoshi', ui-sans-serif, system-ui, sans-serif",
                overflow: 'hidden',
            }}>
                {/* Particle canvas */}
                <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

                {/* Ambient gradient orbs */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
                    <div style={{
                        position: 'absolute', top: '20%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 700, height: 700, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(79,70,229,0.18) 0%, rgba(6,182,212,0.06) 55%, transparent 75%)',
                        filter: 'blur(90px)',
                        animation: 'cv-404-orb-pulse 6s ease-in-out infinite',
                    }} />
                    <div style={{
                        position: 'absolute', top: '70%', left: '60%',
                        transform: 'translate(-50%, -50%)',
                        width: 500, height: 500, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(147,51,234,0.14) 0%, transparent 70%)',
                        filter: 'blur(70px)',
                        animation: 'cv-404-orb-pulse 8s ease-in-out infinite 2s',
                    }} />
                </div>

                {/* Subtle grid */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 1,
                    backgroundImage: `
                        linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px',
                }} />

                {/* Main content */}
                <div style={{
                    position: 'relative', zIndex: 10,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    minHeight: '100vh',
                    padding: '24px',
                    textAlign: 'center',
                }}>

                    {/* Error code display */}
                    <div style={{ position: 'relative', marginBottom: 24 }}>
                        {/* Big ghost number behind */}
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: 'clamp(140px, 25vw, 260px)',
                            fontWeight: 900,
                            letterSpacing: '-0.04em',
                            lineHeight: 1,
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(34,211,238,0.08) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            userSelect: 'none',
                            whiteSpace: 'nowrap',
                            filter: 'blur(1px)',
                            animation: 'cv-404-ghost-pulse 3s ease-in-out infinite',
                        }}>
                            {info.title}
                        </div>

                        {/* Foreground glowing number */}
                        <div style={{
                            fontSize: 'clamp(80px, 15vw, 160px)',
                            fontWeight: 900,
                            letterSpacing: '-0.04em',
                            lineHeight: 1,
                            background: 'linear-gradient(135deg, #a5b4fc 0%, #c084fc 40%, #67e8f9 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            position: 'relative',
                            userSelect: 'none',
                            filter: 'drop-shadow(0 0 30px rgba(99,102,241,0.5))',
                            animation: 'cv-404-num-glow 2s ease-in-out infinite',
                        }}>
                            {info.title}
                        </div>
                    </div>

                    {/* Decorative separator */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        marginBottom: 20, width: '100%', maxWidth: 420,
                    }}>
                        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4))' }} />
                        <div style={{
                            display: 'flex', gap: 4, alignItems: 'center',
                        }}>
                            {[0, 1, 2].map(i => (
                                <div key={i} style={{
                                    width: 6, height: 6, borderRadius: 2,
                                    background: i === 1 ? '#22d3ee' : '#6366f1',
                                    opacity: i === 1 ? 1 : 0.5,
                                    animation: `cv-404-dot-blink 1.4s ease-in-out ${i * 0.2}s infinite`,
                                }} />
                            ))}
                        </div>
                        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(99,102,241,0.4), transparent)' }} />
                    </div>

                    {/* Subtitle */}
                    <h1 style={{
                        fontSize: 'clamp(20px, 4vw, 32px)',
                        fontWeight: 800,
                        color: '#e2e8f0',
                        letterSpacing: '-0.02em',
                        marginBottom: 14,
                    }}>
                        {info.subtitle}
                    </h1>

                    {/* Description */}
                    <p style={{
                        fontSize: 15,
                        color: 'rgba(148,163,184,0.8)',
                        lineHeight: 1.7,
                        maxWidth: 440,
                        marginBottom: 40,
                    }}>
                        {info.description}
                    </p>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Link
                            href="/"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '12px 28px',
                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                color: '#fff',
                                borderRadius: 12,
                                fontWeight: 700,
                                fontSize: 14,
                                letterSpacing: '0.02em',
                                textDecoration: 'none',
                                boxShadow: '0 0 24px rgba(99,102,241,0.4)',
                                transition: 'all 0.25s ease',
                                border: '1px solid rgba(165,180,252,0.2)',
                            }}
                            onMouseEnter={e => {
                                (e.target as HTMLAnchorElement).style.transform = 'translateY(-2px)';
                                (e.target as HTMLAnchorElement).style.boxShadow = '0 0 36px rgba(99,102,241,0.6)';
                            }}
                            onMouseLeave={e => {
                                (e.target as HTMLAnchorElement).style.transform = '';
                                (e.target as HTMLAnchorElement).style.boxShadow = '0 0 24px rgba(99,102,241,0.4)';
                            }}
                        >
                            {/* Home icon */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            Go Home
                        </Link>

                        <button
                            onClick={() => window.history.back()}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '12px 28px',
                                background: 'transparent',
                                color: '#a5b4fc',
                                borderRadius: 12,
                                fontWeight: 700,
                                fontSize: 14,
                                letterSpacing: '0.02em',
                                cursor: 'pointer',
                                border: '1px solid rgba(99,102,241,0.4)',
                                transition: 'all 0.25s ease',
                                fontFamily: 'inherit',
                            }}
                            onMouseEnter={e => {
                                (e.target as HTMLButtonElement).style.background = 'rgba(99,102,241,0.1)';
                                (e.target as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.7)';
                            }}
                            onMouseLeave={e => {
                                (e.target as HTMLButtonElement).style.background = 'transparent';
                                (e.target as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.4)';
                            }}
                        >
                            {/* Back arrow */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                            Go Back
                        </button>
                    </div>

                    {/* Bottom links */}
                    <div style={{
                        marginTop: 48, display: 'flex', gap: 24,
                        fontSize: 12, color: 'rgba(148,163,184,0.5)',
                        flexWrap: 'wrap', justifyContent: 'center',
                    }}>
                        {[
                            { label: 'Services', href: '/#what-we-build' },
                            { label: 'Portfolio', href: '/works' },
                            { label: 'Contact', href: '/contact' },
                            { label: 'Client Portal', href: '/login' },
                        ].map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                style={{
                                    color: 'rgba(148,163,184,0.5)',
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                    transition: 'color 0.2s',
                                }}
                                onMouseEnter={e => { (e.target as HTMLAnchorElement).style.color = '#22d3ee'; }}
                                onMouseLeave={e => { (e.target as HTMLAnchorElement).style.color = 'rgba(148,163,184,0.5)'; }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Brand watermark */}
                    <div style={{
                        position: 'fixed', bottom: 24, left: 0, right: 0,
                        display: 'flex', justifyContent: 'center',
                        fontSize: 11, fontWeight: 600,
                        letterSpacing: '0.2em',
                        color: 'rgba(99,102,241,0.3)',
                        textTransform: 'uppercase',
                        userSelect: 'none',
                    }}>
                        CodeVenture Tech
                    </div>
                </div>
            </div>

            <style>{`
                @import url('https://api.fontshare.com/v2/css?f[]=satoshi@900,800,700,600,500,400&display=swap');

                @keyframes cv-404-orb-pulse {
                    0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
                    50%       { opacity: 1;   transform: translate(-50%, -50%) scale(1.1); }
                }
                @keyframes cv-404-ghost-pulse {
                    0%, 100% { opacity: 0.3; }
                    50%       { opacity: 0.6; }
                }
                @keyframes cv-404-num-glow {
                    0%, 100% { filter: drop-shadow(0 0 30px rgba(99,102,241,0.5)); }
                    50%       { filter: drop-shadow(0 0 50px rgba(99,102,241,0.8)); }
                }
                @keyframes cv-404-dot-blink {
                    0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
                    40%           { opacity: 1;   transform: scale(1.2); }
                }
            `}</style>
        </>
    );
}
