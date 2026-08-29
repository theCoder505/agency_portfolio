import React, { useState } from 'react';
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
    HelpCircle
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

export default function SaasProductShowPage({
    product,
    relatedProducts,
    paymentSettings,
}: SaasProductShowProps) {
    const { app_settings } = usePage<SharedData>().props;
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    // Screenshot gallery active image state
    const allImages = [
        ...(product.thumbnail ? [product.thumbnail] : []),
        ...(Array.isArray(product.gallery_images) ? product.gallery_images : []),
    ];
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const activeImage = allImages[activeImageIndex] || product.thumbnail || null;

    const brandName = app_settings?.brand_name || 'CodeVenture Tech';
    const currency = paymentSettings.currency_symbol || '৳';

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
                'Subdomain SSL (.codeventure.app)',
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

            {/* PRODUCT VISUAL SHOWCASE & SCREENSHOT GALLERY */}
            <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                        {/* LEFT: Large Interactive Media Viewer */}
                        <div className="lg:col-span-8 space-y-4">
                            <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl group">
                                {activeImage ? (
                                    <img
                                        src={activeImage}
                                        alt={`${product.name} Screenshot`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-8">
                                        <Layers className="h-16 w-16 mb-2 text-indigo-400" />
                                        <span className="text-sm font-bold">Product Showcase Preview</span>
                                    </div>
                                )}

                                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/10">
                                    Preview {activeImageIndex + 1} of {Math.max(allImages.length, 1)}
                                </div>
                            </div>

                            {/* Thumbnails switcher strip */}
                            {allImages.length > 1 && (
                                <div className="flex items-center space-x-3 overflow-x-auto pb-2 pt-1">
                                    {allImages.map((imgUrl, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setActiveImageIndex(i)}
                                            className={`relative h-20 w-32 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                                                activeImageIndex === i
                                                    ? 'border-indigo-600 ring-2 ring-indigo-500/30 scale-105 shadow-md'
                                                    : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                                            }`}
                                        >
                                            <img src={imgUrl} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* RIGHT: High-level Highlights & SLA Specifications */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="p-7 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-6">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400">
                                        Platform Highlights
                                    </span>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                                        Enterprise Architecture
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 shrink-0">
                                            <Shield className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">99.99% Cloud Uptime SLA</h4>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                High-availability isolated containers with automated failover and daily snapshots.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                                            <Globe className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Custom Domain & Auto SSL</h4>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                Bring your enterprise domain with complimentary automatic Let's Encrypt SSL certificates.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500 shrink-0">
                                            <Zap className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Instant bKash/Nagad Activation</h4>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                Submit your TrxID at checkout for priority validation and auto deployment.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 shrink-0">
                                            <Headphones className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Dedicated Support Desk</h4>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                Direct access to software engineers for onboarding, data migration, and training.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <a
                                        href="#package-plans"
                                        className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all text-center block"
                                    >
                                        <span>Compare 3 Package Tiers</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRODUCT DEEP-DIVE OVERVIEW */}
            {product.description && (
                <section className="py-16 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-200/80 dark:border-slate-800">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-indigo-600 dark:text-cyan-400 uppercase tracking-wider">
                                Overview & Description
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                What is {product.name}?
                            </h2>
                        </div>

                        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-4">
                            <p>{product.description}</p>
                        </div>
                    </div>
                </section>
            )}

            {/* PACKAGE PLANS SECTION: BASIC, STANDARD, AND PREMIUM TIERS */}
            <section id="package-plans" className="py-24 bg-slate-50/80 dark:bg-slate-950 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 text-xs font-bold">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Transparent Package Information</span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                            Choose Your {product.name} Package
                        </h2>

                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                            Transparent pricing formatted in standard <strong>en-US</strong> notation. Select your billing duration and deploy with one click.
                        </p>

                        {/* Billing Cycle Toggle */}
                        <div className="pt-6 flex justify-center">
                            <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
                                <button
                                    type="button"
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                        billingCycle === 'monthly'
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    Monthly Billing
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setBillingCycle('yearly')}
                                    className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                        billingCycle === 'yearly'
                                            ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <span>Annual Billing</span>
                                    <span className="px-2 py-0.5 rounded-md bg-cyan-400 text-slate-950 text-[10px] font-black uppercase">
                                        Save ~20%
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 3 PRICING TIERS: BASIC, STANDARD, PREMIUM */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                        {(['basic', 'standard', 'premium'] as const).map((tierKey) => {
                            const tier = packages[tierKey];
                            const priceData = getTierPrice(tierKey);
                            const isStandard = tierKey === 'standard';
                            const isPremium = tierKey === 'premium';

                            return (
                                <div
                                    key={tierKey}
                                    className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 ${
                                        tier.is_popular || isStandard
                                            ? 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white border-2 border-indigo-500 shadow-2xl shadow-indigo-500/25 scale-[1.03] z-10'
                                            : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-xl hover:border-indigo-500/40'
                                    }`}
                                >
                                    {/* Popular or Tier Badge */}
                                    {tier.badge && (
                                        <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black tracking-wider uppercase shadow-md flex items-center space-x-1 ${
                                            tier.is_popular || isStandard
                                                ? 'bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950'
                                                : isPremium
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                        }`}>
                                            <Sparkles className="h-3 w-3" />
                                            <span>{tier.badge}</span>
                                        </div>
                                    )}

                                    <div>
                                        {/* Tier Header */}
                                        <div className="pb-6 border-b border-slate-100 dark:border-slate-800/80">
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-bold uppercase tracking-wider ${
                                                    isStandard ? 'text-cyan-300' : 'text-indigo-600 dark:text-cyan-400'
                                                }`}>
                                                    {tierKey.toUpperCase()} TIER
                                                </span>
                                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg ${
                                                    isStandard ? 'bg-white/10 text-slate-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                }`}>
                                                    {billingCycle === 'monthly' ? 'Monthly' : 'Annual'}
                                                </span>
                                            </div>

                                            <h3 className="text-2xl font-black tracking-tight mt-1">
                                                {tier.name}
                                            </h3>

                                            {tier.tagline && (
                                                <p className={`text-xs mt-1.5 leading-relaxed ${
                                                    isStandard ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
                                                }`}>
                                                    {tier.tagline}
                                                </p>
                                            )}

                                            {/* Price Display (Formatted en-US) */}
                                            <div className="mt-6">
                                                <div className="flex items-baseline space-x-1.5">
                                                    <span className="text-3.5xl sm:text-4xl font-black tracking-tight">
                                                        {formatCurrency(priceData.amount, currency, 0)}
                                                    </span>
                                                    <span className={`text-xs font-bold ${isStandard ? 'text-slate-300' : 'text-slate-500'}`}>
                                                        {priceData.period}
                                                    </span>
                                                </div>
                                                <p className={`text-[11px] font-medium mt-1 ${isStandard ? 'text-cyan-300' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                                    {priceData.subtext}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Features Checklist */}
                                        <div className="py-6 space-y-3">
                                            <div className={`text-[11px] uppercase font-bold tracking-wider ${
                                                isStandard ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500'
                                            }`}>
                                                Included in {tier.name}:
                                            </div>

                                            {tier.features.map((feature, fIdx) => (
                                                <div key={fIdx} className="flex items-start space-x-2.5 text-xs">
                                                    <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${
                                                        isStandard ? 'text-cyan-400' : 'text-emerald-500'
                                                    }`} />
                                                    <span className={`leading-snug ${
                                                        isStandard ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300'
                                                    }`}>
                                                        {feature}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CTA Order Button leading to Checkout with Tier */}
                                    <div className="pt-4 mt-auto">
                                        <Link
                                            href={`/checkout/${product.slug}?tier=${tierKey}&billing_cycle=${billingCycle}`}
                                            className={`w-full py-4 px-6 rounded-2xl font-black text-xs flex items-center justify-center space-x-2 transition-all shadow-lg group ${
                                                isStandard
                                                    ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 shadow-cyan-500/20 hover:scale-[1.02]'
                                                    : isPremium
                                                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20'
                                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                                            }`}
                                        >
                                            <span>Deploy {tier.name}</span>
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* FEATURE COMPARISON MATRIX TABLE */}
                    <div className="mt-20 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden space-y-6">
                        <div className="text-center space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                Package Tier Feature Comparison Matrix
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Detailed side-by-side comparison across Basic, Standard, and Premium packages.
                            </p>
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
                <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
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
