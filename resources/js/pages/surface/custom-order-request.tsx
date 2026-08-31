import React, { useState, FormEventHandler } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { SurfaceLayout } from '@/layouts/surface-layout';
import { SharedData, AppSettings } from '@/types';
import {
    Sparkles,
    Shield,
    UploadCloud,
    FileText,
    Trash2,
    Lock,
    ArrowRight,
    CheckCircle,
    Building2,
    User,
    Mail,
    Phone,
    Github,
    CreditCard,
    Eye,
    EyeOff
} from 'lucide-react';
import { showToast } from '@/lib/swal';
import { getCurrencySymbol, CURRENCY_OPTIONS } from '@/lib/formatters';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';

interface CustomOrderRequestProps {
    appSettings: AppSettings;
    defaultCurrency: string;
    currencySymbol: string;
}

export default function CustomOrderRequest({
    defaultCurrency = 'BDT',
    currencySymbol = '৳',
}: CustomOrderRequestProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [showPassword, setShowPassword] = useState(false);

    const categories = [
        'Custom Web Application',
        'SaaS Platform / Multi-tenant App',
        'Mobile Application (React Native / Flutter)',
        'Enterprise ERP / CRM System',
        'E-Commerce & Multi-Vendor Marketplace',
        'API Backend & Cloud Infrastructure',
        'AI / Machine Learning Integration',
        'Full-Stack MVP Development',
        'Other Bespoke Software',
    ];

    const budgetRangesByCurrency: Record<string, { label: string; value: number }[]> = {
        BDT: [
            { label: '< ৳ 25,000', value: 20000 },
            { label: '৳ 25k - ৳ 50k', value: 40000 },
            { label: '৳ 50k - ৳ 100k', value: 80000 },
            { label: '৳ 100k - ৳ 200k', value: 150000 },
            { label: '৳ 200k - ৳ 500k', value: 300000 },
            { label: '৳ 500,000+', value: 500000 },
        ],
        USD: [
            { label: '< $500', value: 450 },
            { label: '$500 - $1,500', value: 1000 },
            { label: '$1,500 - $3,000', value: 2200 },
            { label: '$3,000 - $5,000', value: 4000 },
            { label: '$5,000 - $10,000', value: 7500 },
            { label: '$10,000+', value: 12000 },
        ],
        EUR: [
            { label: '< €500', value: 450 },
            { label: '€500 - €1,500', value: 1000 },
            { label: '€1,500 - €3,000', value: 2200 },
            { label: '€3,000 - €5,000', value: 4000 },
            { label: '€5,000 - €10,000', value: 7500 },
            { label: '€10,000+', value: 12000 },
        ],
    };

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        category: categories[0],
        currency: defaultCurrency || 'BDT',
        estimated_budget: '' as string | number,
        target_deadline: '',
        requirements: '',
        reference_links: '',
        attachments: [] as File[],
        // Contact details
        client_whatsapp: (user?.whatsapp_number || user?.phone || '') as string,
        client_email: user?.email || '',
        // Guest Auth
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        company_name: user?.company_name || '',
        password: '',
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            const totalFiles = [...selectedFiles, ...filesArray];
            if (totalFiles.length > 5) {
                showToast('You can attach up to 5 files (PDF, DOCX, ZIP, Images).', 'warning');
                return;
            }
            setSelectedFiles(totalFiles);
            setData('attachments', totalFiles);
        }
    };

    const handleRemoveFile = (index: number) => {
        const updated = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(updated);
        setData('attachments', updated);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/custom-orders/request', {
            forceFormData: true,
            onError: (err) => {
                const firstError = Object.values(err)[0];
                if (firstError) {
                    showToast(firstError, 'error');
                }
            },
        });
    };

    return (
        <SurfaceLayout
            title="Request a Custom Project"
            description="Submit your custom software requirements. Get structured milestone quotes with direct source code delivery."
        >
            {/* HERO BANNER */}
            <section className="relative pt-12 pb-16 overflow-hidden border-b border-slate-200/60 dark:border-cyan-500/10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-5 relative z-10">
                    <div className="cv-badge">
                        <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                        <span>One-Time Purchase & Bespoke Engineering</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        Transform Your Idea into a <br className="hidden sm:block" />
                        <span className="cv-gradient-text">
                            High-Performance Custom Product
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Submit your specifications. Our architects will evaluate your project, propose a milestone payment schedule, and deliver production-grade codebase with full ownership.
                    </p>

                    {/* Value Pill Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <div className="cv-card flex items-center space-x-1.5 px-3 py-1.5 rounded-xl shadow-xs">
                            <CreditCard className="h-4 w-4 text-cyan-400" />
                            <span>Milestone-Based Payments</span>
                        </div>
                        <div className="cv-card flex items-center space-x-1.5 px-3 py-1.5 rounded-xl shadow-xs">
                            <Github className="h-4 w-4 text-cyan-400" />
                            <span>GitHub & Drive Codebase Delivery</span>
                        </div>
                        <div className="cv-card flex items-center space-x-1.5 px-3 py-1.5 rounded-xl shadow-xs">
                            <Shield className="h-4 w-4 text-emerald-400" />
                            <span>100% Intellectual Property Ownership</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* FORM CONTAINER */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-24 relative">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* STEP 1: PROJECT SPECS */}
                    <div className="cv-card rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-cyan-500/10">
                            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-black text-sm border border-cyan-500/20">
                                01
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Project Scope & Requirements
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Define your product title, category, and functional specifications.
                                </p>
                            </div>
                        </div>

                        {/* Project Title */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Project / Product Title <span className="text-rose-500">*</span>
                                </label>
                                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                                    {data.title.length} characters
                                </span>
                            </div>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="e.g. AI-Powered Healthcare CRM or React Native Multi-Vendor App"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#01121e] border border-slate-200 dark:border-cyan-500/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm font-medium"
                            />
                            {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                Project Category
                            </label>
                            <select
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#01121e] border border-slate-200 dark:border-cyan-500/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm font-medium"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            {errors.category && <p className="text-rose-500 text-xs mt-1">{errors.category}</p>}
                        </div>

                        {/* Currency & Estimated Budget & Deadline */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                                    <span>Preferred Currency</span>
                                    <span className="text-[10px] text-cyan-500 font-bold">Normally by default: BDT (৳)</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {CURRENCY_OPTIONS.map((cur) => (
                                        <button
                                            key={cur.code}
                                            type="button"
                                            onClick={() => setData('currency', cur.code)}
                                            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border ${
                                                data.currency === cur.code
                                                    ? 'bg-cyan-500 border-cyan-500 text-slate-950 font-black shadow-xs'
                                                    : 'bg-slate-50 dark:bg-[#01121e] border-slate-200 dark:border-cyan-500/20 text-slate-700 dark:text-slate-300 hover:border-cyan-500/40'
                                            }`}
                                        >
                                            <span className="font-mono">{cur.symbol}</span>
                                            <span>{cur.code}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                        Target Budget ({data.currency}) (Optional)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                                            {getCurrencySymbol(data.currency)}
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={data.estimated_budget}
                                            onChange={(e) => setData('estimated_budget', e.target.value)}
                                            placeholder="e.g. 50000"
                                            className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#01121e] border border-slate-200 dark:border-cyan-500/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm font-medium"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {(budgetRangesByCurrency[data.currency] || budgetRangesByCurrency['BDT']).map((r) => (
                                            <button
                                                type="button"
                                                key={r.label}
                                                onClick={() => setData('estimated_budget', r.value)}
                                                className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-[#01121e] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-cyan-500/15 hover:border-cyan-500/40 transition-colors"
                                            >
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.estimated_budget && <p className="text-rose-500 text-xs mt-1">{errors.estimated_budget}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                        Target Delivery Deadline (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={data.target_deadline}
                                        onChange={(e) => setData('target_deadline', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#01121e] border border-slate-200 dark:border-cyan-500/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm font-medium"
                                    />
                                    {errors.target_deadline && <p className="text-rose-500 text-xs mt-1">{errors.target_deadline}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Requirements */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Detailed Requirements & Scope of Work <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                                    <span className="font-mono font-medium text-cyan-600 dark:text-cyan-400">
                                        {data.requirements.length.toLocaleString()} characters
                                    </span>
                                    <span>&bull;</span>
                                    <span className="font-mono">
                                        {data.requirements.trim() ? data.requirements.trim().split(/\s+/).length : 0} words
                                    </span>
                                </div>
                            </div>
                            <textarea
                                rows={6}
                                value={data.requirements}
                                onChange={(e) => setData('requirements', e.target.value)}
                                placeholder="Describe what you want to build:&#10;1. Key features & user roles (Admin, Client, Vendor)&#10;2. Preferred tech stack (Laravel, React, Node, React Native, etc.)&#10;3. Third-party integrations (Payment gateways, APIs, Maps)&#10;4. Design preferences or existing designs."
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#01121e] border border-slate-200 dark:border-cyan-500/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm font-medium leading-relaxed resize-y"
                            />
                            <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-400">
                                <span>Be as detailed as possible to help us provide an accurate timeline and quote.</span>
                                <span className="font-mono text-slate-500">
                                    {data.requirements.length.toLocaleString()} chars
                                </span>
                            </div>
                            {errors.requirements && <p className="text-rose-500 text-xs mt-1">{errors.requirements}</p>}
                        </div>

                        {/* Reference Links */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Reference Links (Figma, GitHub, Live Demo, Competitor URLs)
                                </label>
                                {data.reference_links.length > 0 && (
                                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                                        {data.reference_links.length} characters
                                    </span>
                                )}
                            </div>
                            <input
                                type="text"
                                value={data.reference_links}
                                onChange={(e) => setData('reference_links', e.target.value)}
                                placeholder="https://figma.com/file/... , https://github.com/... or similar websites"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#01121e] border border-slate-200 dark:border-cyan-500/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm font-medium"
                            />
                            {errors.reference_links && <p className="text-rose-500 text-xs mt-1">{errors.reference_links}</p>}
                        </div>

                        {/* Attachments Upload */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                Attach Files / SRS / Wireframes (Max 5 files, up to 20MB each)
                            </label>
                            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-cyan-500/20 rounded-2xl hover:border-cyan-500 dark:hover:border-cyan-400 transition-colors cursor-pointer bg-slate-50/50 dark:bg-[#01121e]/50">
                                <UploadCloud className="h-8 w-8 text-cyan-400 mb-2" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                    Click or drag files here to upload
                                </span>
                                <span className="text-[11px] text-slate-400 mt-1">
                                    Supports PDF, DOCX, ZIP, PNG, JPG, FIG, XLSX
                                </span>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.zip,.rar,.png,.jpg,.jpeg,.webp,.txt,.fig,.csv,.xlsx"
                                />
                            </label>

                            {selectedFiles.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {selectedFiles.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-[#01121e] text-xs border border-slate-200/60 dark:border-cyan-500/15"
                                        >
                                            <div className="flex items-center space-x-2 truncate">
                                                <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                    {file.name}
                                                </span>
                                                <span className="text-slate-400">
                                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile(idx)}
                                                className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* STEP 2: CLIENT INFO */}
                    <div className="cv-card rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-cyan-500/10">
                            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-black text-sm border border-cyan-500/20">
                                02
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Client & Workspace Information
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {user
                                        ? 'Authenticated customer account details.'
                                        : 'Create your customer portal workspace to track proposal and milestone payments.'}
                                </p>
                            </div>
                        </div>

                        {user ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-black text-sm">
                                            {user.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {user.email} &bull; {user.phone || 'No phone'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                        Authenticated
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center space-x-1.5">
                                            <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-500" />
                                            <span>WhatsApp Number (For Direct Project Chat)</span>
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={data.client_whatsapp}
                                                onChange={(e) => setData('client_whatsapp', e.target.value)}
                                                placeholder="e.g. +880 1700-000000 or +1 555-0192"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#01121e] border border-slate-200 dark:border-cyan-500/20 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-cyan-500"
                                            />
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-1">Our engineers will communicate with you directly on WhatsApp.</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                            Contact Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="email"
                                                value={data.client_email}
                                                onChange={(e) => setData('client_email', e.target.value)}
                                                placeholder={user.email}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#01121e] border border-slate-200 dark:border-cyan-500/20 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-cyan-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                            Full Name <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="John Doe"
                                                required
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#01121e] border border-slate-200 dark:border-cyan-500/20 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-cyan-500"
                                            />
                                        </div>
                                        {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                            Email Address <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="john@company.com"
                                                required
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#01121e] border border-slate-200 dark:border-cyan-500/20 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-cyan-500"
                                            />
                                        </div>
                                        {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center space-x-1.5">
                                            <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-500" />
                                            <span>WhatsApp Number (For Quick Chat) <span className="text-rose-500">*</span></span>
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={data.client_whatsapp || data.phone}
                                                onChange={(e) => {
                                                    setData('client_whatsapp', e.target.value);
                                                    setData('phone', e.target.value);
                                                }}
                                                placeholder="e.g. +880 1700-000000 or +1 (555) 000-0000"
                                                required
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#01121e] border border-slate-200 dark:border-cyan-500/20 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-cyan-500"
                                            />
                                        </div>
                                        {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                            Company / Organization (Optional)
                                        </label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={data.company_name}
                                                onChange={(e) => setData('company_name', e.target.value)}
                                                placeholder="Acme Inc."
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#01121e] border border-slate-200 dark:border-cyan-500/20 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-cyan-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                        Create Portal Password <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Choose a secure password (min 8 chars)"
                                            required
                                            className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-[#01121e] border border-slate-200 dark:border-cyan-500/20 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-cyan-500"
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
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Used to log into your customer portal to view quotations, milestones, and deliverables.
                                    </p>
                                    {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password}</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SUBMIT BUTTON & WORKFLOW BANNER */}
                    <div className="cv-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-cyan-500/30">
                        <div className="space-y-1 text-center sm:text-left">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start space-x-2">
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                                <span>No Upfront Obligation</span>
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md">
                                Submitting a request is completely free. We will assess your requirements and propose milestone terms before any payment is due.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="cv-btn-primary w-full sm:w-auto text-sm py-4 px-8"
                        >
                            <span>{processing ? 'Submitting Request...' : 'Submit Project Request'}</span>
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </form>
            </section>
        </SurfaceLayout>
    );
}
