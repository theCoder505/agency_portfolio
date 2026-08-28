import React, { useState, FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { SaasProduct } from '@/types';
import {
    Package,
    Save,
    ArrowLeft,
    Plus,
    Trash2,
    CheckCircle2,
    Sparkles,
    DollarSign,
    Layers
} from 'lucide-react';

interface SaasProductFormProps {
    product: SaasProduct | null;
    isEdit: boolean;
    currencySymbol: string;
}

export default function SaasProductForm({
    product,
    isEdit,
    currencySymbol,
}: SaasProductFormProps) {
    const [featuresList, setFeaturesList] = useState<string[]>(
        Array.isArray(product?.features) && product.features.length > 0
            ? product.features
            : ['Unlimited user seats', 'Automated daily cloud backups', 'Custom branded domain with SSL']
    );
    const [newFeatureText, setNewFeatureText] = useState('');

    const { data, setData, post, put, processing, errors } = useForm({
        name: product?.name || '',
        slug: product?.slug || '',
        tagline: product?.tagline || '',
        description: product?.description || '',
        icon: product?.icon || 'Database',
        badge: product?.badge || '',
        monthly_price: product?.monthly_price ?? 2999,
        half_yearly_price: product?.half_yearly_price ?? 15999,
        yearly_price: product?.yearly_price ?? 29999,
        has_monthly: product?.has_monthly ?? true,
        has_half_yearly: product?.has_half_yearly ?? true,
        has_yearly: product?.has_yearly ?? true,
        features: featuresList,
        order: product?.order ?? 0,
        is_featured: product?.is_featured ?? false,
        is_active: product?.is_active ?? true,
    });

    const addFeature = () => {
        if (!newFeatureText.trim()) return;
        const updated = [...featuresList, newFeatureText.trim()];
        setFeaturesList(updated);
        setData('features', updated);
        setNewFeatureText('');
    };

    const removeFeature = (idx: number) => {
        const updated = featuresList.filter((_, i) => i !== idx);
        setFeaturesList(updated);
        setData('features', updated);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEdit && product) {
            put(`/admin/saas-products/${product.id}`);
        } else {
            post('/admin/saas-products');
        }
    };

    return (
        <AdminLayout
            title={isEdit ? 'Edit SaaS Product' : 'Add SaaS Product'}
            breadcrumbs={[
                { title: 'SaaS Products', href: '/admin/saas-products' },
                { title: isEdit ? 'Edit Product' : 'New Product' },
            ]}
        >
            <div className="max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/admin/saas-products"
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                {isEdit ? `Edit: ${product?.name}` : 'Create New SaaS Product'}
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Configure pricing terms, multi-cycle billing options, and customer features.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Information Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
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
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. CloudERP Suite"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500"
                                />
                                {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    URL Slug (Leave blank for auto-generate)
                                </label>
                                <input
                                    type="text"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    placeholder="e.g. clouderp-suite"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                                />
                                {errors.slug && <p className="text-red-500 text-[10px] mt-1">{errors.slug}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Short Tagline
                                </label>
                                <input
                                    type="text"
                                    value={data.tagline}
                                    onChange={(e) => setData('tagline', e.target.value)}
                                    placeholder="e.g. All-in-one inventory & billing engine"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Highlight Badge (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={data.badge}
                                    onChange={(e) => setData('badge', e.target.value)}
                                    placeholder="e.g. Most Popular, AI-Powered, Enterprise"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Full Description
                            </label>
                            <textarea
                                rows={3}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Detailed overview of the product capabilities..."
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Pricing Matrix Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <DollarSign className="h-4 w-4 text-emerald-500" />
                            <span>Billing Cycles & Multi-Term Pricing ({currencySymbol})</span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Monthly Price ({currencySymbol})
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={data.monthly_price}
                                    onChange={(e) => setData('monthly_price', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                                />
                                <span className="text-[10px] text-slate-400 block">1 Month standard recurring</span>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Half-Yearly Price ({currencySymbol})
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={data.half_yearly_price}
                                    onChange={(e) => setData('half_yearly_price', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                                />
                                <span className="text-[10px] text-slate-400 block">6 Months duration price</span>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Yearly Price ({currencySymbol})
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={data.yearly_price}
                                    onChange={(e) => setData('yearly_price', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                                />
                                <span className="text-[10px] text-slate-400 block">12 Months annual pricing</span>
                            </div>
                        </div>
                    </div>

                    {/* Features Checklist Builder */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <CheckCircle2 className="h-4 w-4 text-cyan-500" />
                            <span>Included Package Features</span>
                        </h2>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newFeatureText}
                                onChange={(e) => setNewFeatureText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); }}}
                                placeholder="Add a feature point (e.g. Free SSL Certificate & CDN)..."
                                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                type="button"
                                onClick={addFeature}
                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Add</span>
                            </button>
                        </div>

                        <div className="space-y-2 pt-2">
                            {featuresList.map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-xs"
                                >
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                        <span className="text-slate-800 dark:text-slate-200">{feature}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(idx)}
                                        className="text-slate-400 hover:text-red-500 p-1"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Display & Status Settings */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    value={data.order}
                                    onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-5">
                                <input
                                    type="checkbox"
                                    id="is_featured"
                                    checked={data.is_featured}
                                    onChange={(e) => setData('is_featured', e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="is_featured" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Feature on Home Page
                                </label>
                            </div>

                            <div className="flex items-center space-x-2 pt-5">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="is_active" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Active / Published
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end space-x-3 pt-2">
                        <Link
                            href="/admin/saas-products"
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center space-x-2"
                        >
                            <Save className="h-4 w-4" />
                            <span>{isEdit ? 'Save Changes' : 'Create Product'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
