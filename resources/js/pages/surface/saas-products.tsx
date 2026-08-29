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
    Package
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

export default function SaasProductsPage({
    products,
    paymentSettings,
}: SaasProductsPageProps) {
    const { app_settings } = usePage<SharedData>().props;
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

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

    const faqs = [
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

    return (
        <SurfaceLayout
            title="Enterprise SaaS Products & Cloud Platforms"
            description="Explore ready-to-deploy enterprise SaaS products engineered by CodeVenture Tech with sub-second performance, tiered packages, and bKash/Nagad instant verification."
        >
            {/* HERO BANNER */}
            <section className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
                {/* Ambient Glows */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[360px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
                    <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-cyan-400 text-xs font-bold" data-aos="fade-down">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Turnkey SaaS Engineering & Managed Cloud Subscriptions</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight max-w-4xl mx-auto" data-aos="fade-up">
                        High-Performance SaaS Products Built for Growth
                    </h1>

                    <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed" data-aos="fade-up" data-aos-delay="100">
                        Choose your enterprise software platform. Click any product to explore full architectural details, screenshots, and package information across <strong>Basic</strong>, <strong>Standard</strong>, and <strong>Premium</strong> tiers.
                    </p>

                    {/* BILLING CYCLE SELECTOR TOGGLE (en-US format) */}
                    <div className="pt-6 flex justify-center" data-aos="fade-up" data-aos-delay="150">
                        <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                    billingCycle === 'monthly'
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Monthly Billing
                            </button>

                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                    billingCycle === 'yearly'
                                        ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <span>Annual Billing</span>
                                <span className="px-2 py-0.5 rounded-md bg-cyan-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                                    Save ~20%
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRODUCT CATALOG SECTION - 3 ITEMS PER ROW ON LG SCREEN */}
            <section className="py-20 bg-slate-50/70 dark:bg-slate-950/70 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {products.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12">
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
                                const isFeatured = product.is_featured;

                                return (
                                    <div
                                        key={product.id}
                                        data-aos="fade-up"
                                        data-aos-delay={`${(idx % 3) * 100}`}
                                        className="group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-all duration-300 overflow-hidden"
                                    >
                                        {/* TOP THUMBNAIL IMAGE WITH HOVER ZOOM & BADGE */}
                                        <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                                            {product.thumbnail ? (
                                                <img
                                                    src={product.thumbnail}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-indigo-400 p-6 text-center">
                                                    <IconComp className="h-12 w-12 mb-2 text-indigo-400" />
                                                    <span className="text-xs font-bold text-slate-300">{product.name}</span>
                                                </div>
                                            )}

                                            {/* Gradient dark overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                                            {/* Top Highlight Badge */}
                                            {product.badge && (
                                                <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-indigo-600/90 backdrop-blur-md text-white font-black text-[10px] tracking-wider uppercase shadow-md flex items-center space-x-1">
                                                    <Sparkles className="h-3 w-3 text-cyan-300" />
                                                    <span>{product.badge}</span>
                                                </div>
                                            )}

                                            {/* Featured Pill */}
                                            {isFeatured && (
                                                <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-slate-950 font-black text-[10px] uppercase shadow-md">
                                                    ★ Featured
                                                </div>
                                            )}

                                            {/* Icon floating on image */}
                                            <div className="absolute bottom-3 left-3.5 h-10 w-10 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/10 text-cyan-400 flex items-center justify-center shadow-lg">
                                                <IconComp className="h-5 w-5" />
                                            </div>
                                        </div>

                                        {/* BODY CONTENT: TITLE, TAGLINE, TIERS & PRICE */}
                                        <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                                            <div className="space-y-3">
                                                {/* Title */}
                                                <Link
                                                    href={`/saas-products/${product.slug}`}
                                                    className="block group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors"
                                                >
                                                    <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-snug">
                                                        {product.name}
                                                    </h3>
                                                </Link>

                                                {/* Tagline / Description */}
                                                {product.tagline && (
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                        {product.tagline}
                                                    </p>
                                                )}

                                                {/* Package Tier Badges: Basic, Standard, Premium */}
                                                <div className="pt-1 flex flex-wrap items-center gap-1.5">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                                                        Tiers:
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200/60 dark:border-slate-700">
                                                        Basic
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 text-[10px] font-black border border-indigo-200/60 dark:border-indigo-800">
                                                        Standard
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 text-[10px] font-bold border border-purple-200/60 dark:border-purple-800">
                                                        Premium
                                                    </span>
                                                </div>

                                                {/* Starting Price Banner (Human-Readable en-US format) */}
                                                <div className="pt-3 pb-2 border-t border-b border-slate-100 dark:border-slate-800">
                                                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                        Starting from
                                                    </div>
                                                    <div className="flex items-baseline space-x-1.5 mt-0.5">
                                                        <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                                            {formatCurrency(priceInfo.amount, currency, 0)}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-500">
                                                            {priceInfo.periodLabel}
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] text-indigo-600 dark:text-cyan-400 font-medium mt-0.5">
                                                        {priceInfo.subtext}
                                                    </div>
                                                </div>

                                                {/* Key 3 Features Checklist */}
                                                <div className="space-y-2 pt-1">
                                                    {Array.isArray(product.features) && product.features.slice(0, 3).map((feat, fIdx) => (
                                                        <div key={fIdx} className="flex items-start space-x-2 text-xs">
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                                            <span className="text-slate-700 dark:text-slate-300 leading-snug line-clamp-1">
                                                                {feat}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* ACTION CTA BUTTONS: View Details & Packages */}
                                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                                <Link
                                                    href={`/saas-products/${product.slug}`}
                                                    className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-indigo-500/20 group/btn"
                                                >
                                                    <span>View Product & Packages</span>
                                                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                                </Link>

                                                <Link
                                                    href={`/checkout/${product.slug}?tier=standard&billing_cycle=${billingCycle}`}
                                                    className="w-full py-2 px-3 rounded-xl text-center text-slate-500 hover:text-indigo-600 dark:hover:text-cyan-400 text-[11px] font-semibold block transition-colors"
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
            <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex items-start space-x-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
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

                        <div className="flex items-start space-x-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                                <Globe className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Custom Domain & Auto SSL</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Map your company domain or use our high-speed managed subdomains (.codeventure.app).
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
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
            <section className="py-24 bg-slate-50/50 dark:bg-slate-950/30">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-3 mb-16">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 text-xs font-bold">
                            <HelpCircle className="h-3.5 w-3.5" />
                            <span>Transparent Answers</span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm"
                            >
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
                                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                                    <span>{faq.q}</span>
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-4">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </SurfaceLayout>
    );
}
