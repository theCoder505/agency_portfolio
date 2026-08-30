import React, { useState, useEffect } from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import { SaasProduct, SharedData } from '@/types';
import { SurfaceLayout } from '@/layouts/surface-layout';
import { formatCurrency, formatNumberEnUs } from '@/lib/formatters';
import {
    CheckCircle2,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    Zap,
    Globe,
    Cpu,
    Calendar,
    Server,
    Layers,
    Shield,
    Database,
    Lock,
    Headphones,
    Check,
    X,
    Star,
    ExternalLink,
    Maximize2,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    RotateCcw
} from 'lucide-react';

interface SaasProductShowProps {
    product: SaasProduct;
    relatedProducts: SaasProduct[];
    paymentSettings: {
        currency_symbol: string;
        currency_code: string;
        bkash_number: string;
        bkash_instructions?: string;
        bkash_enabled: boolean;
        nagad_number: string;
        nagad_instructions?: string;
        nagad_enabled: boolean;
    };
}

// Interactive Image Slider & Lightbox with Zoom/Pan
function ProductImageMagnifierSlider({ images, productName }: { images: string[]; productName: string }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Lightbox zoom & pan states
    const [zoomLevel, setZoomLevel] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const activeImage = images[currentIndex] || undefined;

    const resetZoomAndPan = () => {
        setZoomLevel(1);
        setPan({ x: 0, y: 0 });
        setIsDragging(false);
    };

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        resetZoomAndPan();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        resetZoomAndPan();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleSelectImage = (index: number) => {
        resetZoomAndPan();
        setCurrentIndex(index);
    };

    const handleZoomIn = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setZoomLevel((prev) => Math.min(5, Number((prev + 0.5).toFixed(2))));
    };

    const handleZoomOut = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setZoomLevel((prev) => {
            const next = Math.max(1, Number((prev - 0.5).toFixed(2)));
            if (next === 1) setPan({ x: 0, y: 0 });
            return next;
        });
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
        const delta = e.deltaY < 0 ? 0.25 : -0.25;
        setZoomLevel((prev) => {
            const next = Math.max(1, Math.min(5, Number((prev + delta).toFixed(2))));
            if (next === 1) setPan({ x: 0, y: 0 });
            return next;
        });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoomLevel > 1) {
            e.preventDefault();
            setIsDragging(true);
            setDragStart({
                x: e.clientX - pan.x,
                y: e.clientY - pan.y,
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && zoomLevel > 1) {
            e.preventDefault();
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    };

    const handleMouseUp = () => {
        if (isDragging) setIsDragging(false);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (zoomLevel > 1) {
            resetZoomAndPan();
        } else {
            setZoomLevel(2.5);
        }
    };

    // Fullscreen behavior: Keyboard navigation & lock background scroll
    useEffect(() => {
        if (!isFullscreen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'Escape') {
                setIsFullscreen(false);
                resetZoomAndPan();
            }
            if (e.key === '+' || e.key === '=') handleZoomIn();
            if (e.key === '-') handleZoomOut();
            if (e.key === '0') resetZoomAndPan();
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isFullscreen, images.length, zoomLevel]);

    if (!activeImage && images.length === 0) {
        return (
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center justify-center text-slate-500 p-8">
                <Layers className="h-16 w-16 mb-2 text-indigo-400" />
                <span className="text-sm font-bold">Product Showcase Preview</span>
            </div>
        );
    }

    return (
        <div className="space-y-4 select-none">
            {/* MAIN IMAGE SLIDER CONTAINER */}
            <div
                className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-2xl group cursor-pointer"
                onClick={() => {
                    setIsFullscreen(true);
                    resetZoomAndPan();
                }}
            >
                {/* Image */}
                <div className="w-full h-full overflow-hidden flex items-center justify-center">
                    <img
                        src={activeImage}
                        alt={`${productName} - View ${currentIndex + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                </div>

                {/* Ambient vignette */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

                {/* Top Badge: Slide Counter */}
                <div className="absolute top-4 left-4 flex items-center space-x-2 pointer-events-none z-10">
                    <div className="px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-white font-bold text-xs shadow-lg flex items-center space-x-1.5">
                        <Maximize2 className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Click for Fullscreen View</span>
                    </div>
                    {images.length > 1 && (
                        <div className="px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-slate-300 font-mono font-bold text-xs shadow-lg">
                            {currentIndex + 1} / {images.length}
                        </div>
                    )}
                </div>

                {/* Top Right: Fullscreen Lightbox Button */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsFullscreen(true);
                        resetZoomAndPan();
                    }}
                    className="absolute top-4 right-4 p-2.5 rounded-2xl bg-slate-950/80 hover:bg-indigo-600 text-white backdrop-blur-md border border-white/10 shadow-lg transition-all z-10 hover:scale-105"
                    title="Open Fullscreen View"
                >
                    <Maximize2 className="h-4 w-4" />
                </button>

                {/* Slider Prev / Next Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={handlePrev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-slate-950/70 hover:bg-indigo-600 text-white backdrop-blur-md border border-white/10 shadow-xl transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
                            aria-label="Previous Screenshot"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={handleNext}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-slate-950/70 hover:bg-indigo-600 text-white backdrop-blur-md border border-white/10 shadow-xl transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
                            aria-label="Next Screenshot"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </>
                )}

                {/* Bottom Slide Dots */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 p-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 z-10">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectImage(idx);
                                }}
                                className={`h-2 rounded-full transition-all ${
                                    currentIndex === idx
                                        ? 'w-6 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                                        : 'w-2 bg-white/40 hover:bg-white/70'
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* FULLSCREEN LIGHTBOX MODAL */}
            {isFullscreen && (
                <div
                    className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-between p-3 sm:p-4 gap-2 animate-in fade-in select-none"
                    onClick={() => {
                        setIsFullscreen(false);
                        resetZoomAndPan();
                    }}
                >
                    {/* Top Bar */}
                    <div className="w-full flex items-center justify-between z-20 gap-4" onClick={(e) => e.stopPropagation()}>
                        <div className="text-white font-bold text-sm flex items-center space-x-2 truncate">
                            <span className="truncate">{productName}</span>
                            {images.length > 1 && (
                                <span className="text-slate-400 text-xs font-mono shrink-0">({currentIndex + 1} / {images.length})</span>
                            )}
                        </div>

                        {/* Zoom Controls */}
                        <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-white/10 backdrop-blur-md rounded-2xl px-2 py-1 shadow-2xl">
                            <button
                                type="button"
                                onClick={handleZoomOut}
                                disabled={zoomLevel <= 1}
                                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                title="Zoom Out (-)"
                            >
                                <ZoomOut className="h-4 w-4" />
                            </button>
                            <span className="text-xs font-mono font-bold text-cyan-400 px-2 min-w-[52px] text-center">
                                {Math.round(zoomLevel * 100)}%
                            </span>
                            <button
                                type="button"
                                onClick={handleZoomIn}
                                disabled={zoomLevel >= 5}
                                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                title="Zoom In (+)"
                            >
                                <ZoomIn className="h-4 w-4" />
                            </button>
                            {zoomLevel > 1 && (
                                <button
                                    type="button"
                                    onClick={resetZoomAndPan}
                                    className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all ml-1"
                                    title="Reset Zoom (0)"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setIsFullscreen(false);
                                resetZoomAndPan();
                            }}
                            className="p-2.5 rounded-2xl bg-white/10 hover:bg-red-600 text-white transition-all shrink-0"
                            title="Close Fullscreen (Esc)"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Centered Image with Scroll-Zoom & Mouse Drag */}
                    <div
                        className={`relative w-full flex-1 flex items-center justify-center overflow-hidden ${
                            zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                        onWheel={handleWheel}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onDoubleClick={handleDoubleClick}
                    >
                        <img
                            src={activeImage}
                            alt={`${productName} Fullscreen`}
                            draggable={false}
                            className="h-full w-auto max-h-full max-w-full rounded-none object-contain select-none transition-transform duration-75 will-change-transform pointer-events-none"
                            style={{
                                transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoomLevel})`,
                            }}
                        />

                        {/* Slider arrows in lightbox */}
                        {images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={handlePrev}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 p-3.5 rounded-2xl bg-slate-900/80 hover:bg-indigo-600 text-white border border-white/10 shadow-2xl transition-all hover:scale-110 z-30"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3.5 rounded-2xl bg-slate-900/80 hover:bg-indigo-600 text-white border border-white/10 shadow-2xl transition-all hover:scale-110 z-30"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Bottom Toolbar & Instructions */}
                    <div className="flex flex-col items-center space-y-2 z-20" onClick={(e) => e.stopPropagation()}>
                        <div className="text-[11px] font-mono text-slate-400 bg-slate-900/70 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                            💡 Scroll wheel to zoom in/out • Hold & drag to pan • Double click to toggle
                        </div>

                        {/* Bottom thumbnail strip in lightbox */}
                        {images.length > 1 && (
                            <div className="flex items-center space-x-2 overflow-x-auto p-2 max-w-2xl">
                                {images.map((imgUrl, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleSelectImage(i)}
                                        className={`h-12 w-18 sm:h-14 sm:w-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                                            currentIndex === i
                                                ? 'border-cyan-400 ring-2 ring-cyan-400/40 scale-105 opacity-100'
                                                : 'border-white/20 opacity-50 hover:opacity-100 hover:border-indigo-400'
                                        }`}
                                    >
                                        <img src={imgUrl} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SaasProductShowPage({
    product,
    relatedProducts,
    paymentSettings,
}: SaasProductShowProps) {
    const { app_settings } = usePage<SharedData>().props;
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    // Screenshot gallery images
    const allImages = [
        ...(product.thumbnail ? [product.thumbnail] : []),
        ...(Array.isArray(product.gallery_images) ? product.gallery_images : []),
    ];

    const brandName = app_settings?.brand_name || 'CodeVenture Tech';
    const currency = product.currency || paymentSettings.currency_symbol || '৳';

    // Packages
    const packages = product.packages || {
        basic: {
            name: 'Basic Plan',
            tagline: 'Essential capabilities for startups and agile squads',
            monthly_price: Math.round(product.monthly_price * 0.7),
            yearly_price: Math.round(product.yearly_price * 0.7),
            badge: 'Starter',
            is_popular: false,
            features: [
                'Single Branch / Location License',
                'Up to 5 Team Member Accounts',
                'Automated Basic Invoicing & Sales Reports',
                `Subdomain SSL (.${product.primary_domain || 'codeventure.app'})`,
                'Standard Email Support',
            ],
        },
        standard: {
            name: 'Standard Plan',
            tagline: 'Most popular choice for growing commercial businesses',
            monthly_price: product.monthly_price,
            yearly_price: product.yearly_price,
            badge: 'Most Popular',
            is_popular: true,
            features: [
                'Multi-Branch Centralized Sync',
                'Up to 25 Team Member Accounts with RBAC',
                'Automated Multi-Currency Invoicing & Tax Calculation',
                'Custom Domain Mapping with Complimentary SSL',
                'Integrated bKash / Nagad Instant Billing API',
                'Priority 24/7 Support with 1-Hour SLA',
            ],
        },
        premium: {
            name: 'Premium Plan',
            tagline: 'Full enterprise power with dedicated cloud instances and VIP engineering',
            monthly_price: Math.round(product.monthly_price * 1.6),
            yearly_price: Math.round(product.yearly_price * 1.6),
            badge: 'Enterprise Suite',
            is_popular: false,
            features: [
                'Unlimited Branches, Warehouses & User Accounts',
                'Dedicated Isolated Cloud Database Instance',
                'Custom ERP Workflows & Webhook Integrations',
                'White-Label Branded Portal & Client Mobile App',
                'Dedicated Senior Account Engineer On-Call',
                '99.99% Uptime Guarantee & Custom Legal SLA',
            ],
        },
    };

    const getTierPrice = (tierKey: 'basic' | 'standard' | 'premium') => {
        const tier = packages[tierKey];
        if (!tier) return { amount: 0, period: '/mo', subtext: '' };

        if (billingCycle === 'yearly') {
            return {
                amount: tier.yearly_price,
                monthlyEquiv: Math.round(tier.yearly_price / 12),
                period: '/year',
                subtext: 'Billed annually (Save ~20%)',
            };
        }

        return {
            amount: tier.monthly_price,
            monthlyEquiv: tier.monthly_price,
            period: '/mo',
            subtext: 'Billed monthly recurring',
        };
    };

    return (
        <SurfaceLayout
            title={`${product.name} - Enterprise Cloud Platform & Packages`}
            description={product.tagline || product.description || `Explore ${product.name} features and package pricing across Basic, Standard, and Premium tiers.`}
        >
            {/* HERO SECTION */}
            <section className="relative pt-12 pb-16 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
                {/* Ambient Glows */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
                    {/* Breadcrumbs */}
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/saas-products" className="hover:text-white transition-colors">SaaS Products</Link>
                        <span>/</span>
                        <span className="text-indigo-400 font-bold truncate max-w-xs">{product.name}</span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pt-2">
                        <div className="space-y-4 max-w-3xl">
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-2">
                                {product.badge && (
                                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-cyan-300 font-bold text-xs flex items-center space-x-1.5">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        <span>{product.badge}</span>
                                    </span>
                                )}
                                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                                    Turnkey Cloud Platform
                                </span>
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                                    Instant bKash/Nagad Activation
                                </span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                                {product.name}
                            </h1>

                            {product.tagline && (
                                <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                                    {product.tagline}
                                </p>
                            )}
                        </div>

                        {/* Quick Jump to Pricing */}
                        <div className="flex sm:flex-row lg:flex-col gap-3 shrink-0">
                            <a
                                href="#package-plans"
                                className="px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center space-x-2 transition-all shadow-xl shadow-indigo-500/25 hover:scale-105"
                            >
                                <span>View Pricing Packages</span>
                                <ArrowRight className="h-4 w-4" />
                            </a>

                            <Link
                                href="/saas-products"
                                className="px-5 py-3.5 rounded-2xl border border-slate-800 hover:bg-slate-800/80 text-slate-300 font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>All Products</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                        <div className="lg:col-span-8">
                            <ProductImageMagnifierSlider images={allImages} productName={product.name} />
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                            <div className="p-7 rounded-3xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                                <div>
                                    <span className="text-[10px] font-bold text-indigo-600 dark:text-cyan-400 uppercase tracking-wider">Infrastructure</span>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Enterprise Architecture</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 shrink-0">
                                            <Shield className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">99.99% Cloud Uptime SLA</h4>
                                            <p className="text-[11px] text-slate-600 dark:text-slate-400">High-availability isolated containers & auto failover.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                                            <Database className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Automated Daily Backups</h4>
                                            <p className="text-[11px] text-slate-600 dark:text-slate-400">Encrypted snapshot redundancy with 1-click restore.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
                                            <Lock className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">End-to-End SSL & Encryption</h4>
                                            <p className="text-[11px] text-slate-600 dark:text-slate-400">TLS 1.3 cryptographic protection for all API traffic.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                                            <Zap className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Instant Gateway Integration</h4>
                                            <p className="text-[11px] text-slate-600 dark:text-slate-400">Direct bKash, Nagad & Card payment support ready.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {product.description && (
                <section className="py-16 bg-slate-50/50 dark:bg-slate-950/40">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Overview</span>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">What is {product.name}?</h2>
                        </div>
                        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 text-sm leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
                            <p>{product.description}</p>
                        </div>
                    </div>
                </section>
            )}

            <section id="package-plans" className="py-24 bg-slate-50/80 dark:bg-slate-950 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                    <div>
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20 text-xs font-bold mb-3">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Tiered Package Selection</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                                Choose the Perfect Plan for {product.name}
                            </h2>
                            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                                Flexible packages tailored for your operational scale with instant cloud provisioning.
                            </p>

                            {/* Billing Cycle Switcher */}
                            <div className="mt-8 inline-flex items-center justify-center">
                                <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
                                    <button
                                        type="button"
                                        onClick={() => setBillingCycle('monthly')}
                                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                                            billingCycle === 'monthly'
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Monthly Billing
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBillingCycle('yearly')}
                                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                                            billingCycle === 'yearly'
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <span>Annual Billing</span>
                                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold">Save ~20%</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 3 Package Cards with 3D Flip */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                            {(['basic', 'standard', 'premium'] as const).map((tierKey) => {
                                const tier = packages[tierKey];
                                if (!tier) return null;
                                const pricing = getTierPrice(tierKey);
                                return (
                                    <div
                                        key={tierKey}
                                        className="group [perspective:1000px] min-h-[580px] w-full"
                                    >
                                        {/* 3D Flipping Container */}
                                        <div className={`relative h-full w-full rounded-3xl transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-md hover:shadow-2xl ${
                                            tier.is_popular
                                                ? 'shadow-indigo-500/10 hover:shadow-indigo-500/30'
                                                : 'shadow-slate-200/50 dark:shadow-none hover:shadow-cyan-500/20'
                                        }`}>

                                            {/* FRONT SIDE OF CARD */}
                                            <div className={`absolute inset-0 h-full w-full rounded-3xl p-7 sm:p-8 flex flex-col justify-between [backface-visibility:hidden] ${
                                                tier.is_popular
                                                    ? 'bg-gradient-to-b from-indigo-50/80 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 text-slate-900 dark:text-white border-2 border-indigo-600 dark:border-indigo-400 shadow-xl shadow-indigo-100 dark:shadow-indigo-500/15'
                                                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-slate-100/80 dark:shadow-none hover:border-indigo-300 dark:hover:border-slate-700'
                                            }`}>
                                                {tier.is_popular && (
                                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                                                        {tier.badge || 'Most Popular'}
                                                    </div>
                                                )}

                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-xl font-black text-slate-900 dark:text-white">{tier.name}</h3>
                                                        {!tier.is_popular && tier.badge && (
                                                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-cyan-400 border border-indigo-200/70 dark:border-indigo-800/60 font-bold text-[10px]">
                                                                {tier.badge}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className={`text-xs leading-relaxed mb-6 ${tier.is_popular ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                                                        {tier.tagline}
                                                    </p>

                                                    <div className={`mb-6 pb-6 border-b ${tier.is_popular ? 'border-indigo-100 dark:border-slate-800' : 'border-slate-100 dark:border-slate-800/80'}`}>
                                                        <div className="flex items-baseline space-x-1.5">
                                                            <span className="text-3xl sm:text-4xl font-black tracking-tight flex items-baseline text-slate-900 dark:text-white">
                                                                <span className="text-2xl sm:text-3xl font-bold mr-1.5 text-indigo-600 dark:text-cyan-400">{currency}</span>
                                                                <span>{pricing.amount.toLocaleString('en-US')}</span>
                                                            </span>
                                                            <span className={`text-xs font-semibold ${tier.is_popular ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                                                {pricing.period}
                                                            </span>
                                                        </div>
                                                        <p className={`text-[11px] mt-1.5 ${tier.is_popular ? 'text-indigo-600 dark:text-cyan-400 font-bold' : 'text-indigo-600 dark:text-cyan-400 font-semibold'}`}>
                                                            {pricing.subtext}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-3 mb-6">
                                                        <div className={`text-[11px] font-bold uppercase tracking-wider ${tier.is_popular ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                                            Included Capabilities:
                                                        </div>
                                                        {tier.features.slice(0, 5).map((feat: string, fIdx: number) => (
                                                            <div key={fIdx} className="flex items-start space-x-2.5 text-xs">
                                                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                                                <span className={tier.is_popular ? 'text-slate-700 dark:text-slate-200' : 'text-slate-700 dark:text-slate-300'}>{feat}</span>
                                                            </div>
                                                        ))}
                                                        {tier.features.length > 5 && (
                                                            <div className={`text-[11px] font-semibold italic pl-6 ${tier.is_popular ? 'text-indigo-600 dark:text-cyan-300' : 'text-indigo-600 dark:text-cyan-400'}`}>
                                                                + {tier.features.length - 5} more enterprise features
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Hint / Flip indicator on Front */}
                                                <div className="pt-2">
                                                    <div className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                                                        tier.is_popular
                                                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700'
                                                    }`}>
                                                        <span>Hover to Flip & Order</span>
                                                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* BACK SIDE OF CARD (3D Flipped 180deg) */}
                                            <div className={`absolute inset-0 h-full w-full rounded-3xl p-7 sm:p-8 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-hidden ${
                                                tier.is_popular
                                                    ? 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 dark:from-indigo-950 dark:via-slate-950 dark:to-indigo-900 text-white border-2 border-indigo-400 dark:border-cyan-400 shadow-2xl shadow-indigo-500/30 dark:shadow-indigo-500/40'
                                                    : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50/70 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950 text-slate-900 dark:text-white border-2 border-indigo-200 dark:border-indigo-500/40 shadow-xl shadow-slate-200/70 dark:shadow-2xl'
                                            }`}>
                                                {/* Ambient Back Glow */}
                                                <div className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-2xl pointer-events-none ${
                                                    tier.is_popular ? 'bg-cyan-400/20' : 'bg-indigo-500/10 dark:bg-cyan-400/10'
                                                }`} />

                                                <div>
                                                    {/* Header on Back */}
                                                    <div className={`flex items-center justify-between pb-3.5 border-b mb-4 ${
                                                        tier.is_popular ? 'border-white/20' : 'border-slate-200 dark:border-white/10'
                                                    }`}>
                                                        <div>
                                                            <span className={`text-[10px] uppercase tracking-wider font-bold ${
                                                                tier.is_popular ? 'text-cyan-300 dark:text-cyan-400' : 'text-indigo-600 dark:text-cyan-400'
                                                            }`}>Package Spec</span>
                                                            <h4 className={`text-lg font-black ${
                                                                tier.is_popular ? 'text-white' : 'text-slate-900 dark:text-white'
                                                            }`}>{tier.name}</h4>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className={`text-base font-black flex items-baseline justify-end ${
                                                                tier.is_popular ? 'text-white' : 'text-slate-900 dark:text-white'
                                                            }`}>
                                                                <span className={`text-sm font-bold mr-1 ${
                                                                    tier.is_popular ? 'text-cyan-300 dark:text-cyan-400' : 'text-indigo-600 dark:text-cyan-400'
                                                                }`}>{currency}</span>
                                                                <span>{pricing.amount.toLocaleString('en-US')}</span>
                                                                <span className={`text-[10px] ml-1 ${
                                                                    tier.is_popular ? 'text-indigo-200 dark:text-slate-400' : 'text-slate-500 dark:text-slate-400'
                                                                }`}>{pricing.period}</span>
                                                            </div>
                                                            <div className={`text-[10px] font-bold ${
                                                                tier.is_popular ? 'text-emerald-300 dark:text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'
                                                            }`}>Instant Setup</div>
                                                        </div>
                                                    </div>

                                                    {/* All Features on Back */}
                                                    <div className="space-y-2.5 mb-4 max-h-[280px] overflow-y-auto pr-1">
                                                        <div className={`text-[11px] font-bold uppercase tracking-wider ${
                                                            tier.is_popular ? 'text-indigo-200 dark:text-slate-400' : 'text-slate-500 dark:text-slate-400'
                                                        }`}>
                                                            All Included Features:
                                                        </div>
                                                        {tier.features.map((feat: string, fIdx: number) => (
                                                            <div key={fIdx} className={`flex items-start space-x-2.5 text-xs ${
                                                                tier.is_popular ? 'text-indigo-50 dark:text-slate-200' : 'text-slate-700 dark:text-slate-200'
                                                            }`}>
                                                                <Check className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${
                                                                    tier.is_popular ? 'text-cyan-300 dark:text-cyan-400' : 'text-indigo-600 dark:text-cyan-400'
                                                                }`} />
                                                                <span>{feat}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Call to action on Back */}
                                                <div className={`space-y-2 pt-3 border-t ${
                                                    tier.is_popular ? 'border-white/20' : 'border-slate-200 dark:border-white/10'
                                                }`}>
                                                    <Link
                                                        href={`/contact?product=${encodeURIComponent(product.name)}&tier=${tierKey}&cycle=${billingCycle}`}
                                                        className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] ${
                                                            tier.is_popular
                                                                ? 'bg-white hover:bg-cyan-50 text-indigo-700 shadow-xl shadow-indigo-900/30 dark:bg-gradient-to-r dark:from-indigo-500 dark:via-indigo-600 dark:to-cyan-400 dark:hover:from-indigo-600 dark:hover:to-cyan-500 dark:text-white'
                                                                : 'bg-slate-900 hover:bg-indigo-600 text-white shadow-lg dark:bg-gradient-to-r dark:from-indigo-500 dark:via-indigo-600 dark:to-cyan-400 dark:hover:from-indigo-600 dark:hover:to-cyan-500 dark:text-white'
                                                        }`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <span>Get Started with {tier.name}</span>
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Link>
                                                    <div className={`text-center text-[10px] ${
                                                        tier.is_popular ? 'text-indigo-200 dark:text-slate-400' : 'text-slate-500 dark:text-slate-400'
                                                    }`}>
                                                        ⚡ Instant billing with bKash, Nagad & Cards
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">Feature Comparison Matrix</h3>
                                <p className="text-xs text-slate-500">Detailed breakdown of infrastructure capabilities across all tiers.</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                                        <th className="py-3 px-4 w-1/3">Platform Capability</th>
                                        <th className="py-3 px-4 text-center">Basic Tier</th>
                                        <th className="py-3 px-4 text-center text-indigo-600 dark:text-cyan-400">Standard Tier (Most Popular)</th>
                                        <th className="py-3 px-4 text-center">Premium Tier</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                    <tr>
                                        <td className="py-3.5 px-4 font-semibold">Cloud Infrastructure & Backup</td>
                                        <td className="py-3.5 px-4 text-center">Weekly Automated</td>
                                        <td className="py-3.5 px-4 text-center font-bold text-indigo-600 dark:text-cyan-400">Daily Automated (99.99% SLA)</td>
                                        <td className="py-3.5 px-4 text-center font-bold">Real-time Redundant Cluster</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3.5 px-4 font-semibold">Custom Domain & SSL</td>
                                        <td className="py-3.5 px-4 text-center">Subdomain Only</td>
                                        <td className="py-3.5 px-4 text-center font-bold text-indigo-600 dark:text-cyan-400">Custom Domain + Free SSL</td>
                                        <td className="py-3.5 px-4 text-center font-bold">Multi-Domain + Wildcard SSL</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3.5 px-4 font-semibold">bKash & Nagad Automated Billing</td>
                                        <td className="py-3.5 px-4 text-center">Manual TrxID</td>
                                        <td className="py-3.5 px-4 text-center font-bold text-indigo-600 dark:text-cyan-400">Automated Direct Gateway</td>
                                        <td className="py-3.5 px-4 text-center font-bold">Full Multi-Gateway Suite</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3.5 px-4 font-semibold">Technical Support SLA</td>
                                        <td className="py-3.5 px-4 text-center">24h Email Support</td>
                                        <td className="py-3.5 px-4 text-center font-bold text-indigo-600 dark:text-cyan-400">1h Priority SLA Support</td>
                                        <td className="py-3.5 px-4 text-center font-bold">Dedicated Senior Engineer</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* RELATED PRODUCTS */}
            {relatedProducts && relatedProducts.length > 0 && (
                <section className="py-16 bg-white dark:bg-slate-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                    Other Enterprise SaaS Solutions
                                </h3>
                                <p className="text-xs text-slate-500">Explore complementary software built by CodeVenture Tech.</p>
                            </div>
                            <Link href="/saas-products" className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline">
                                View All Products →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedProducts.map((rel) => (
                                <Link
                                    key={rel.id}
                                    href={`/saas-products/${rel.slug}`}
                                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 transition-all group"
                                >
                                    {rel.thumbnail && (
                                        <div className="aspect-video w-full rounded-xl overflow-hidden mb-3 bg-slate-900">
                                            <img src={rel.thumbnail} alt={rel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        </div>
                                    )}
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
                                        {rel.name}
                                    </h4>
                                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{rel.tagline}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </SurfaceLayout>
    );
}
