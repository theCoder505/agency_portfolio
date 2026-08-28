import React, { useState } from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import { SaasProduct, SharedData } from '@/types';
import { SurfaceLayout } from '@/layouts/surface-layout';
import {
    CheckCircle2,
    Sparkles,
    ArrowRight,
    Zap,
    Shield,
    Database,
    Globe,
    Cpu,
    Calendar,
    Server,
    Layers,
    HelpCircle,
    Check,
    Lock,
    Headphones,
    BadgePercent
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
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'half_yearly' | 'yearly'>('monthly');

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

    const getCyclePrice = (product: SaasProduct) => {
        if (billingCycle === 'half_yearly') {
            return {
                total: product.half_yearly_price,
                monthlyEquiv: Math.round(product.half_yearly_price / 6),
                periodText: 'billed semi-annually (6 mos)',
            };
        }
        if (billingCycle === 'yearly') {
            return {
                total: product.yearly_price,
                monthlyEquiv: Math.round(product.yearly_price / 12),
                periodText: 'billed annually (12 mos)',
            };
        }
        return {
            total: product.monthly_price,
            monthlyEquiv: product.monthly_price,
            periodText: 'billed monthly',
        };
    };

    const faqs = [
        {
            q: 'How does the bKash and Nagad payment validation work?',
            a: 'When you place an order, send the package amount to our official bKash or Nagad number (Personal/Merchant). Submit the Transaction ID (TrxID) and your sender phone number at checkout. Our team instantly cross-checks and activates your package within minutes.',
        },
        {
            q: 'Can I connect my own custom domain or subdomain?',
            a: 'Yes! During checkout or after package activation, you can specify your custom domain (e.g. yourcompany.com) or use a free managed subdomain (e.g. yourbrand.codeventure.app) with complimentary SSL encryption.',
        },
        {
            q: 'What happens when my subscription period expires?',
            a: 'You will receive renewal reminders and a dedicated "Pay Renewal Invoice" option in your Customer Portal. You can renew seamlessly via bKash/Nagad without any downtime or data loss.',
        },
        {
            q: 'Can I upgrade or switch between monthly and yearly billing?',
            a: 'Yes, you can upgrade your plan or switch billing cycles anytime directly from your customer dashboard or by contacting our engineering support.',
        },
    ];

    return (
        <SurfaceLayout
            title="SaaS Products & Enterprise Cloud Subscriptions"
            description="Explore ready-to-deploy enterprise SaaS products engineered by CodeVenture Tech with sub-second performance, bKash/Nagad instant verification, and custom domains."
        >
            {/* HERO BANNER */}
            <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
                {/* Ambient Glows */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
                    <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-cyan-400 text-xs font-bold" data-aos="fade-down">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Turnkey SaaS Engineering & Managed Hosting</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight max-w-4xl mx-auto" data-aos="fade-up">
                        Powerful SaaS Products Built to Scale Your Business
                    </h1>

                    <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed" data-aos="fade-up" data-aos-delay="100">
                        Choose the enterprise software suite tailored to your workflow. Enjoy guaranteed uptime, custom domain integration, and instant bKash/Nagad activation.
                    </p>

                    {/* BILLING CYCLE SELECTOR TOGGLE */}
                    <div className="pt-8 flex justify-center" data-aos="fade-up" data-aos-delay="150">
                        <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                    billingCycle === 'monthly'
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Monthly Billing
                            </button>

                            <button
                                onClick={() => setBillingCycle('half_yearly')}
                                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                    billingCycle === 'half_yearly'
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <span>Half-Yearly (6 Mo)</span>
                                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                    Save ~10%
                                </span>
                            </button>

                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                    billingCycle === 'yearly'
                                        ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <span>Yearly (12 Mo)</span>
                                <span className="px-1.5 py-0.5 rounded-md bg-cyan-400 text-slate-950 text-[10px] font-black animate-pulse">
                                    Save ~20%
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRODUCT PRICING CARDS SECTION */}
            <section className="py-20 bg-slate-50/70 dark:bg-slate-950/70 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {products.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12">
                            <Layers className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No SaaS products published yet</h3>
                            <p className="text-sm text-slate-500 mt-2">Check back soon or contact our team for custom product inquiries.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch">
                            {products.map((product, idx) => {
                                const IconComp = getProductIcon(product.icon);
                                const priceInfo = getCyclePrice(product);
                                const isFeatured = product.is_featured;

                                return (
                                    <div
                                        key={product.id}
                                        data-aos="fade-up"
                                        data-aos-delay={`${(idx % 4) * 100}`}
                                        className={`relative flex flex-col justify-between rounded-3xl p-7 transition-all duration-300 ${
                                            isFeatured
                                                ? 'bg-gradient-to-b from-slate-900 to-indigo-950 text-white border-2 border-indigo-500/80 shadow-2xl shadow-indigo-500/20 scale-[1.02] z-10'
                                                : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-500/40'
                                        }`}
                                    >
                                        {/* Top Badge */}
                                        {product.badge && (
                                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow-md flex items-center space-x-1">
                                                <Sparkles className="h-3 w-3" />
                                                <span>{product.badge}</span>
                                            </div>
                                        )}

                                        <div>
                                            {/* Header / Icon */}
                                            <div className="flex items-center justify-between mb-5">
                                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                                                    isFeatured
                                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40'
                                                        : 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-cyan-400 border border-indigo-100 dark:border-slate-700'
                                                }`}>
                                                    <IconComp className="h-6 w-6" />
                                                </div>

                                                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                                                    isFeatured
                                                        ? 'bg-white/10 text-cyan-300'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                }`}>
                                                    {billingCycle === 'monthly' ? 'Monthly' : billingCycle === 'half_yearly' ? '6 Months' : 'Annual'}
                                                </span>
                                            </div>

                                            {/* Title & Tagline */}
                                            <h3 className="text-xl font-black tracking-tight leading-snug">
                                                {product.name}
                                            </h3>

                                            {product.tagline && (
                                                <p className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${
                                                    isFeatured ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
                                                }`}>
                                                    {product.tagline}
                                                </p>
                                            )}

                                            {/* Price Display */}
                                            <div className="my-6 pt-4 pb-2 border-t border-b border-slate-100 dark:border-slate-800/80">
                                                <div className="flex items-baseline space-x-1">
                                                    <span className="text-base font-bold text-slate-400">{currency}</span>
                                                    <span className="text-3.5xl sm:text-4xl font-black tracking-tight">
                                                        {priceInfo.total.toLocaleString()}
                                                    </span>
                                                    <span className={`text-xs font-semibold ${isFeatured ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        /{billingCycle === 'monthly' ? 'mo' : billingCycle === 'half_yearly' ? '6mo' : 'yr'}
                                                    </span>
                                                </div>

                                                <p className={`text-[11px] mt-1 ${isFeatured ? 'text-cyan-300' : 'text-slate-500 dark:text-slate-400'}`}>
                                                    {priceInfo.periodText}
                                                </p>
                                            </div>

                                            {/* Feature List */}
                                            <div className="space-y-2.5 my-6">
                                                <div className={`text-[11px] uppercase font-bold tracking-wider ${
                                                    isFeatured ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500'
                                                }`}>
                                                    Package Highlights
                                                </div>

                                                {Array.isArray(product.features) && product.features.length > 0 ? (
                                                    product.features.map((feature, fIdx) => (
                                                        <div key={fIdx} className="flex items-start space-x-2.5 text-xs">
                                                            <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${
                                                                isFeatured ? 'text-cyan-400' : 'text-emerald-500'
                                                            }`} />
                                                            <span className={`leading-snug ${
                                                                isFeatured ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300'
                                                            }`}>
                                                                {feature}
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-xs text-slate-400 italic">Full enterprise feature suite included.</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* CTA Button */}
                                        <div className="pt-4 mt-auto">
                                            <Link
                                                href={`/checkout/${product.slug}?billing_cycle=${billingCycle}`}
                                                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md group ${
                                                    isFeatured
                                                        ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-black'
                                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                }`}
                                            >
                                                <span>Deploy & Order Now</span>
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* PAYMENT TRUST & METHODS BANNER */}
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
                                    Instant transaction ID matching and rapid approval by our administrative desk.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                                <Globe className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Custom Domain & SSL</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Connect your company domain or use our high-speed managed subdomains.
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
                                    Direct access to our senior architects for onboarding, training, and custom integrations.
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
