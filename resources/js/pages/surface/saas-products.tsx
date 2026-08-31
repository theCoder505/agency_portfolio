import React, { useState } from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import { SaasProduct, SharedData } from '@/types';
import { SurfaceLayout } from '@/layouts/surface-layout';
import { formatCurrency, formatNumberEnUs } from '@/lib/formatters';
import {
    CheckCircle2,
    Sparkles,
    ArrowRight,
    Zap,
    Globe,
    Cpu,
    Calendar,
    Server,
    Layers,
    HelpCircle,
    Database,
    Shield,
    Headphones,
    ArrowUpRight,
    Package,
    ChevronDown,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface SaasProductsPageProps {
    products: SaasProduct[];
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

// Interactive Product Card Image Slider with gentle scale on hover
function ProductCardImageSlider({
    product,
    icon: IconComp,
}: {
    product: SaasProduct;
    icon: React.ComponentType<{ className?: string }>;
}) {
    const images = [
        ...(product.thumbnail ? [product.thumbnail] : []),
        ...(Array.isArray(product.gallery_images) ? product.gallery_images : []),
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const activeImage = images[currentIndex] || undefined;

    const handlePrev = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="relative aspect-video w-full overflow-hidden bg-slate-950 group/slider">
            {activeImage ? (
                <div className="w-full h-full overflow-hidden flex items-center justify-center">
                    <img
                        src={activeImage}
                        alt={`${product.name} Preview`}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.12]"
                    />
                </div>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-indigo-400 p-6 text-center">
                    <IconComp className="h-12 w-12 mb-2 text-indigo-400 group-hover:scale-110 transition-transform duration-500" />
                    <span className="text-xs font-bold text-slate-300">{product.name}</span>
                </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500" />

            {/* Top Highlight Badge */}
            {product.badge && (
                <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-indigo-600/90 backdrop-blur-md text-white font-black text-[10px] tracking-wider uppercase shadow-md flex items-center space-x-1 z-10">
                    <Sparkles className="h-3 w-3 text-cyan-300" />
                    <span>{product.badge}</span>
                </div>
            )}

            {/* Featured Pill */}
            {product.is_featured && (
                <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-slate-950 font-black text-[10px] uppercase shadow-md z-10">
                    ★ Featured
                </div>
            )}

            {/* Floating Icon */}
            <div className="absolute bottom-3 left-3.5 h-10 w-10 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/10 text-cyan-400 flex items-center justify-center shadow-lg z-10 transition-transform duration-300 group-hover:scale-105">
                <IconComp className="h-5 w-5" />
            </div>

            {/* Slider Navigation Arrows (if multiple images) */}
            {images.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={handlePrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-950/70 hover:bg-indigo-600 text-white backdrop-blur-md border border-white/10 shadow-lg transition-all opacity-0 group-hover/slider:opacity-100 hover:scale-110 z-20"
                        title="Previous Image"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-950/70 hover:bg-indigo-600 text-white backdrop-blur-md border border-white/10 shadow-lg transition-all opacity-0 group-hover/slider:opacity-100 hover:scale-110 z-20"
                        title="Next Image"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* Slide Dots */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-1 p-1 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/10 z-10">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setCurrentIndex(idx);
                                }}
                                className={`h-1.5 rounded-full transition-all ${currentIndex === idx
                                    ? 'w-4 bg-cyan-400'
                                    : 'w-1.5 bg-white/40 hover:bg-white/70'
                                    }`}
                                aria-label={`Slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function SaasProductsPage({
    products,
    paymentSettings,
}: SaasProductsPageProps) {
    const { app_settings } = usePage<SharedData>().props;
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

    const brandName = app_settings?.brand_name || 'CodeVenture Tech';
    const currency = paymentSettings.currency_symbol || '৳';

    // Helper to get icon component
    const getProductIcon = (iconName?: string | null) => {
        switch (iconName) {
            case 'Database': return Database;
            case 'Globe': return Globe;
            case 'Cpu': return Cpu;
            case 'Calendar': return Calendar;
            case 'Server': return Server;
            case 'Zap': return Zap;
            default: return Layers;
        }
    };

    // Calculate baseline "starting from" price for the product card
    const getStartingPrice = (product: SaasProduct) => {
        const basicTier = product.packages?.basic;
        if (basicTier) {
            if (billingCycle === 'yearly') {
                return {
                    amount: basicTier.yearly_price,
                    monthlyEquiv: Math.round(basicTier.yearly_price / 12),
                    periodLabel: '/year',
                    subtext: 'Billed annually (Save ~20%)',
                };
            }
            return {
                amount: basicTier.monthly_price,
                monthlyEquiv: basicTier.monthly_price,
                periodLabel: '/mo',
                subtext: 'Standard monthly plan',
            };
        }

        if (billingCycle === 'yearly') {
            return {
                amount: product.yearly_price,
                monthlyEquiv: Math.round(product.yearly_price / 12),
                periodLabel: '/year',
                subtext: 'Billed annually',
            };
        }

        return {
            amount: product.monthly_price,
            monthlyEquiv: product.monthly_price,
            periodLabel: '/mo',
            subtext: 'Standard monthly plan',
        };
    };

    const defaultFaqs = [
        {
            q: 'How do I choose between Basic, Standard, and Premium packages?',
            a: 'Click on any product to view the full product specifications and compare features across the Basic, Standard, and Premium tiers. Each package is tailored for different business scales, from single-outlet startups to large enterprises.',
        },
        {
            q: 'How does the bKash and Nagad payment validation work?',
            a: 'When you place an order, send the package amount to our official bKash or Nagad number. Submit the Transaction ID (TrxID) and sender phone number at checkout. Our engineering team validates the transaction and provisions your cloud environment within minutes.',
        },
        {
            q: 'Can I connect my company custom domain or subdomain?',
            a: 'Yes! All plans support custom domains (e.g. yourcompany.com) or free managed subdomains (e.g. yourbrand.codeventure.app) with complimentary SSL encryption and global CDN acceleration.',
        },
        {
            q: 'Can I upgrade my package tier or switch billing cycles later?',
            a: 'Yes, you can upgrade from Basic to Standard or Premium anytime directly from your customer portal dashboard or by reaching out to our dedicated support squad.',
        },
    ];

    let faqs = defaultFaqs;
    if (app_settings?.faqs_json) {
        try {
            const parsed = JSON.parse(app_settings.faqs_json);
            if (Array.isArray(parsed) && parsed.length > 0) {
                faqs = parsed;
            }
        } catch (e) {
            // fallback
        }
    }

    return (
        <SurfaceLayout
            title="Enterprise SaaS Products & Cloud Platforms"
            description="Explore ready-to-deploy enterprise SaaS products engineered by CodeVenture Tech with sub-second performance, tiered packages, and bKash/Nagad instant verification."
        >
            {/* HERO BANNER */}
            <section className="relative pt-16 pb-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
                    <div className="cv-badge" data-aos="fade-down">
                        <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Turnkey SaaS Engineering & Managed Cloud Subscriptions</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight max-w-4xl mx-auto" data-aos="fade-up">
                        High-Performance SaaS Products Built for Growth
                    </h1>

                    <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed" data-aos="fade-up" data-aos-delay="100">
                        Choose your enterprise software platform. Click any product to explore full architectural details, screenshots, and package information across <strong>Basic</strong>, <strong>Standard</strong>, and <strong>Premium</strong> tiers.
                    </p>

                    {/* BILLING CYCLE SELECTOR TOGGLE */}
                    <div className="pt-6 flex justify-center" data-aos="fade-up" data-aos-delay="150">
                        <div className="inline-flex p-1.5 rounded-2xl cv-card shadow-2xl backdrop-blur-md">
                            <button
                                type="button"
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${billingCycle === 'monthly'
                                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                Monthly Billing
                            </button>

                            <button
                                type="button"
                                onClick={() => setBillingCycle('yearly')}
                                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${billingCycle === 'yearly'
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/20'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <span>Annual Billing</span>
                                <span className="px-2 py-0.5 rounded-md bg-[#010a10] text-cyan-400 text-[10px] font-black uppercase tracking-wider">
                                    Save ~20%
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRODUCT CATALOG SECTION - 3 ITEMS PER ROW ON LG SCREEN */}
            <section className="py-20 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {products.length === 0 ? (
                        <div className="text-center py-20 cv-card rounded-3xl p-12">
                            <Layers className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No SaaS products published yet</h3>
                            <p className="text-sm text-slate-500 mt-2">Check back soon or contact our team for custom product inquiries.</p>
                        </div>
                    ) : (
                        /* 3 ITEMS PER ROW ON LG SCREEN */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                            {products.map((product, idx) => {
                                const IconComp = getProductIcon(product.icon);
                                const priceInfo = getStartingPrice(product);

                                return (
                                    <div
                                        key={product.id}
                                        data-aos="fade-up"
                                        data-aos-delay={`${(idx % 3) * 100}`}
                                        className="cv-card group relative flex flex-col justify-between rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
                                    >
                                        {/* TOP PRODUCT IMAGE SLIDER WITH GENTLE SCALE */}
                                        <ProductCardImageSlider product={product} icon={IconComp} />

                                        {/* BODY CONTENT: TITLE, TAGLINE, TIERS & PRICE */}
                                        <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5 relative z-10">
                                            <div className="space-y-3">
                                                {/* Title */}
                                                <Link
                                                    href={`/saas-products/${product.slug}`}
                                                    className="block group-hover:text-cyan-400 transition-all duration-300"
                                                >
                                                    <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-snug">
                                                        {product.name}
                                                    </h3>
                                                </Link>

                                                {/* Tagline / Description */}
                                                {product.tagline && (
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-300 line-clamp-2 leading-relaxed transition-colors duration-300">
                                                        {product.tagline}
                                                    </p>
                                                )}

                                                {/* Package Tier Badges: Basic, Standard, Premium */}
                                                <div className="pt-1 flex flex-wrap items-center gap-1.5">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                                                        Tiers:
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200/60 dark:border-slate-700 transition-all duration-300">
                                                        Basic
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-[10px] font-black border border-cyan-200/60 dark:border-cyan-800 transition-all duration-300">
                                                        Standard
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200/60 dark:border-blue-800 transition-all duration-300">
                                                        Premium
                                                    </span>
                                                </div>

                                                {/* Starting Price Banner */}
                                                <div className="p-3 -mx-3 rounded-2xl bg-slate-50/70 dark:bg-[#01121e]/80 border border-slate-200/60 dark:border-cyan-500/15 transition-all duration-300">
                                                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                        Starting from
                                                    </div>
                                                    <div className="flex items-baseline space-x-1.5 mt-0.5">
                                                        <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">
                                                            {formatCurrency(priceInfo.amount, product.currency || currency, 0)}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                                            {priceInfo.periodLabel}
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold mt-0.5">
                                                        {priceInfo.subtext}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ACTION CTA BUTTONS */}
                                            <div className="pt-4 border-t border-slate-100 dark:border-cyan-500/10 space-y-2">
                                                <Link
                                                    href={`/saas-products/${product.slug}`}
                                                    className="w-full cv-btn-primary justify-center text-xs py-3.5 shadow-md group/btn"
                                                >
                                                    <span>View Product & Packages</span>
                                                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                                                </Link>

                                                <Link
                                                    href={`/checkout/${product.slug}?tier=standard&billing_cycle=${billingCycle}`}
                                                    className="w-full py-2 px-3 rounded-xl text-center text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 text-[11px] font-semibold block transition-colors"
                                                >
                                                    Direct Checkout (Standard Plan) →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* PAYMENT TRUST & METHOD HIGHLIGHTS */}
            <section className="py-16 bg-slate-50/50 dark:bg-[#010e16]/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="cv-card flex items-start space-x-4 p-6 rounded-2xl">
                            <div className="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
                                <Zap className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">bKash & Nagad Verified</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Instant transaction verification and automatic provisioning of your cloud instance.
                                </p>
                            </div>
                        </div>

                        <div className="cv-card flex items-start space-x-4 p-6 rounded-2xl">
                            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                                <Globe className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Custom Domain & Auto SSL</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Map your company domain or use our high-speed managed subdomains (.codeventure.app).
                                </p>
                            </div>
                        </div>

                        <div className="cv-card flex items-start space-x-4 p-6 rounded-2xl">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                                <Headphones className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Dedicated Engineer Support</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Direct access to senior cloud architects for onboarding, data migration, and custom setups.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FREQUENTLY ASKED QUESTIONS */}
            {faqs.length > 0 && (
                <section id="faq" className="py-24 relative overflow-hidden">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
                            <div className="cv-badge mb-3.5">
                                <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
                                <span>Transparent Answers</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                                Frequently Asked Questions
                            </h2>
                            <p className="mt-3.5 text-sm text-slate-600 dark:text-slate-400">
                                Common questions about our SaaS packages, custom domains, bKash & Nagad billing, and cloud deployment.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, idx) => {
                                const isOpen = openFaqIndex === idx;
                                return (
                                    <div
                                        key={idx}
                                        data-aos="fade-up"
                                        data-aos-delay={`${(idx % 5) * 60}`}
                                        className={`cv-card rounded-2xl transition-all duration-300 overflow-hidden ${isOpen
                                            ? 'border-cyan-500/50 shadow-lg'
                                            : ''
                                            }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                            className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                                        >
                                            <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                                                {faq.q}
                                            </span>
                                            <div className={`p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400' : ''}`}>
                                                <ChevronDown className="h-4 w-4" />
                                            </div>
                                        </button>

                                        {isOpen && (
                                            <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-cyan-500/10 animate-in fade-in">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}
        </SurfaceLayout>
    );
}
