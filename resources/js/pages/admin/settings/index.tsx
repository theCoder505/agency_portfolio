import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { AppSettings } from '@/types';
import { ImageUploader } from '@/components/admin/image-uploader';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import {
    Settings,
    Save,
    Sparkles,
    Image as ImageIcon,
    Phone,
    MapPin,
    Star,
    Share2,
    Play,
    FileText,
    Check,
    CreditCard
} from 'lucide-react';
import { showToast, showSuccessAlert } from '@/lib/swal';

interface SettingsIndexProps {
    settings: AppSettings;
}

export default function SettingsIndex({ settings }: SettingsIndexProps) {
    const [activeTab, setActiveTab] = useState<'branding' | 'contact' | 'payments' | 'whatsapp' | 'trustpilot' | 'social' | 'media' | 'legal'>('branding');

    // Branding State
    const [brandName, setBrandName] = useState(settings?.brand_name || 'CodeVenture Tech');
    const [tagline, setTagline] = useState(settings?.tagline || '');
    const [footerText, setFooterText] = useState(settings?.footer_text || '');
    const [copyrightText, setCopyrightText] = useState(settings?.copyright_text || '');

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [existingLogo, setExistingLogo] = useState<string | null>(settings?.logo || null);

    const [logoDarkFile, setLogoDarkFile] = useState<File | null>(null);
    const [existingLogoDark, setExistingLogoDark] = useState<string | null>(settings?.logo_dark || null);

    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [existingFavicon, setExistingFavicon] = useState<string | null>(settings?.favicon || null);

    // Contact State
    const [contactEmail, setContactEmail] = useState(settings?.contact_email || 'hello@codeventure.tech');
    const [contactPhone, setContactPhone] = useState(settings?.contact_phone || '+1 (555) 234-5678');
    const [addressLine1, setAddressLine1] = useState(settings?.address_line1 || '');
    const [addressLine2, setAddressLine2] = useState(settings?.address_line2 || '');
    const [googleMapEmbedUrl, setGoogleMapEmbedUrl] = useState(settings?.google_map_embed_url || '');

    // Payment & SaaS Billing State
    const [currencySymbol, setCurrencySymbol] = useState(settings?.currency_symbol || '৳');
    const [currencyCode, setCurrencyCode] = useState(settings?.currency_code || 'BDT');
    const [bkashNumber, setBkashNumber] = useState(settings?.bkash_number || '01712-345678');
    const [bkashInstructions, setBkashInstructions] = useState(settings?.bkash_instructions || 'Go to bKash App > Send Money > Enter our Personal Number > Put Order Number in Reference > Enter PIN');
    const [nagadNumber, setNagadNumber] = useState(settings?.nagad_number || '01812-345678');
    const [nagadInstructions, setNagadInstructions] = useState(settings?.nagad_instructions || 'Go to Nagad App > Send Money > Enter our Personal Number > Put Order Number in Reference > Enter PIN');

    // WhatsApp State
    const [whatsappNumber, setWhatsappNumber] = useState(settings?.whatsapp_number || '+15552345678');
    const [whatsappPrompt, setWhatsappPrompt] = useState(settings?.whatsapp_message_prompt || '');
    const [whatsappEnabled, setWhatsappEnabled] = useState(settings?.whatsapp_enabled !== '0' && settings?.whatsapp_enabled !== false);

    // Trustpilot State
    const [trustpilotEnabled, setTrustpilotEnabled] = useState(settings?.trustpilot_enabled !== '0' && settings?.trustpilot_enabled !== false);
    const [trustpilotUrl, setTrustpilotUrl] = useState(settings?.trustpilot_url || 'https://www.trustpilot.com/review/codeventure.tech');
    const [trustpilotScore, setTrustpilotScore] = useState(settings?.trustpilot_score || '4.9');
    const [trustpilotCount, setTrustpilotCount] = useState(settings?.trustpilot_reviews_count || '142');

    // Social Media State
    const [socialGithub, setSocialGithub] = useState(settings?.social_github || '');
    const [socialLinkedin, setSocialLinkedin] = useState(settings?.social_linkedin || '');
    const [socialTwitter, setSocialTwitter] = useState(settings?.social_twitter || '');
    const [socialFacebook, setSocialFacebook] = useState(settings?.social_facebook || '');
    const [socialInstagram, setSocialInstagram] = useState(settings?.social_instagram || '');
    const [socialYoutube, setSocialYoutube] = useState(settings?.social_youtube || '');

    // Media State
    const [featuredVideo, setFeaturedVideo] = useState(settings?.featured_youtube_video || 'https://www.youtube.com/watch?v=LXb3EKWsInQ');

    // Legal Content State
    const [termsContent, setTermsContent] = useState(settings?.terms_and_conditions || '');
    const [privacyContent, setPrivacyContent] = useState(settings?.privacy_policy || '');

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const formData = new FormData();

        // Branding
        formData.append('brand_name', brandName);
        formData.append('tagline', tagline);
        formData.append('footer_text', footerText);
        formData.append('copyright_text', copyrightText);

        if (logoFile) formData.append('logo', logoFile);
        if (logoDarkFile) formData.append('logo_dark', logoDarkFile);
        if (faviconFile) formData.append('favicon', faviconFile);

        // Contact
        formData.append('contact_email', contactEmail);
        formData.append('contact_phone', contactPhone);
        formData.append('address_line1', addressLine1);
        formData.append('address_line2', addressLine2);
        formData.append('google_map_embed_url', googleMapEmbedUrl);

        // Payments
        formData.append('currency_symbol', currencySymbol);
        formData.append('currency_code', currencyCode);
        formData.append('bkash_number', bkashNumber);
        formData.append('bkash_instructions', bkashInstructions);
        formData.append('nagad_number', nagadNumber);
        formData.append('nagad_instructions', nagadInstructions);

        // WhatsApp
        formData.append('whatsapp_number', whatsappNumber);
        formData.append('whatsapp_message_prompt', whatsappPrompt);
        formData.append('whatsapp_enabled', whatsappEnabled ? '1' : '0');

        // Trustpilot
        formData.append('trustpilot_enabled', trustpilotEnabled ? '1' : '0');
        formData.append('trustpilot_url', trustpilotUrl);
        formData.append('trustpilot_score', trustpilotScore);
        formData.append('trustpilot_reviews_count', trustpilotCount);

        // Social
        formData.append('social_github', socialGithub);
        formData.append('social_linkedin', socialLinkedin);
        formData.append('social_twitter', socialTwitter);
        formData.append('social_facebook', socialFacebook);
        formData.append('social_instagram', socialInstagram);
        formData.append('social_youtube', socialYoutube);

        // Media & Legal
        formData.append('featured_youtube_video', featuredVideo);
        formData.append('terms_and_conditions', termsContent);
        formData.append('privacy_policy', privacyContent);

        router.post('/admin/settings', formData, {
            preserveScroll: true,
            onFinish: () => setIsSaving(false),
        });
    };

    const tabs = [
        { id: 'branding', label: 'Branding & Logos', icon: ImageIcon },
        { id: 'payments', label: 'bKash & Nagad Payments', icon: CreditCard },
        { id: 'contact', label: 'Contact & Location', icon: MapPin },
        { id: 'whatsapp', label: 'WhatsApp Widget', icon: WhatsAppIcon },
        { id: 'trustpilot', label: 'Trustpilot Setup', icon: Star },
        { id: 'social', label: 'Social Media', icon: Share2 },
        { id: 'media', label: 'Media & Videos', icon: Play },
        { id: 'legal', label: 'Legal Pages (Rich Text)', icon: FileText },
    ];

    return (
        <AdminLayout
            title="Application Settings"
            breadcrumbs={[{ title: 'Settings' }]}
        >
            <div className="space-y-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Website & App Configuration
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Update brand logos, WhatsApp integration, Trustpilot badge, and rich legal documents.
                        </p>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
                    >
                        <Save className="h-4 w-4" />
                        <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
                    </button>
                </div>

                {/* Main Settings Card with Tab Navigation */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row">
                    {/* Left Vertical Tab Bar */}
                    <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 p-4 space-y-1 bg-slate-50/50 dark:bg-slate-950/40">
                        {tabs.map((tab) => {
                            const IconComp = tab.icon;
                            const isCurrent = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                                        isCurrent
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <IconComp className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Form Content Pane */}
                    <div className="flex-1 p-6 sm:p-8">
                        <form onSubmit={handleSave} className="space-y-6">
                            {/* TAB 1: BRANDING & LOGOS */}
                            {activeTab === 'branding' && (
                                <div className="space-y-6 animate-in fade-in">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                                        Brand Identity & Logos
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Brand Name</label>
                                            <input
                                                type="text"
                                                value={brandName}
                                                onChange={(e) => setBrandName(e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tagline</label>
                                            <input
                                                type="text"
                                                value={tagline}
                                                onChange={(e) => setTagline(e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                                            />
                                        </div>
                                    </div>

                                    {/* Logo & Icon Uploaders with Full-Size Previews */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                        <ImageUploader
                                            label="Brand Header Logo (Light Mode)"
                                            multiple={false}
                                            existingImages={existingLogo}
                                            onChange={(file, existing) => {
                                                setLogoFile(file instanceof File ? file : null);
                                                if (existing && existing.length === 0) setExistingLogo(null);
                                            }}
                                            helperText="Transparent PNG or SVG."
                                            heightClass="h-44 sm:h-52"
                                        />

                                        <ImageUploader
                                            label="Brand Header Logo (Dark Mode)"
                                            multiple={false}
                                            existingImages={existingLogoDark}
                                            onChange={(file, existing) => {
                                                setLogoDarkFile(file instanceof File ? file : null);
                                                if (existing && existing.length === 0) setExistingLogoDark(null);
                                            }}
                                            helperText="Light/white logo for dark mode."
                                            heightClass="h-44 sm:h-52"
                                        />

                                        <ImageUploader
                                            label="Website Favicon Icon"
                                            multiple={false}
                                            existingImages={existingFavicon}
                                            onChange={(file, existing) => {
                                                setFaviconFile(file instanceof File ? file : null);
                                                if (existing && existing.length === 0) setExistingFavicon(null);
                                            }}
                                            helperText="Square PNG, SVG or ICO icon."
                                            heightClass="h-44 sm:h-52"
                                        />
                                    </div>

                                    <div className="space-y-1.5 pt-2">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Footer Text</label>
                                        <textarea
                                            rows={3}
                                            value={footerText}
                                            onChange={(e) => setFooterText(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs leading-relaxed"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Copyright Text</label>
                                        <input
                                            type="text"
                                            value={copyrightText}
                                            onChange={(e) => setCopyrightText(e.target.value)}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB: BKASH, NAGAD & SAAS PAYMENT SETTINGS */}
                            {activeTab === 'payments' && (
                                <div className="space-y-6 animate-in fade-in">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                                        bKash, Nagad & SaaS Billing Gateway Configuration
                                    </h3>

                                    {/* Currency Presets & Settings */}
                                    <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Default Platform Currency Preset
                                            </span>
                                            <span className="text-[10px] text-indigo-500 font-bold">Default: BDT (৳)</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCurrencyCode('BDT');
                                                    setCurrencySymbol('৳');
                                                }}
                                                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border ${
                                                    currencyCode === 'BDT'
                                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                                }`}
                                            >
                                                <span className="font-mono">৳</span>
                                                <span>BDT (৳)</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCurrencyCode('USD');
                                                    setCurrencySymbol('$');
                                                }}
                                                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border ${
                                                    currencyCode === 'USD'
                                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                                }`}
                                            >
                                                <span className="font-mono">$</span>
                                                <span>USD ($)</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCurrencyCode('EUR');
                                                    setCurrencySymbol('€');
                                                }}
                                                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border ${
                                                    currencyCode === 'EUR'
                                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                                }`}
                                            >
                                                <span className="font-mono">€</span>
                                                <span>EUR (€)</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Currency Symbol
                                            </label>
                                            <input
                                                type="text"
                                                value={currencySymbol}
                                                onChange={(e) => setCurrencySymbol(e.target.value)}
                                                placeholder="৳ or $ or €"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold font-mono"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Currency Code (ISO)
                                            </label>
                                            <input
                                                type="text"
                                                value={currencyCode}
                                                onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                                                placeholder="BDT or USD"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold font-mono uppercase"
                                            />
                                        </div>
                                    </div>

                                    {/* bKash Configuration */}
                                    <div className="p-5 rounded-2xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200/60 dark:border-pink-900/40 space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="h-6 w-6 rounded-lg bg-pink-600 text-white flex items-center justify-center text-[10px] font-black">
                                                bK
                                            </div>
                                            <h4 className="text-xs font-bold text-pink-700 dark:text-pink-300 uppercase tracking-wider">
                                                bKash Personal / Merchant Payment Details
                                            </h4>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                bKash Receiver Mobile Number
                                            </label>
                                            <input
                                                type="text"
                                                value={bkashNumber}
                                                onChange={(e) => setBkashNumber(e.target.value)}
                                                placeholder="01712-345678"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono font-bold"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                bKash Step-by-Step Payment Instructions for Customers
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={bkashInstructions}
                                                onChange={(e) => setBkashInstructions(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs leading-relaxed"
                                            />
                                        </div>
                                    </div>

                                    {/* Nagad Configuration */}
                                    <div className="p-5 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40 space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="h-6 w-6 rounded-lg bg-orange-600 text-white flex items-center justify-center text-[10px] font-black">
                                                NG
                                            </div>
                                            <h4 className="text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider">
                                                Nagad Personal / Merchant Payment Details
                                            </h4>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Nagad Receiver Mobile Number
                                            </label>
                                            <input
                                                type="text"
                                                value={nagadNumber}
                                                onChange={(e) => setNagadNumber(e.target.value)}
                                                placeholder="01812-345678"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono font-bold"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Nagad Step-by-Step Payment Instructions for Customers
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={nagadInstructions}
                                                onChange={(e) => setNagadInstructions(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs leading-relaxed"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: CONTACT & LOCATION */}
                            {activeTab === 'contact' && (
                                <div className="space-y-6 animate-in fade-in">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                                        Contact Information & Office Map
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contact Email</label>
                                            <input
                                                type="email"
                                                value={contactEmail}
                                                onChange={(e) => setContactEmail(e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contact Phone</label>
                                            <input
                                                type="text"
                                                value={contactPhone}
                                                onChange={(e) => setContactPhone(e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Address Line 1</label>
                                            <input
                                                type="text"
                                                value={addressLine1}
                                                onChange={(e) => setAddressLine1(e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Address Line 2 (City, State, Country)</label>
                                            <input
                                                type="text"
                                                value={addressLine2}
                                                onChange={(e) => setAddressLine2(e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Google Map Embed URL</label>
                                        <input
                                            type="text"
                                            value={googleMapEmbedUrl}
                                            onChange={(e) => setGoogleMapEmbedUrl(e.target.value)}
                                            placeholder="https://www.google.com/maps/embed?..."
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: WHATSAPP WIDGET */}
                            {activeTab === 'whatsapp' && (
                                <div className="space-y-6 animate-in fade-in">
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                                WhatsApp Floating Messenger Setup
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Controls the floating interactive chat bubble displayed in website footer on scroll.
                                            </p>
                                        </div>

                                        <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={whatsappEnabled}
                                                onChange={(e) => setWhatsappEnabled(e.target.checked)}
                                                className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span>Enable Widget</span>
                                        </label>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">WhatsApp Phone Number (with Country Code)</label>
                                            <input
                                                type="text"
                                                value={whatsappNumber}
                                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                                placeholder="+15552345678"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Default Chat Message Prompt</label>
                                            <textarea
                                                rows={3}
                                                value={whatsappPrompt}
                                                onChange={(e) => setWhatsappPrompt(e.target.value)}
                                                placeholder="Hi CodeVenture Tech! I would like to discuss building our upcoming project."
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 4: TRUSTPILOT SETUP */}
                            {activeTab === 'trustpilot' && (
                                <div className="space-y-6 animate-in fade-in">
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                                Trustpilot Reviews Integration
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Showcase verified Trustpilot ratings and Swiper review cards across the website.
                                            </p>
                                        </div>

                                        <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={trustpilotEnabled}
                                                onChange={(e) => setTrustpilotEnabled(e.target.checked)}
                                                className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span>Enable Trustpilot Badge</span>
                                        </label>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Trustpilot Public Profile URL</label>
                                            <input
                                                type="url"
                                                value={trustpilotUrl}
                                                onChange={(e) => setTrustpilotUrl(e.target.value)}
                                                placeholder="https://www.trustpilot.com/review/codeventure.tech"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Trustpilot Score (e.g. 4.9)</label>
                                                <input
                                                    type="text"
                                                    value={trustpilotScore}
                                                    onChange={(e) => setTrustpilotScore(e.target.value)}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Reviews Count (e.g. 142+)</label>
                                                <input
                                                    type="text"
                                                    value={trustpilotCount}
                                                    onChange={(e) => setTrustpilotCount(e.target.value)}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 5: SOCIAL MEDIA */}
                            {activeTab === 'social' && (
                                <div className="space-y-6 animate-in fade-in">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                                        Social Media Profiles
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">GitHub</label>
                                            <input
                                                type="url"
                                                value={socialGithub}
                                                onChange={(e) => setSocialGithub(e.target.value)}
                                                placeholder="https://github.com/..."
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">LinkedIn</label>
                                            <input
                                                type="url"
                                                value={socialLinkedin}
                                                onChange={(e) => setSocialLinkedin(e.target.value)}
                                                placeholder="https://linkedin.com/company/..."
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Twitter / X</label>
                                            <input
                                                type="url"
                                                value={socialTwitter}
                                                onChange={(e) => setSocialTwitter(e.target.value)}
                                                placeholder="https://x.com/..."
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">YouTube</label>
                                            <input
                                                type="url"
                                                value={socialYoutube}
                                                onChange={(e) => setSocialYoutube(e.target.value)}
                                                placeholder="https://youtube.com/@..."
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 6: MEDIA & VIDEOS */}
                            {activeTab === 'media' && (
                                <div className="space-y-6 animate-in fade-in">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                                        Showcase Video & Media
                                    </h3>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Featured Agency Showreel Video URL (YouTube)
                                        </label>
                                        <input
                                            type="text"
                                            value={featuredVideo}
                                            onChange={(e) => setFeaturedVideo(e.target.value)}
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB 7: LEGAL PAGES (RICH TEXT) */}
                            {activeTab === 'legal' && (
                                <div className="space-y-6 animate-in fade-in">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                                        Legal Compliance Documents (HTML / Rich Text)
                                    </h3>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Terms & Conditions Content (HTML)
                                        </label>
                                        <textarea
                                            rows={8}
                                            value={termsContent}
                                            onChange={(e) => setTermsContent(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono leading-relaxed"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Privacy Policy Content (HTML)
                                        </label>
                                        <textarea
                                            rows={8}
                                            value={privacyContent}
                                            onChange={(e) => setPrivacyContent(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono leading-relaxed"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Bottom Save CTA */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>{isSaving ? 'Saving Settings...' : 'Save All Settings'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
