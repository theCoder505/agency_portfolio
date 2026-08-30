import React, { useState, FormEventHandler } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { SaasProduct, SharedData } from '@/types';
import { SurfaceLayout } from '@/layouts/surface-layout';
import { formatCurrency } from '@/lib/formatters';
import {
    Copy,
    Check,
    Shield,
    Lock,
    ArrowRight,
    Smartphone,
    Globe,
    User,
    Package,
    Eye,
    EyeOff
} from 'lucide-react';
import { showToast } from '@/lib/swal';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';

interface CheckoutPageProps {
    product: SaasProduct;
    selectedCycle: 'monthly' | 'half_yearly' | 'yearly';
    selectedTier?: 'basic' | 'standard' | 'premium';
    paymentSettings: {
        currency_symbol: string;
        currency_code: string;
        bkash_number: string;
        bkash_instructions: string;
        bkash_enabled: boolean;
        nagad_number: string;
        nagad_instructions: string;
        nagad_enabled: boolean;
    };
}

export default function CheckoutPage({
    product,
    selectedCycle,
    selectedTier = 'standard',
    paymentSettings,
}: CheckoutPageProps) {
    const { auth, app_settings } = usePage<SharedData>().props;
    const currentUser = auth?.user;

    const [cycle, setCycle] = useState<'monthly' | 'half_yearly' | 'yearly'>(selectedCycle);
    const [tier, setTier] = useState<'basic' | 'standard' | 'premium'>(selectedTier);
    const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        saas_product_id: product.id,
        package_tier: tier,
        billing_cycle: cycle,
        payment_method: 'bkash',
        sender_number: currentUser?.phone || '',
        whatsapp_number: (currentUser?.whatsapp_number || currentUser?.phone || '') as string,
        transaction_id: '',
        desired_domain: '',
        desired_subdomain: '',
        payment_notes: '',
        // Guest registration fields
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        company_name: currentUser?.company_name || '',
        password: '',
    });

    const currency = product.currency || paymentSettings.currency_symbol || '৳';

    // Packages
    const packages = product.packages || {
        basic: {
            name: 'Basic Plan',
            tagline: 'Starter tier',
            monthly_price: Math.round(product.monthly_price * 0.7),
            yearly_price: Math.round(product.yearly_price * 0.7),
            badge: 'Starter',
            is_popular: false,
            features: ['Single Branch', 'Up to 5 Users', 'Basic Invoicing'],
        },
        standard: {
            name: 'Standard Plan',
            tagline: 'Most Popular tier',
            monthly_price: product.monthly_price,
            yearly_price: product.yearly_price,
            badge: 'Most Popular',
            is_popular: true,
            features: ['Multi-Branch Sync', 'Up to 25 Users', 'Priority Support'],
        },
        premium: {
            name: 'Premium Plan',
            tagline: 'Enterprise tier',
            monthly_price: Math.round(product.monthly_price * 1.6),
            yearly_price: Math.round(product.yearly_price * 1.6),
            badge: 'Enterprise',
            is_popular: false,
            features: ['Unlimited Users', 'Dedicated DB', 'VIP Support'],
        },
    };

    const currentTierData = packages[tier] || packages.standard;

    // Price calculation
    const getPrice = () => {
        const tierMonthly = currentTierData.monthly_price || product.monthly_price;
        const tierYearly = currentTierData.yearly_price || (tierMonthly * 10);

        if (cycle === 'half_yearly') return Math.round(tierMonthly * 5.5);
        if (cycle === 'yearly') return tierYearly;
        return tierMonthly;
    };

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedNumber(label);
        showToast(`${label} copied to clipboard!`, 'success');
        setTimeout(() => setCopiedNumber(null), 2500);
    };

    const handleCycleChange = (newCycle: 'monthly' | 'half_yearly' | 'yearly') => {
        setCycle(newCycle);
        setData('billing_cycle', newCycle);
    };

    const handleTierChange = (newTier: 'basic' | 'standard' | 'premium') => {
        setTier(newTier);
        setData('package_tier', newTier);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/checkout');
    };

    return (
        <SurfaceLayout
            title={`Checkout - ${product.name} (${currentTierData.name})`}
            description="Complete your SaaS order with easy bKash and Nagad payment validation."
        >
            <div className="py-12 bg-slate-50/70 dark:bg-slate-950/70 min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 text-xs font-bold mb-3">
                            <Lock className="h-3.5 w-3.5" />
                            <span>Secure Checkout & Direct Verification</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                            Complete Your Subscription Order
                        </h1>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            Provide your deployment preferences, send the package amount via bKash or Nagad, and submit your Transaction ID.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* LEFT COLUMN: Account, Package & Deployment Details */}
                        <div className="lg:col-span-7 space-y-6">
                            {/* 1. PLAN & TIER SUMMARY CARD */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-5">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center space-x-3.5">
                                        {product.thumbnail ? (
                                            <div className="h-12 w-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0">
                                                <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold shrink-0">
                                                <Package className="h-6 w-6" />
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 dark:text-cyan-400 block">
                                                Selected SaaS Product
                                            </span>
                                            <h2 className="text-lg font-black text-slate-900 dark:text-white mt-0.5 leading-snug">
                                                {product.name}
                                            </h2>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/saas-products/${product.slug}`}
                                        className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline shrink-0"
                                    >
                                        Full Details
                                    </Link>
                                </div>

                                {/* PACKAGE TIER SWITCHER (Basic, Standard, Premium) */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Selected Package Tier:
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(['basic', 'standard', 'premium'] as const).map((tKey) => {
                                            const tData = packages[tKey];
                                            const isSelected = tier === tKey;

                                            return (
                                                <button
                                                    key={tKey}
                                                    type="button"
                                                    onClick={() => handleTierChange(tKey)}
                                                    className={`p-3 rounded-2xl border text-center transition-all relative ${
                                                        isSelected
                                                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 font-bold shadow-xs'
                                                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                                    }`}
                                                >
                                                    {tData.badge && (
                                                        <span className={`absolute -top-2 right-2 px-1.5 py-0.2 rounded text-[9px] font-black ${
                                                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                                        }`}>
                                                            {tData.badge}
                                                        </span>
                                                    )}
                                                    <div className="text-xs font-bold capitalize">{tData.name}</div>
                                                    <div className="text-xs font-black mt-1 text-slate-900 dark:text-white">
                                                        {formatCurrency(tData.monthly_price, currency, 0)}/mo
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Billing Cycle Switcher */}
                                <div className="space-y-2 pt-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Select Billing Term Duration:
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleCycleChange('monthly')}
                                            className={`p-3 rounded-2xl border text-center transition-all ${
                                                cycle === 'monthly'
                                                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 font-bold'
                                                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="text-xs font-bold">Monthly</div>
                                            <div className="text-sm font-black mt-0.5">{formatCurrency(currentTierData.monthly_price, currency, 0)}</div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleCycleChange('half_yearly')}
                                            className={`p-3 rounded-2xl border text-center transition-all relative ${
                                                cycle === 'half_yearly'
                                                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 font-bold'
                                                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                            }`}
                                        >
                                            <span className="absolute -top-2 right-2 px-1.5 py-0.2 bg-emerald-500 text-white rounded text-[9px] font-bold">Save 10%</span>
                                            <div className="text-xs font-bold">6 Months</div>
                                            <div className="text-sm font-black mt-0.5">{formatCurrency(Math.round(currentTierData.monthly_price * 5.5), currency, 0)}</div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleCycleChange('yearly')}
                                            className={`p-3 rounded-2xl border text-center transition-all relative ${
                                                cycle === 'yearly'
                                                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 font-bold'
                                                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                            }`}
                                        >
                                            <span className="absolute -top-2 right-2 px-1.5 py-0.2 bg-cyan-400 text-slate-950 rounded text-[9px] font-black">Save 20%</span>
                                            <div className="text-xs font-bold">Yearly (12 Mo)</div>
                                            <div className="text-sm font-black mt-0.5">{formatCurrency(currentTierData.yearly_price, currency, 0)}</div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 2. CUSTOMER ACCOUNT INFORMATION */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm">
                                <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                                    <User className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                        Customer & Account Profile
                                    </h2>
                                </div>

                                {currentUser ? (
                                    <div>
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60">
                                            <div>
                                                <div className="text-xs font-semibold text-slate-400">Ordering as Logged-In Customer</div>
                                                <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{currentUser.name}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{currentUser.email} • {currentUser.whatsapp_number ? `WA: ${currentUser.whatsapp_number}` : (currentUser.phone || 'No phone set')}</div>
                                            </div>
                                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold">
                                                Authenticated
                                            </span>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1.5">
                                                <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-500" />
                                                <span>WhatsApp Number (For Direct Activation & Instant Support)</span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={data.whatsapp_number}
                                                onChange={(e) => setData('whatsapp_number', e.target.value)}
                                                placeholder="+880 17XXXXXXXX or +1 (555) 000-0000"
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            Already have an account?{' '}
                                            <Link href="/login" className="text-indigo-600 dark:text-cyan-400 font-bold hover:underline">
                                                Log in here
                                            </Link>{' '}
                                            or fill out the details below to create your customer profile automatically.
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    placeholder="John Doe"
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                                />
                                                {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    placeholder="john@example.com"
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                                />
                                                {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1.5">
                                                    <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-500" />
                                                    <span>WhatsApp Number (For Direct Chat) *</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={data.whatsapp_number || data.phone}
                                                    onChange={(e) => {
                                                        setData('whatsapp_number', e.target.value);
                                                        setData('phone', e.target.value);
                                                    }}
                                                    placeholder="+880 17XXXXXXXX or +1 (555) 000-0000"
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                                                />
                                                {errors.phone && <p className="text-red-500 text-[11px] mt-1">{errors.phone}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                    Company / Business Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.company_name}
                                                    onChange={(e) => setData('company_name', e.target.value)}
                                                    placeholder="Acme Inc (Optional)"
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                Create Portal Password *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    required
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    placeholder="Enter a secure password for your portal access"
                                                    className="w-full px-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                                />
                                                <button
                                                    type="button"
                                                    tabIndex={-1}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {errors.password && <p className="text-red-500 text-[11px] mt-1">{errors.password}</p>}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 3. DEPLOYMENT & DOMAIN PREFERENCES */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm">
                                <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                                    <Globe className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                        Domain & Deployment Details (Optional)
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                Requested Custom Domain (If you have one)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.desired_domain}
                                                onChange={(e) => setData('desired_domain', e.target.value)}
                                                placeholder="e.g. mycompany.com"
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1">We will provide DNS instructions upon activation.</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                Requested Subdomain Prefix
                                            </label>
                                            <div className="flex items-center">
                                                <input
                                                    type="text"
                                                    value={data.desired_subdomain}
                                                    onChange={(e) => setData('desired_subdomain', e.target.value)}
                                                    placeholder="mybrand"
                                                    className="w-full px-3.5 py-2.5 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                                />
                                                <span className="px-3 py-2.5 rounded-r-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500">
                                                    .{product.primary_domain || 'codeventure.app'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1">Your free managed platform subdomain on {product.primary_domain || 'codeventure.app'}.</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                            Special Notes or Requirements
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={data.payment_notes}
                                            onChange={(e) => setData('payment_notes', e.target.value)}
                                            placeholder="Any special configurations, integrations, or team size details..."
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: bKash/Nagad Payment Instructions & Verification */}
                        <div className="lg:col-span-5 space-y-6">
                            {/* PAYMENT METHOD SELECTION CARD */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-indigo-500/50 dark:border-indigo-500/40 p-6 sm:p-7 shadow-xl">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center space-x-2">
                                        <Smartphone className="h-5 w-5 text-pink-500" />
                                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                            Payment & Verification
                                        </h2>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-500 text-[11px] font-bold">
                                        Manual / Send Money
                                    </span>
                                </div>

                                {/* Payment Method Radio Buttons */}
                                <div className="grid grid-cols-2 gap-3 my-5">
                                    <button
                                        type="button"
                                        onClick={() => setData('payment_method', 'bkash')}
                                        className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                                            data.payment_method === 'bkash'
                                                ? 'border-pink-500 bg-pink-500/10 ring-2 ring-pink-500/30 font-bold'
                                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="h-7 w-12 bg-pink-600 text-white font-black text-xs rounded-md flex items-center justify-center tracking-tight">
                                            bKash
                                        </div>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">bKash Send Money</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setData('payment_method', 'nagad')}
                                        className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                                            data.payment_method === 'nagad'
                                                ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/30 font-bold'
                                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="h-7 w-12 bg-orange-600 text-white font-black text-xs rounded-md flex items-center justify-center tracking-tight">
                                            Nagad
                                        </div>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Nagad Send Money</span>
                                    </button>
                                </div>

                                {/* Instructions Box */}
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3">
                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                        <span>Official {data.payment_method === 'bkash' ? 'bKash' : 'Nagad'} Number:</span>
                                    </div>

                                    {/* Copyable Number Card */}
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 shadow-xs">
                                        <span className="font-mono text-sm font-bold text-indigo-600 dark:text-cyan-400">
                                            {data.payment_method === 'bkash'
                                                ? paymentSettings.bkash_number || '01712-345678'
                                                : paymentSettings.nagad_number || '01812-345678'}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => handleCopy(
                                                data.payment_method === 'bkash' ? paymentSettings.bkash_number || '01712345678' : paymentSettings.nagad_number || '01812345678',
                                                data.payment_method === 'bkash' ? 'bKash Number' : 'Nagad Number'
                                            )}
                                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            title="Copy Number"
                                        >
                                            {copiedNumber ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                        </button>
                                    </div>

                                    {/* Step by step */}
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-1 leading-relaxed">
                                        <p>1. Open your {data.payment_method === 'bkash' ? 'bKash App' : 'Nagad App'}.</p>
                                        <p>2. Select <strong>Send Money</strong> to the number above.</p>
                                        <p>3. Send exactly <strong className="text-slate-900 dark:text-white">{formatCurrency(getPrice(), currency, 0)}</strong>.</p>
                                        <p>4. Copy the resulting <strong>Transaction ID (TrxID)</strong> and enter below.</p>
                                    </div>
                                </div>

                                {/* SENDER NUMBER & TrxID INPUTS */}
                                <div className="space-y-4 my-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Your {data.payment_method === 'bkash' ? 'bKash' : 'Nagad'} Sender Mobile Number *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={data.sender_number}
                                            onChange={(e) => setData('sender_number', e.target.value)}
                                            placeholder="e.g. 017XXXXXXXX"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                        {errors.sender_number && <p className="text-red-500 text-[11px] mt-1">{errors.sender_number}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            Transaction ID (TrxID) *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={data.transaction_id}
                                            onChange={(e) => setData('transaction_id', e.target.value.toUpperCase())}
                                            placeholder="e.g. 9B1234XYZ"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-xs uppercase text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                        {errors.transaction_id && <p className="text-red-500 text-[11px] mt-1">{errors.transaction_id}</p>}
                                    </div>
                                </div>

                                {/* TOTAL SUMMARY & SUBMIT BUTTON */}
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <div>
                                            <span className="text-slate-500 dark:text-slate-400 block text-xs">Total Payable ({currentTierData.name}):</span>
                                            <span className="text-[10px] text-slate-400">{cycle === 'monthly' ? '1 Month Term' : cycle === 'half_yearly' ? '6 Months Term' : '12 Months Term'}</span>
                                        </div>
                                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                                            {formatCurrency(getPrice(), currency, 0)}
                                        </span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-black text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <span>Submitting Order...</span>
                                        ) : (
                                            <>
                                                <span>Confirm & Place Order ({currentTierData.name})</span>
                                                <ArrowRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>

                                    <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400 text-center">
                                        <Shield className="h-3.5 w-3.5 text-emerald-500" />
                                        <span>Admin will cross-check and validate your payment within minutes.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </SurfaceLayout>
    );
}
