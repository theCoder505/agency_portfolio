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

            <section className="py-16 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                        <div className="lg:col-span-8 space-y-4">
                            <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl group">
                                {activeImage ? (
                                    <img src={activeImage} alt={`${product.name} Screenshot`} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-8">
                                        <Layers className="h-16 w-16 mb-2 text-indigo-400" />
                                        <span className="text-sm font-bold">Product Showcase Preview</span>
                                    </div>
                                )}
                            </div>
                            {allImages.length > 1 && (
                                <div className="flex items-center space-x-3 overflow-x-auto pb-2 pt-1">
                                    {allImages.map((imgUrl, i) => (
                                        <button key={i} type="button" onClick={() => setActiveImageIndex(i)} className={`h-20 w-32 rounded-2xl overflow-hidden border-2 shrink-0 ${activeImageIndex === i ? 'border-indigo-600' : 'border-slate-200'}`}>
                                            <img src={imgUrl} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                            <div className="p-7 rounded-3xl bg-slate-50 dark:bg-slate-950 space-y-6">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">Enterprise Architecture</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 shrink-0"><Shield className="h-4 w-4" /></div>
                                        <div>
                                            <h4 className="text-xs font-bold">99.99% Cloud Uptime SLA</h4>
                                            <p className="text-[11px] text-slate-500">High-availability isolated containers.</p>
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

                        {/* 3 Package Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                            {(['basic', 'standard', 'premium'] as const).map((tierKey) => {
                                const tier = packages[tierKey];
                                if (!tier) return null;
                                const pricing = getTierPrice(tierKey);
                                return (
                                    <div
                                        key={tierKey}
                                        className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                                            tier.is_popular
                                                ? 'bg-slate-950 text-white border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20 md:-translate-y-2'
                                                : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200/90 dark:border-slate-800 shadow-md'
                                        }`}
                                    >
                                        {tier.is_popular && (
                                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                                                {tier.badge || 'Most Popular'}
                                            </div>
                                        )}

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-xl font-black">{tier.name}</h3>
                                                {!tier.is_popular && tier.badge && (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 font-bold text-[10px]">
                                                        {tier.badge}
                                                    </span>
                                                )}
                                            </div>

                                            <p className={`text-xs leading-relaxed mb-6 ${tier.is_popular ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                                                {tier.tagline}
                                            </p>

                                            <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800/80">
                                                <div className="flex items-baseline space-x-1">
                                                    <span className="text-3xl sm:text-4xl font-black tracking-tight">
                                                        {currency}{pricing.amount.toLocaleString('en-US')}
                                                    </span>
                                                    <span className={`text-xs font-semibold ${tier.is_popular ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        {pricing.period}
                                                    </span>
                                                </div>
                                                <p className={`text-[11px] mt-1 ${tier.is_popular ? 'text-cyan-400' : 'text-indigo-600 dark:text-cyan-400 font-medium'}`}>
                                                    {pricing.subtext}
                                                </p>
                                            </div>

                                            <div className="space-y-3 mb-8">
                                                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Included Capabilities:</div>
                                                {tier.features.map((feat: string, fIdx: number) => (
                                                    <div key={fIdx} className="flex items-start space-x-2.5 text-xs">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                                        <span className={tier.is_popular ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300'}>{feat}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Link
                                            href={`/contact?product=${encodeURIComponent(product.name)}&tier=${tierKey}&cycle=${billingCycle}`}
                                            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                                                tier.is_popular
                                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 hover:scale-[1.02]'
                                                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-cyan-400 dark:hover:text-slate-950 shadow-sm'
                                            }`}
                                        >
                                            <span>Get Started with {tier.name}</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
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
