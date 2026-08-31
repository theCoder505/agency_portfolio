import React, { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLogoIcon from '@/components/app-logo-icon';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

type Theme = 'dark' | 'light';

const THEME_STORAGE_KEY = 'cv-auth-theme';

/* ---------- small line icons (no external deps) ---------- */

function IconBolt() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
    );
}
function IconShield() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 3l7 3v6c0 4.6-3 7.9-7 9-4-1.1-7-4.4-7-9V6l7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M9 12.2l2 2 4-4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
function IconLayers() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 3l9 4.8-9 4.8-9-4.8L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M3 12l9 4.8 9-4.8M3 16.2 12 21l9-4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
function IconSun() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.7" />
            <path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7"
                stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
    );
}
function IconMoon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M20 14.1A8.3 8.3 0 1 1 10 3.2a6.8 6.8 0 0 0 10 10.9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
    );
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { app_settings } = usePage<SharedData>().props;

    const brandName = app_settings?.brand_name || 'CodeVenture Tech';
    const logo = app_settings?.logo;

    const [theme, setTheme] = useState<Theme>('dark');

    // Resolve initial theme: stored preference > system preference > dark
    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
            if (stored === 'light' || stored === 'dark') {
                setTheme(stored);
                return;
            }
            const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
            setTheme(prefersLight ? 'light' : 'dark');
        } catch {
            /* localStorage unavailable — keep default */
        }
    }, []);

    const toggleTheme = () => {
        setTheme(prev => {
            const next: Theme = prev === 'dark' ? 'light' : 'dark';
            try {
                window.localStorage.setItem(THEME_STORAGE_KEY, next);
            } catch {
                /* ignore */
            }
            return next;
        });
    };

    // Particle network — only on the desktop brand panel, colors follow theme
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

        let animId: number;
        let w = (canvas.width = canvas.offsetWidth);
        let h = (canvas.height = canvas.offsetHeight);

        const onResize = () => {
            w = canvas.width = canvas.offsetWidth;
            h = canvas.height = canvas.offsetHeight;
        };
        window.addEventListener('resize', onResize);

        const dotRGB = theme === 'dark' ? '34,211,238' : '8,116,144';
        const lineRGB = theme === 'dark' ? '34,211,238' : '8,116,144';
        const dotAlphaRange = theme === 'dark' ? [0.35, 0.65] : [0.22, 0.42];

        const PARTICLE_COUNT = 26;
        const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.22,
            vy: (Math.random() - 0.5) * 0.22,
            r: Math.random() * 1.3 + 0.5,
            alpha: Math.random() * (dotAlphaRange[1] - dotAlphaRange[0]) + dotAlphaRange[0],
        }));

        const drawFrame = () => {
            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 108) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${lineRGB},${0.1 * (1 - dist / 108)})`;
                        ctx.lineWidth = 0.6;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            for (const p of particles) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${dotRGB},${p.alpha})`;
                ctx.fill();
            }
        };

        const step = () => {
            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
            }
            drawFrame();
            animId = requestAnimationFrame(step);
        };

        if (reduceMotion) {
            drawFrame();
        } else {
            step();
        }

        return () => {
            if (animId) cancelAnimationFrame(animId);
            window.removeEventListener('resize', onResize);
        };
    }, [theme]);

    return (
        <div className="cv-auth-root" data-theme={theme} style={{ minHeight: '100svh', position: 'relative' }}>
            <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                className="cv-theme-toggle"
            >
                {theme === 'dark' ? <IconSun /> : <IconMoon />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            <div className="cv-auth-wrapper">
                <div className="cv-auth-left">
                    <canvas ref={canvasRef} className="cv-particle-canvas" />
                    <div className="cv-left-wash" />

                    <Link href={route('home')} className="cv-brand-link">
                        {logo ? (
                            <img src={logo} alt={brandName} style={{ height: 30, width: 'auto' }} />
                        ) : (
                            <AppLogoIcon className="cv-logo-icon" />
                        )}
                        <span className="cv-brand-name">{brandName}</span>
                    </Link>

                    <div className="cv-left-body">
                        <h2 className="cv-headline">Good to see you again</h2>
                        <p className="cv-subline">
                            Your client portal for tracking projects, subscriptions, and everything in progress.
                        </p>

                        <ul className="cv-feature-list">
                            <li>
                                <span className="cv-feature-icon"><IconBolt /></span>
                                Live project status, no waiting on updates
                            </li>
                            <li>
                                <span className="cv-feature-icon"><IconShield /></span>
                                Encrypted messages between you and the team
                            </li>
                            <li>
                                <span className="cv-feature-icon"><IconLayers /></span>
                                Invoices and subscriptions in one place
                            </li>
                        </ul>
                    </div>

                    <p className="cv-tagline">We don't just develop — we venture beyond.</p>
                </div>

                <div className="cv-auth-right">
                    <div className="cv-auth-mobile-logo">
                        <Link href={route('home')} className="cv-brand-link">
                            {logo ? (
                                <img src={logo} alt={brandName} style={{ height: 32, width: 'auto' }} />
                            ) : (
                                <AppLogoIcon className="cv-logo-icon" />
                            )}
                            <span className="cv-brand-name">{brandName}</span>
                        </Link>
                    </div>

                    <div className="cv-form-header">
                        <h1>{title}</h1>
                        <p>{description}</p>
                    </div>

                    <div className="cv-auth-form-content">{children}</div>

                    <div className="cv-back-link-row">
                        <Link href={route('home')} className="cv-back-link">
                            ← Back to {brandName}
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

                .cv-auth-root {
                    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px 16px;
                    overflow: hidden;
                    transition: background 0.35s ease;
                }

                /* ---------------- theme tokens ---------------- */
                .cv-auth-root[data-theme='dark'] {
                    background: radial-gradient(120% 120% at 15% 0%, #08182c 0%, #020617 55%, #01040c 100%);
                    --cv-page-grid: rgba(56,189,248,0.05);
                    --cv-panel-bg: linear-gradient(155deg, rgba(6,16,34,0.9) 0%, rgba(2,8,20,0.98) 100%);
                    --cv-panel-border: rgba(56,189,248,0.16);
                    --cv-card-bg: rgba(4,10,22,0.86);
                    --cv-card-border: rgba(56,189,248,0.14);
                    --cv-card-shadow: 0 40px 100px rgba(0,0,0,0.55);
                    --cv-text-primary: #f1f5f9;
                    --cv-text-secondary: #94a3b8;
                    --cv-text-tertiary: #5b6b83;
                    --cv-accent: #22d3ee;
                    --cv-accent-2: #818cf8;
                    --cv-input-border: rgba(148,163,184,0.26);
                    --cv-input-text: #e2e8f0;
                    --cv-placeholder: rgba(148,163,184,0.32);
                    --cv-divider: rgba(148,163,184,0.12);
                    --cv-feature-icon-bg: rgba(34,211,238,0.08);
                    --cv-feature-icon-border: rgba(34,211,238,0.22);
                    --cv-toggle-bg: rgba(15,23,42,0.55);
                    --cv-toggle-border: rgba(148,163,184,0.2);
                    --cv-toggle-text: #cbd5e1;
                }
                .cv-auth-root[data-theme='light'] {
                    background: radial-gradient(120% 120% at 15% 0%, #eef3fa 0%, #eef1f7 55%, #e7ecf4 100%);
                    --cv-page-grid: rgba(8,116,144,0.05);
                    --cv-panel-bg: linear-gradient(155deg, #0b1730 0%, #071022 100%);
                    --cv-panel-border: rgba(255,255,255,0.06);
                    --cv-card-bg: #ffffff;
                    --cv-card-border: rgba(15,23,42,0.08);
                    --cv-card-shadow: 0 30px 80px rgba(15,23,42,0.14);
                    --cv-text-primary: #0f172a;
                    --cv-text-secondary: #475569;
                    --cv-text-tertiary: #94a3b8;
                    --cv-accent: #0e7490;
                    --cv-accent-2: #4f46e5;
                    --cv-input-border: rgba(15,23,42,0.16);
                    --cv-input-text: #0f172a;
                    --cv-placeholder: rgba(15,23,42,0.32);
                    --cv-divider: rgba(15,23,42,0.08);
                    --cv-feature-icon-bg: rgba(255,255,255,0.06);
                    --cv-feature-icon-border: rgba(255,255,255,0.14);
                    --cv-toggle-bg: rgba(255,255,255,0.75);
                    --cv-toggle-border: rgba(15,23,42,0.1);
                    --cv-toggle-text: #334155;
                }

                .cv-auth-root::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    background-image:
                        linear-gradient(var(--cv-page-grid) 1px, transparent 1px),
                        linear-gradient(90deg, var(--cv-page-grid) 1px, transparent 1px);
                    background-size: 56px 56px;
                }

                /* ---------------- theme toggle ---------------- */
                .cv-theme-toggle {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    z-index: 20;
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    background: var(--cv-toggle-bg);
                    border: 1px solid var(--cv-toggle-border);
                    color: var(--cv-toggle-text);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 7px 13px 7px 10px;
                    font-size: 12.5px;
                    font-weight: 600;
                    font-family: inherit;
                    cursor: pointer;
                    transition: border-color 0.2s, color 0.2s, transform 0.15s;
                }
                .cv-theme-toggle:hover { color: var(--cv-accent); border-color: var(--cv-accent); }
                .cv-theme-toggle:active { transform: scale(0.96); }
                .cv-theme-toggle:focus-visible {
                    outline: 2px solid var(--cv-accent);
                    outline-offset: 2px;
                }

                /* ---------------- wrapper / panels ---------------- */
                .cv-auth-wrapper {
                    display: flex;
                    width: 100%;
                    max-width: 960px;
                    position: relative;
                    z-index: 5;
                    align-items: stretch;
                    border-radius: 20px;
                    overflow: hidden;
                }

                .cv-auth-left {
                    flex: 1 1 0%;
                    background: var(--cv-panel-bg);
                    border: 1px solid var(--cv-panel-border);
                    border-right: none;
                    padding: 52px 48px;
                    display: none;
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                    overflow: hidden;
                }
                .cv-particle-canvas {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                }
                .cv-left-wash {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 0;
                    background: radial-gradient(ellipse at 20% 15%, rgba(56,189,248,0.14) 0%, transparent 62%);
                }

                .cv-brand-link {
                    position: relative;
                    z-index: 2;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    width: fit-content;
                }
                .cv-logo-icon { width: 30px; height: 30px; fill: #22d3ee; }
                .cv-brand-name {
                    font-size: 13px;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    color: #e2e8f0;
                }

                .cv-left-body {
                    position: relative;
                    z-index: 2;
                    margin-top: 44px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .cv-headline {
                    font-size: clamp(30px, 3.6vw, 46px);
                    font-weight: 800;
                    line-height: 1.12;
                    letter-spacing: -0.03em;
                    color: #f8fafc;
                    margin: 0 0 14px 0;
                }
                .cv-subline {
                    font-size: 14px;
                    color: rgba(203,213,225,0.62);
                    line-height: 1.7;
                    max-width: 300px;
                    margin: 0;
                }
                .cv-feature-list {
                    list-style: none;
                    margin: 34px 0 0 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                .cv-feature-list li {
                    display: flex;
                    align-items: center;
                    gap: 13px;
                    font-size: 13px;
                    color: rgba(226,232,240,0.78);
                    font-weight: 450;
                    line-height: 1.4;
                }
                .cv-feature-icon {
                    width: 32px;
                    height: 32px;
                    flex-shrink: 0;
                    border-radius: 9px;
                    background: var(--cv-feature-icon-bg);
                    border: 1px solid var(--cv-feature-icon-border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #22d3ee;
                }
                .cv-tagline {
                    position: relative;
                    z-index: 2;
                    margin-top: 44px;
                    font-size: 12px;
                    font-weight: 500;
                    color: rgba(148,163,184,0.5);
                }

                /* ---------------- right / form panel ---------------- */
                .cv-auth-right {
                    flex: 0 0 auto;
                    width: 100%;
                    background: var(--cv-card-bg);
                    border-radius: 20px;
                    border: 1px solid var(--cv-card-border);
                    box-shadow: var(--cv-card-shadow);
                    padding: 48px 40px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    position: relative;
                    transition: background 0.3s ease, border-color 0.3s ease;
                }

                .cv-auth-mobile-logo { margin-bottom: 32px; text-align: center; }
                .cv-auth-mobile-logo .cv-brand-name { color: var(--cv-text-primary); }
                .cv-auth-mobile-logo .cv-brand-link { justify-content: center; margin: 0 auto; }

                .cv-form-header { margin-bottom: 32px; }
                .cv-form-header h1 {
                    font-size: 26px;
                    font-weight: 800;
                    letter-spacing: -0.025em;
                    color: var(--cv-text-primary);
                    margin: 0 0 8px 0;
                    line-height: 1.2;
                }
                .cv-form-header p {
                    font-size: 14px;
                    color: var(--cv-text-secondary);
                    line-height: 1.6;
                    margin: 0;
                }

                .cv-back-link-row { margin-top: 26px; text-align: center; }
                .cv-back-link {
                    font-size: 12.5px;
                    color: var(--cv-text-tertiary);
                    text-decoration: none;
                    font-weight: 500;
                    transition: color 0.2s;
                }
                .cv-back-link:hover { color: var(--cv-accent); }

                /* ---------------- form field theming ---------------- */
                .cv-auth-form-content {
                    --background: transparent;
                    --input: var(--cv-input-border);
                    --ring: var(--cv-accent);
                    --radius: 0px;
                }

                .cv-auth-form-content input[type="email"],
                .cv-auth-form-content input[type="password"],
                .cv-auth-form-content input[type="text"],
                .cv-auth-form-content [data-slot="input"] {
                    background: transparent !important;
                    border: none !important;
                    border-bottom: 1px solid var(--cv-input-border) !important;
                    border-radius: 0 !important;
                    color: var(--cv-input-text) !important;
                    font-family: inherit !important;
                    font-size: 15px !important;
                    padding: 10px 2px !important;
                    transition: border-color 0.2s, box-shadow 0.2s !important;
                    box-shadow: none !important;
                    outline: none !important;
                    -webkit-appearance: none !important;
                }
                .cv-auth-form-content input[type="email"]:focus,
                .cv-auth-form-content input[type="password"]:focus,
                .cv-auth-form-content input[type="text"]:focus,
                .cv-auth-form-content [data-slot="input"]:focus {
                    border-bottom-color: var(--cv-accent) !important;
                    box-shadow: 0 1px 0 0 var(--cv-accent) !important;
                }
                .cv-auth-form-content input::placeholder,
                .cv-auth-form-content [data-slot="input"]::placeholder {
                    color: var(--cv-placeholder) !important;
                }

                .cv-auth-form-content label,
                .cv-auth-form-content [data-slot="label"] {
                    color: var(--cv-text-secondary) !important;
                    font-size: 12.5px !important;
                    font-weight: 600 !important;
                    letter-spacing: 0 !important;
                    text-transform: none !important;
                }

                .cv-auth-form-content button[type="submit"],
                .cv-auth-form-content [data-slot="button"][type="submit"] {
                    background: transparent !important;
                    border: 1.5px solid var(--cv-accent) !important;
                    border-radius: 8px !important;
                    color: var(--cv-accent) !important;
                    font-weight: 700 !important;
                    font-family: inherit !important;
                    font-size: 14px !important;
                    letter-spacing: 0.01em !important;
                    padding: 12px 28px !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                    box-shadow: none !important;
                    width: 100%;
                }
                .cv-auth-form-content button[type="submit"]:hover:not(:disabled) {
                    background: color-mix(in srgb, var(--cv-accent) 10%, transparent) !important;
                    transform: translateY(-1px) !important;
                }
                .cv-auth-form-content button[type="submit"]:focus-visible {
                    outline: 2px solid var(--cv-accent) !important;
                    outline-offset: 2px !important;
                }
                .cv-auth-form-content button[type="submit"]:disabled {
                    opacity: 0.4 !important;
                    cursor: not-allowed !important;
                }

                .cv-auth-form-content a {
                    color: var(--cv-accent) !important;
                    text-decoration: none !important;
                    transition: color 0.2s !important;
                }
                .cv-auth-form-content a:hover { color: var(--cv-accent-2) !important; }
                .cv-auth-form-content .text-muted-foreground { color: var(--cv-text-tertiary) !important; }

                .cv-auth-form-content input[type="checkbox"],
                .cv-auth-form-content [data-slot="checkbox"] {
                    accent-color: var(--cv-accent) !important;
                }

                .cv-auth-form-content [data-slot="separator"],
                .cv-auth-form-content hr {
                    border-color: var(--cv-divider) !important;
                }

                /* ---------------- breakpoint: split layout ---------------- */
                @media (min-width: 860px) {
                    .cv-auth-left { display: flex !important; }
                    .cv-auth-right {
                        width: 420px !important;
                        border-radius: 0 20px 20px 0 !important;
                        border-left: none !important;
                    }
                    .cv-auth-left { border-radius: 20px 0 0 20px; }
                    .cv-auth-mobile-logo { display: none !important; }
                }

                @media (prefers-reduced-motion: reduce) {
                    .cv-theme-toggle, .cv-back-link, .cv-auth-right { transition: none !important; }
                }
            `}</style>
        </div>
    );
}