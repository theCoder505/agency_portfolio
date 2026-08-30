import React, { useState, FormEventHandler } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { SaasProduct, SaasPackages, SaasPackageTier } from '@/types';
import { ImageUploader } from '@/components/admin/image-uploader';
import { getCurrencySymbol, CURRENCY_OPTIONS } from '@/lib/formatters';
import {
    Package,
    Save,
    ArrowLeft,
    Plus,
    Trash2,
    CheckCircle2,
    Sparkles,
    DollarSign,
    Layers,
    Image as ImageIcon,
    Shield,
    Check,
    X,
    Star,
    Coins
} from 'lucide-react';
import { showToast } from '@/lib/swal';

interface SaasProductFormProps {
    product: SaasProduct | null;
    isEdit: boolean;
    currencySymbol: string;
}

export default function SaasProductForm({
    product,
    isEdit,
    currencySymbol: defaultCurrencySymbol = '৳',
}: SaasProductFormProps) {
    // Basic Details State
    const [name, setName] = useState(product?.name || '');
    const [slug, setSlug] = useState(product?.slug || '');
    const [primaryDomain, setPrimaryDomain] = useState(product?.primary_domain || 'codeventure.app');
    const [tagline, setTagline] = useState(product?.tagline || '');
    const [description, setDescription] = useState(product?.description || '');
    const [icon, setIcon] = useState(product?.icon || 'Database');
    const [badge, setBadge] = useState(product?.badge || '');
    const [currency, setCurrency] = useState<'BDT' | 'USD' | 'EUR'>((product?.currency as any) || 'BDT');
    const [order, setOrder] = useState(product?.order ?? 0);
    const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
    const [isActive, setIsActive] = useState(product?.is_active ?? true);

    const activeCurrencySymbol = getCurrencySymbol(currency);

    // Baseline fallback pricing
    const [monthlyPrice, setMonthlyPrice] = useState(product?.monthly_price ?? 2999);
    const [halfYearlyPrice, setHalfYearlyPrice] = useState(product?.half_yearly_price ?? 15999);
    const [yearlyPrice, setYearlyPrice] = useState(product?.yearly_price ?? 29999);
    const [hasMonthly, setHasMonthly] = useState(product?.has_monthly ?? true);
    const [hasHalfYearly, setHasHalfYearly] = useState(product?.has_half_yearly ?? true);
    const [hasYearly, setHasYearly] = useState(product?.has_yearly ?? true);

    // Base features list
    const [featuresList, setFeaturesList] = useState<string[]>(
        Array.isArray(product?.features) && product.features.length > 0
            ? product.features
            : [
                  'Multi-Branch Real-Time Data Sync',
                  'Automated Accounting & Multi-Currency Invoicing',
                  'Custom Domain with Managed Auto-SSL',
                  'Daily Automated Cloud Backups with 99.99% SLA',
                  'Priority 24/7 Dedicated Support Engineer',
              ]
    );
    const [newFeatureText, setNewFeatureText] = useState('');

    // Media Uploads State (Live Previews)
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [existingThumbnail, setExistingThumbnail] = useState<string | null>(product?.thumbnail || null);

    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [existingGallery, setExistingGallery] = useState<string[]>(
        Array.isArray(product?.gallery_images) ? product.gallery_images : []
    );

    // Tiered Packages State: Basic, Standard, Premium
    const defaultPackages: SaasPackages = {
        basic: {
            name: product?.packages?.basic?.name || 'Basic Plan',
            tagline: product?.packages?.basic?.tagline || 'Essential features for startups and small teams',
            monthly_price: product?.packages?.basic?.monthly_price ?? Math.round((product?.monthly_price ?? 2999) * 0.7),
            yearly_price: product?.packages?.basic?.yearly_price ?? Math.round((product?.yearly_price ?? 29990) * 0.7),
            badge: product?.packages?.basic?.badge || 'Starter',
            is_popular: product?.packages?.basic?.is_popular ?? false,
            features: product?.packages?.basic?.features || [
                'Single Branch / Location License',
                'Up to 5 Team Member Accounts',
                'Automated Basic Invoicing & Sales Reports',
                'Subdomain SSL (.codeventure.app)',
                'Standard Email Support',
            ],
        },
        standard: {
            name: product?.packages?.standard?.name || 'Standard Plan',
            tagline: product?.packages?.standard?.tagline || 'Most popular choice for growing commercial businesses',
            monthly_price: product?.packages?.standard?.monthly_price ?? (product?.monthly_price ?? 2999),
            yearly_price: product?.packages?.standard?.yearly_price ?? (product?.yearly_price ?? 29990),
            badge: product?.packages?.standard?.badge || 'Most Popular',
            is_popular: product?.packages?.standard?.is_popular ?? true,
            features: product?.packages?.standard?.features || [
                'Multi-Branch Centralized Sync',
                'Up to 25 Team Member Accounts with RBAC',
                'Automated Multi-Currency Invoicing & Tax Calculation',
                'Custom Domain Mapping with Complimentary SSL',
                'Integrated bKash / Nagad Instant Billing API',
                'Priority 24/7 Support with 1-Hour SLA',
            ],
        },
        premium: {
            name: product?.packages?.premium?.name || 'Premium Plan',
            tagline: product?.packages?.premium?.tagline || 'Full enterprise power with dedicated cloud instances and VIP engineering',
            monthly_price: product?.packages?.premium?.monthly_price ?? Math.round((product?.monthly_price ?? 2999) * 1.6),
            yearly_price: product?.packages?.premium?.yearly_price ?? Math.round((product?.yearly_price ?? 29990) * 1.6),
            badge: product?.packages?.premium?.badge || 'Enterprise Suite',
            is_popular: product?.packages?.premium?.is_popular ?? false,
            features: product?.packages?.premium?.features || [
                'Unlimited Branches, Warehouses & User Accounts',
                'Dedicated Isolated Cloud Database Instance',
                'Custom ERP Workflows & Webhook Integrations',
                'White-Label Branded Portal & Client Mobile App',
                'Dedicated Senior Account Engineer On-Call',
                '99.99% Uptime Guarantee & Custom Legal SLA',
            ],
        },
    };

    const [packages, setPackages] = useState<SaasPackages>(defaultPackages);
    const [activeTierTab, setActiveTierTab] = useState<'basic' | 'standard' | 'premium'>('standard');
    const [newTierFeatureText, setNewTierFeatureText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-generate slug from name if empty
    const handleNameChange = (val: string) => {
        setName(val);
        if (!isEdit || !slug) {
            setSlug(
                val
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)+/g, '')
            );
        }
    };

    // Base features helpers
    const addBaseFeature = () => {
        if (!newFeatureText.trim()) return;
        setFeaturesList([...featuresList, newFeatureText.trim()]);
        setNewFeatureText('');
    };

    const removeBaseFeature = (idx: number) => {
        setFeaturesList(featuresList.filter((_, i) => i !== idx));
    };

    // Tier packages helper updates
    const updateTierField = <K extends keyof SaasPackageTier>(
        tier: 'basic' | 'standard' | 'premium',
        field: K,
        value: SaasPackageTier[K]
    ) => {
        setPackages((prev) => ({
            ...prev,
            [tier]: {
                ...prev[tier],
                [field]: value,
            },
        }));
    };

    const addTierFeature = (tier: 'basic' | 'standard' | 'premium') => {
        if (!newTierFeatureText.trim()) return;
        const currentList = packages[tier]?.features || [];
        updateTierField(tier, 'features', [...currentList, newTierFeatureText.trim()]);
        setNewTierFeatureText('');
    };

    const removeTierFeature = (tier: 'basic' | 'standard' | 'premium', idx: number) => {
        const currentList = packages[tier]?.features || [];
        updateTierField(tier, 'features', currentList.filter((_, i) => i !== idx));
    };

    // Handle Form Submit
    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('slug', slug);
        formData.append('primary_domain', primaryDomain);
        formData.append('tagline', tagline);
        formData.append('description', description);
        formData.append('icon', icon);
        formData.append('badge', badge);
        formData.append('monthly_price', String(monthlyPrice));
        formData.append('half_yearly_price', String(halfYearlyPrice));
        formData.append('yearly_price', String(yearlyPrice));
        formData.append('currency', currency);
        formData.append('has_monthly', hasMonthly ? '1' : '0');
        formData.append('has_half_yearly', hasHalfYearly ? '1' : '0');
        formData.append('has_yearly', hasYearly ? '1' : '0');
        formData.append('order', String(order));
        formData.append('is_featured', isFeatured ? '1' : '0');
        formData.append('is_active', isActive ? '1' : '0');

        // Base features
        featuresList.forEach((feat, idx) => {
            formData.append(`features[${idx}]`, feat);
        });

        // Nested Tiered Packages Data
        (['basic', 'standard', 'premium'] as const).forEach((tierKey) => {
            const tierData = packages[tierKey];
            formData.append(`packages[${tierKey}][name]`, tierData.name);
            formData.append(`packages[${tierKey}][tagline]`, tierData.tagline || '');
            formData.append(`packages[${tierKey}][monthly_price]`, String(tierData.monthly_price));
            formData.append(`packages[${tierKey}][yearly_price]`, String(tierData.yearly_price));
            formData.append(`packages[${tierKey}][badge]`, tierData.badge || '');
            formData.append(`packages[${tierKey}][is_popular]`, tierData.is_popular ? '1' : '0');

            tierData.features.forEach((f, fIdx) => {
                formData.append(`packages[${tierKey}][features][${fIdx}]`, f);
            });
        });

        // Thumbnail file or string
        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        } else if (existingThumbnail) {
            formData.append('thumbnail', existingThumbnail);
        } else {
            formData.append('thumbnail', '');
        }

        // Multi-image gallery screenshots
        galleryFiles.forEach((file) => {
            formData.append('gallery_images[]', file);
        });

        // Existing gallery URLs
        existingGallery.forEach((url, idx) => {
            formData.append(`existing_gallery[${idx}]`, url);
        });

        if (isEdit && product) {
            formData.append('_method', 'PUT');
            router.post(`/admin/saas-products/${product.id}`, formData, {
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post('/admin/saas-products', formData, {
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    return (
        <AdminLayout
            title={isEdit ? `Edit: ${product?.name}` : 'Create SaaS Product'}
            breadcrumbs={[
                { title: 'SaaS Products', href: '/admin/saas-products' },
                { title: isEdit ? 'Edit Product' : 'New Product' },
            ]}
        >
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/admin/saas-products"
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                {isEdit ? `Edit: ${product?.name}` : 'Create New SaaS Product'}
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Upload visual assets with instant live preview, manage Basic/Standard/Premium packages, and configure pricing.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* 1. GENERAL IDENTITY & PRESENTATION CARD */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <Package className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
                            <span>Product Identity & Presentation</span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="e.g. CloudERP Suite Enterprise"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    URL Slug (Leave blank for auto-generate)
                                </label>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="e.g. clouderp-suite-enterprise"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                                    <span>Product Main / Root Domain *</span>
                                    <span className="text-[10px] text-indigo-500 font-bold">Subdomain Base</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={primaryDomain}
                                    onChange={(e) => setPrimaryDomain(e.target.value.toLowerCase().replace(/https?:\/\//g, '').replace(/\/.*$/, ''))}
                                    placeholder="e.g. clouderp.app or codeventure.app"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                />
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                    Customer subdomains will resolve to <strong className="font-mono text-indigo-600 dark:text-cyan-400">clientname.{primaryDomain || 'codeventure.app'}</strong>
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Short Tagline
                                </label>
                                <input
                                    type="text"
                                    value={tagline}
                                    onChange={(e) => setTagline(e.target.value)}
                                    placeholder="e.g. All-in-one business management & telemetry engine"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Highlight Badge (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={badge}
                                    onChange={(e) => setBadge(e.target.value)}
                                    placeholder="e.g. Most Popular, AI-Powered, Enterprise"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                                    <span>Product Currency</span>
                                    <span className="text-[10px] text-indigo-500 font-bold">Default: BDT (৳)</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {CURRENCY_OPTIONS.map((cur) => (
                                        <button
                                            key={cur.code}
                                            type="button"
                                            onClick={() => setCurrency(cur.code)}
                                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border ${
                                                currency === cur.code
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                            }`}
                                        >
                                            <span className="font-mono">{cur.symbol}</span>
                                            <span>{cur.code}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Full Product Overview & Description
                            </label>
                            <textarea
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Detailed overview of the product capabilities, architecture, and deployment specs..."
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* 2. IMAGE UPLOADS WITH LIVE PREVIEW (Thumbnail & Screenshot Gallery) */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-6">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <ImageIcon className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
                            <span>Visual Assets & Live Previews</span>
                        </h2>

                        <div className="grid grid-cols-1 gap-6">
                            {/* Primary Thumbnail Image (Live Preview) */}
                            <ImageUploader
                                label="Primary Product Thumbnail Image (Live Preview before upload)"
                                multiple={false}
                                existingImages={existingThumbnail}
                                onChange={(file, existing) => {
                                    if (file instanceof File) {
                                        setThumbnailFile(file);
                                    } else {
                                        setThumbnailFile(null);
                                    }
                                    if (existing && existing.length > 0) {
                                        setExistingThumbnail(existing[0]);
                                    } else {
                                        setExistingThumbnail(null);
                                    }
                                }}
                                helperText="Upload high-res PNG, JPG, or WebP. Displayed on catalog cards and product hero."
                            />

                            {/* Screenshot Gallery (Live Multi-Image Preview) */}
                            <ImageUploader
                                label="Product Screenshot Showcase Gallery (Live Multi-Image Preview)"
                                multiple={true}
                                maxFiles={8}
                                existingImages={existingGallery}
                                onChange={(files, existing) => {
                                    if (Array.isArray(files)) {
                                        setGalleryFiles(files);
                                    }
                                    if (existing) {
                                        setExistingGallery(existing);
                                    }
                                }}
                                helperText="Upload UI screenshots for the interactive product details gallery."
                            />
                        </div>
                    </div>

                    {/* 3. TIERED PACKAGE MANAGEMENT (Basic, Standard, Premium) */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-indigo-500/40 dark:border-indigo-500/30 p-6 sm:p-7 shadow-lg space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                    <Sparkles className="h-4 w-4 text-amber-500" />
                                    <span>Package Pricing Tiers (Basic, Standard, Premium)</span>
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Configure customized features and pricing for each tier shown on the frontend.
                                </p>
                            </div>

                            {/* Tier Selector Tabs */}
                            <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs">
                                {(['basic', 'standard', 'premium'] as const).map((tierKey) => (
                                    <button
                                        key={tierKey}
                                        type="button"
                                        onClick={() => setActiveTierTab(tierKey)}
                                        className={`px-4 py-1.5 rounded-lg font-bold capitalize transition-all ${
                                            activeTierTab === tierKey
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <span>{tierKey} Tier</span>
                                        {packages[tierKey]?.is_popular && (
                                            <span className="ml-1.5 px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black">
                                                ★
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Active Tier Editor Card */}
                        {(['basic', 'standard', 'premium'] as const).map((tierKey) => {
                            if (activeTierTab !== tierKey) return null;
                            const tierData = packages[tierKey];

                            return (
                                <div key={tierKey} className="space-y-5 animate-in fade-in duration-200">
                                    <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 dark:text-cyan-400" />
                                            <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                                                Editing {tierKey} Tier Specifications
                                            </span>
                                        </div>

                                        <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(tierData.is_popular)}
                                                onChange={(e) => updateTierField(tierKey, 'is_popular', e.target.checked)}
                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span>Highlight as "Most Popular" Tier</span>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                Package Name
                                            </label>
                                            <input
                                                type="text"
                                                value={tierData.name}
                                                onChange={(e) => updateTierField(tierKey, 'name', e.target.value)}
                                                placeholder="e.g. Basic Plan, Enterprise Suite"
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-bold"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                Tier Tagline / Target Audience
                                            </label>
                                            <input
                                                type="text"
                                                value={tierData.tagline || ''}
                                                onChange={(e) => updateTierField(tierKey, 'tagline', e.target.value)}
                                                placeholder="e.g. Ideal for solo founders and small squads"
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                Monthly Price ({activeCurrencySymbol})
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={tierData.monthly_price}
                                                onChange={(e) => updateTierField(tierKey, 'monthly_price', parseFloat(e.target.value) || 0)}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                Yearly Price ({activeCurrencySymbol})
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={tierData.yearly_price}
                                                onChange={(e) => updateTierField(tierKey, 'yearly_price', parseFloat(e.target.value) || 0)}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Tier Features Checklist */}
                                    <div className="space-y-3 pt-2">
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Included Features in {tierKey.toUpperCase()} Tier ({tierData.features.length} features):
                                        </label>

                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newTierFeatureText}
                                                onChange={(e) => setNewTierFeatureText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addTierFeature(tierKey);
                                                    }
                                                }}
                                                placeholder={`Add feature point to ${tierKey} plan (e.g. 10 Team Members & Automated Backups)...`}
                                                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => addTierFeature(tierKey)}
                                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                <span>Add</span>
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            {tierData.features.map((feature, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-xs"
                                                >
                                                    <div className="flex items-center space-x-2.5">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                        <span className="text-slate-800 dark:text-slate-200 font-medium">
                                                            {feature}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTierFeature(tierKey, idx)}
                                                        className="text-slate-400 hover:text-red-500 p-1"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 4. DISPLAY & STATUS SETTINGS */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    value={order}
                                    onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                                />
                            </div>

                            <label className="flex items-center space-x-3 cursor-pointer pt-4 sm:pt-5">
                                <input
                                    type="checkbox"
                                    id="is_featured"
                                    checked={isFeatured}
                                    onChange={(e) => setIsFeatured(e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                    <div className="text-xs font-bold text-slate-900 dark:text-white">Feature on Home Page</div>
                                    <div className="text-[10px] text-slate-500">Pinned to homepage showcase</div>
                                </div>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer pt-4 sm:pt-5">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                    <div className="text-xs font-bold text-slate-900 dark:text-white">Active / Published</div>
                                    <div className="text-[10px] text-slate-500">Visible to frontend visitors</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* SUBMIT BUTTON BAR */}
                    <div className="flex items-center justify-end space-x-4 pt-2">
                        <Link
                            href="/admin/saas-products"
                            className="px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs shadow-xl shadow-indigo-500/25 flex items-center space-x-2 transition-all hover:scale-[1.02]"
                        >
                            <Save className="h-4 w-4" />
                            <span>{isSubmitting ? 'Saving SaaS Product...' : isEdit ? 'Save Changes' : 'Create Product'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
