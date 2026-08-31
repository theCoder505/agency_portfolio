import React, { useState, useEffect, useRef } from 'react';

interface SurfacePreloaderProps {
    brandName?: string;
    logoLight?: string;
    logoDark?: string;
}

// --- Building Block Grid Config ---
const COLS = 8;
const ROWS = 6;
const TOTAL = COLS * ROWS;

function getGridPos(index: number) {
    const col = index % COLS;
    const row = Math.floor(index / COLS);
    return { col, row };
}

// Each block gets a staggered delay based on a "connection wave" from center
function getBlockDelay(index: number): number {
    const { col, row } = getGridPos(index);
    const centerCol = (COLS - 1) / 2;
    const centerRow = (ROWS - 1) / 2;
    const dist = Math.sqrt(Math.pow(col - centerCol, 2) + Math.pow(row - centerRow, 2));
    // Blocks connect inward from edges → center over ~1.2s
    return (dist / Math.max(centerCol, centerRow)) * 1.1;
}

// Gradient colours assigned per block column for a vibrant "circuit board" palette
const BLOCK_COLORS = [
    ['#0e7490', '#06b6d4'],   // cyan
    ['#1d4ed8', '#3b82f6'],   // blue
    ['#4f46e5', '#818cf8'],   // indigo
    ['#7c3aed', '#a78bfa'],   // violet
    ['#1d4ed8', '#38bdf8'],   // sky blue
    ['#0891b2', '#22d3ee'],   // cyan-light
    ['#312e81', '#6366f1'],   // deep indigo
    ['#0e7490', '#67e8f9'],   // bright cyan
];

export const SurfacePreloader: React.FC<SurfacePreloaderProps> = ({
    brandName = 'CodeVenture',
}) => {
    const [phase, setPhase] = useState<'build' | 'hold' | 'exit'>('build');
    const [isRendered, setIsRendered] = useState(true);
    const [progress, setProgress] = useState(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        // Progress animation over ~2.8s
        let start: number | null = null;
        const duration = 2800;
        const tick = (ts: number) => {
            if (!start) start = ts;
            const pct = Math.min(((ts - start) / duration) * 100, 100);
            setProgress(Math.round(pct));
            if (pct < 100) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);

        // Phase transitions
        const holdTimer = setTimeout(() => setPhase('hold'), 2400);
        const exitTimer = setTimeout(() => {
            setPhase('exit');
            document.body.style.overflow = originalOverflow;
            setTimeout(() => setIsRendered(false), 800);
        }, 3300);

        return () => {
            clearTimeout(holdTimer);
            clearTimeout(exitTimer);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    if (!isRendered) return null;

    return (
        <div
            id="cv-preloader"
            aria-live="polite"
            aria-label="Loading CodeVenture Tech"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#020617',
                overflow: 'hidden',
                fontFamily: "'Satoshi Variable', 'Satoshi', ui-sans-serif, system-ui, sans-serif",
                transition: 'opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1)',
                opacity: phase === 'exit' ? 0 : 1,
                transform: phase === 'exit' ? 'scale(1.04)' : 'scale(1)',
                pointerEvents: phase === 'exit' ? 'none' : 'auto',
                userSelect: 'none',
            }}
        >
            {/* ── Deep ambient gradient orbs ── */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div className="cv-pl-orb cv-pl-orb-a" style={{
                    position: 'absolute', top: '30%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 700, height: 700, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(79,70,229,0.22) 0%, rgba(6,182,212,0.08) 55%, transparent 75%)',
                    filter: 'blur(80px)',
                }} />
                <div className="cv-pl-orb cv-pl-orb-b" style={{
                    position: 'absolute', top: '65%', left: '60%',
                    transform: 'translate(-50%, -50%)',
                    width: 500, height: 500, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(147,51,234,0.18) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                }} />
                <div className="cv-pl-orb cv-pl-orb-c" style={{
                    position: 'absolute', top: '50%', left: '30%',
                    transform: 'translate(-50%, -50%)',
                    width: 400, height: 400, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(34,211,238,0.14) 0%, transparent 70%)',
                    filter: 'blur(50px)',
                }} />
                {/* Grid lines */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `
                        linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)
                    `,
                    backgroundSize: '48px 48px',
                }} />
            </div>

            {/* ── Building Blocks Grid ── */}
            <div style={{ position: 'relative', zIndex: 10 }}>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${COLS}, 36px)`,
                        gridTemplateRows: `repeat(${ROWS}, 36px)`,
                        gap: 5,
                    }}
                >
                    {Array.from({ length: TOTAL }).map((_, i) => {
                        const { col } = getGridPos(i);
                        const delay = getBlockDelay(i);
                        const [colorA, colorB] = BLOCK_COLORS[col % BLOCK_COLORS.length];
                        return (
                            <div
                                key={i}
                                className="cv-block"
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 6,
                                    background: `linear-gradient(135deg, ${colorA}, ${colorB})`,
                                    animationDelay: `${delay}s`,
                                    border: `1px solid ${colorB}44`,
                                    boxShadow: `0 0 10px ${colorB}33`,
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Inner shimmer line */}
                                <div className="cv-block-shimmer" style={{ animationDelay: `${delay + 0.3}s` }} />
                                {/* Corner connector dot */}
                                <div style={{
                                    position: 'absolute', bottom: 3, right: 3,
                                    width: 5, height: 5, borderRadius: '50%',
                                    background: colorB,
                                    opacity: 0.8,
                                }} />
                            </div>
                        );
                    })}
                </div>

                {/* ── Circuit connector lines overlay (SVG) ── */}
                <svg
                    style={{
                        position: 'absolute',
                        top: 0, left: 0,
                        width: '100%', height: '100%',
                        pointerEvents: 'none',
                    }}
                    viewBox={`0 0 ${COLS * 41} ${ROWS * 41}`}
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="cv-wire-h" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="cv-wire-v" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                            <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    {/* Horizontal wires every 2 rows */}
                    {[1, 3, 5].map(row => (
                        <line
                            key={`h${row}`}
                            className="cv-wire-h"
                            x1={0} y1={row * 41 + 18}
                            x2={COLS * 41} y2={row * 41 + 18}
                            stroke="url(#cv-wire-h)"
                            strokeWidth={1}
                            strokeDasharray="4 3"
                            style={{ animationDelay: `${0.2 * row}s` }}
                        />
                    ))}
                    {/* Vertical wires every 2 cols */}
                    {[1, 3, 5, 7].map(col => (
                        <line
                            key={`v${col}`}
                            className="cv-wire-v"
                            x1={col * 41 + 18} y1={0}
                            x2={col * 41 + 18} y2={ROWS * 41}
                            stroke="url(#cv-wire-v)"
                            strokeWidth={1}
                            strokeDasharray="4 3"
                            style={{ animationDelay: `${0.15 * col}s` }}
                        />
                    ))}
                    {/* Travelling "data pulse" dot on center H wire */}
                    <circle className="cv-data-pulse" r={3} cy={3 * 41 + 18} fill="#22d3ee" />
                </svg>
            </div>

            {/* ── Brand name + progress bar ── */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                marginTop: 32,
            }}>
                {/* Logo mark (bracket symbol) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <svg width="14" height="22" viewBox="0 0 14 22" fill="none">
                        <polyline points="11,2 2,11 11,20"
                            stroke="url(#cv-bracket-g)" strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round" />
                        <defs>
                            <linearGradient id="cv-bracket-g" x1="0" y1="0" x2="0" y2="22" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#67e8f9" />
                                <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <div className="cv-pl-brand" style={{
                        fontSize: 14,
                        fontWeight: 800,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        background: 'linear-gradient(90deg, #a5b4fc 0%, #c084fc 45%, #67e8f9 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        whiteSpace: 'nowrap',
                    }}>
                        {brandName}
                    </div>

                    <svg width="14" height="22" viewBox="0 0 14 22" fill="none">
                        <polyline points="3,2 12,11 3,20"
                            stroke="url(#cv-bracket-g2)" strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round" />
                        <defs>
                            <linearGradient id="cv-bracket-g2" x1="0" y1="0" x2="0" y2="22" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#67e8f9" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Tagline */}
                <div className="cv-pl-tagline" style={{
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(148,163,184,0.6)',
                }}>
                    Building the digital future
                </div>

                {/* Progress bar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 180 }}>
                    <div style={{
                        width: '100%', height: 3, borderRadius: 99,
                        background: 'rgba(99,102,241,0.15)', overflow: 'hidden',
                        position: 'relative',
                    }}>
                        <div style={{
                            position: 'absolute', left: 0, top: 0, bottom: 0,
                            width: `${progress}%`, borderRadius: 99,
                            background: 'linear-gradient(90deg, #6366f1, #a855f7, #22d3ee)',
                            transition: 'width 0.08s linear',
                            boxShadow: '0 0 10px rgba(99,102,241,0.8)',
                        }} />
                        <div className="cv-pl-shimmer" style={{
                            position: 'absolute', top: 0, bottom: 0, width: 60,
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                            borderRadius: 99,
                        }} />
                    </div>
                    <div style={{
                        fontSize: 10, fontWeight: 700,
                        letterSpacing: '0.1em',
                        color: 'rgba(165,180,252,0.7)',
                        fontVariantNumeric: 'tabular-nums',
                    }}>
                        {progress}%
                    </div>
                </div>
            </div>

            <style>{`
                /* ─── Orb gentle pulses ─── */
                @keyframes cv-pl-orb-pulse {
                    0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
                    50%       { opacity: 1;   transform: translate(-50%, -50%) scale(1.08); }
                }
                .cv-pl-orb-a { animation: cv-pl-orb-pulse 4.5s ease-in-out infinite; }
                .cv-pl-orb-b { animation: cv-pl-orb-pulse 5.5s ease-in-out infinite 1s; }
                .cv-pl-orb-c { animation: cv-pl-orb-pulse 3.8s ease-in-out infinite 2s; }

                /* ─── Building block connect-in animation ─── */
                @keyframes cv-block-connect {
                    0%   { opacity: 0; transform: scale(0.4) rotate(-8deg); }
                    60%  { opacity: 1; transform: scale(1.1) rotate(2deg); }
                    80%  { transform: scale(0.95) rotate(-1deg); }
                    100% { opacity: 1; transform: scale(1) rotate(0deg); }
                }
                .cv-block {
                    opacity: 0;
                    animation: cv-block-connect 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }

                /* ─── Block inner shimmer ─── */
                @keyframes cv-block-shimmer-anim {
                    0%   { left: -60%; opacity: 0; }
                    20%  { opacity: 1; }
                    100% { left: 110%; opacity: 0; }
                }
                .cv-block-shimmer {
                    position: absolute;
                    top: 0; bottom: 0;
                    width: 40%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
                    left: -60%;
                    animation: cv-block-shimmer-anim 1.6s ease-in-out infinite;
                }

                /* ─── Wire fade-in ─── */
                @keyframes cv-wire-draw {
                    0%   { stroke-dashoffset: 100; opacity: 0; }
                    50%  { opacity: 0.8; }
                    100% { stroke-dashoffset: 0; opacity: 1; }
                }
                .cv-wire-h, .cv-wire-v {
                    stroke-dasharray: 4 3;
                    stroke-dashoffset: 100;
                    opacity: 0;
                    animation: cv-wire-draw 1.2s ease-out forwards;
                    animation-delay: 0.8s;
                }

                /* ─── Data pulse travelling dot ─── */
                @keyframes cv-data-travel {
                    0%   { transform: translateX(0); opacity: 0; }
                    5%   { opacity: 1; }
                    95%  { opacity: 1; }
                    100% { transform: translateX(${COLS * 41}px); opacity: 0; }
                }
                .cv-data-pulse {
                    animation: cv-data-travel 2s ease-in-out infinite;
                    animation-delay: 1.2s;
                }

                /* ─── Brand name sweep in ─── */
                @keyframes cv-pl-brand-in {
                    0%   { opacity: 0; letter-spacing: 0.4em; }
                    40%  { opacity: 0; }
                    75%  { opacity: 1; letter-spacing: 0.22em; }
                    100% { opacity: 1; letter-spacing: 0.22em; }
                }
                .cv-pl-brand {
                    animation: cv-pl-brand-in 2.2s ease-out forwards;
                }

                /* ─── Tagline fade in ─── */
                @keyframes cv-pl-tagline-in {
                    0%, 50% { opacity: 0; }
                    100%    { opacity: 1; }
                }
                .cv-pl-tagline {
                    animation: cv-pl-tagline-in 2.5s ease-out forwards;
                }

                /* ─── Progress shimmer sweep ─── */
                @keyframes cv-pl-shimmer-sweep {
                    0%   { left: -60px; }
                    100% { left: calc(100% + 60px); }
                }
                .cv-pl-shimmer {
                    animation: cv-pl-shimmer-sweep 1.6s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};