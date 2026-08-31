import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { AppSettings, ServiceCapabilityItem } from '@/types';
import { ImageUploader } from '@/components/admin/image-uploader';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import {
    Save,
    Image as ImageIcon,
    MapPin,
    Star,
    Share2,
    Play,
    FileText,
    CreditCard,
    HelpCircle,
    Plus,
    Trash2,
    ArrowUp,
    ArrowDown,
    Layers,
    RotateCcw
} from 'lucide-react';
import { showToast } from '@/lib/swal';

interface SettingsIndexProps {
    settings: AppSettings;
}

const DEFAULT_SERVICES: ServiceCapabilityItem[] = [
    {
        number: '01',
        icon: 'Brain',
        title: 'Machine Learning',
        description: 'At Code Venture, Machine Learning is more than pattern recognition—it’s strategic foresight coded into action. We create adaptive systems that learn from data, predict outcomes, and make processes smarter across every touchpoint.',
        tags: ['Predictive AI', 'Adaptive Models', 'Strategic Foresight'],
        link: '/custom-orders/request',
        gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
    },
    {
        number: '02',
        icon: 'Cpu',
        title: 'Artificial Intelligence',
        description: 'We design intelligent systems that think, learn, and adapt—empowering your business with high-throughput automation, smart telemetry analytics, and data-driven decision-making.',
        tags: ['LLM Orchestration', 'Smart Automation', 'Decision Engines'],
        link: '/custom-orders/request',
        gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    },
    {
        number: '03',
        icon: 'Radio',
        title: 'IoT Solutions',
        description: 'At Code Venture, we create smart IoT ecosystems that connect devices, platforms, and people. From smart sensors to seamless system integrations, we help businesses unlock automation and real-time efficiency.',
        tags: ['Smart Sensors', 'Cloud Telemetry', 'Connected Devices'],
        link: '/custom-orders/request',
        gradient: 'from-teal-400 via-emerald-500 to-cyan-600',
    },
    {
        number: '04',
        icon: 'CircuitBoard',
        title: 'Hardware Integration',
        description: 'We bridge the physical and digital by integrating software with smart hardware—building interconnected systems that deliver seamless functionality, control, and edge computing.',
        tags: ['Firmware APIs', 'Edge Systems', 'Device Control'],
        link: '/custom-orders/request',
        gradient: 'from-amber-400 via-orange-500 to-rose-500',
    },
    {
        number: '05',
        icon: 'ShoppingCart',
        title: 'Ecommerce Development',
        description: 'We create robust, scalable ecommerce platforms that streamline user journeys, optimize conversions, and elevate your brand in the competitive global marketplace.',
        tags: ['Headless Stores', 'Multi-Currency', 'Instant Checkout'],
        link: '/custom-orders/request',
        gradient: 'from-pink-500 via-rose-500 to-red-500',
    },
    {
        number: '06',
        icon: 'Smartphone',
        title: 'Web & Mobile Development',
        description: 'From lightning-fast web platforms to fluid mobile experiences, we don’t just build—we launch brands into the hands of the future. One tap at a time.',
        tags: ['React 19 & Next.js', 'Native-Feel Apps', 'Micro-Interactions'],
        link: '/custom-orders/request',
        gradient: 'from-blue-500 via-cyan-500 to-sky-400',
    },
    {
        number: '07',
        icon: 'Palette',
        title: 'UI/UX Designing',
        description: 'Our design philosophy blends aesthetics with usability—crafting intuitive digital experiences that delight users and drive engagement across every touchpoint.',
        tags: ['Design Systems', '3D & Motion', 'User Journeys'],
        link: '/custom-orders/request',
        gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    },
    {
        number: '08',
        icon: 'TrendingUp',
        title: 'Digital Marketing',
        description: 'From strategy to execution, we amplify your digital presence through data-led campaigns, content that connects, and performance that delivers measurable growth.',
        tags: ['Technical SEO', 'Performance Growth', 'Conversion Funnels'],
        link: '/custom-orders/request',
        gradient: 'from-emerald-400 via-teal-500 to-blue-500',
    },
    {
        number: '09',
        icon: 'Zap',
        title: 'Cloud DevOps & Architecture',
        description: 'We architect resilient cloud infrastructures, automated CI/CD pipelines, containerized microservices, and high-availability systems with 99.9% uptime SLA.',
        tags: ['Kubernetes & Docker', 'CI/CD Pipelines', 'AWS & Cloudflare'],
        link: '/custom-orders/request',
        gradient: 'from-amber-500 via-rose-500 to-red-600',
    },
];

const AVAILABLE_ICONS = [
    'Brain',
    'Cpu',
    'Radio',
    'CircuitBoard',
    'ShoppingCart',
    'Smartphone',
    'Palette',
    'TrendingUp',
    'Code2',
    'Database',
    'Globe',
    'Zap',
    'Rocket',
    'Layers',
    'Sparkles',
];

const GRADIENT_PRESETS = [
    { label: 'Cyan to Blue', value: 'from-cyan-500 via-blue-500 to-indigo-600' },
    { label: 'Indigo to Pink', value: 'from-indigo-500 via-purple-500 to-pink-500' },
    { label: 'Teal to Cyan', value: 'from-teal-400 via-emerald-500 to-cyan-600' },
    { label: 'Amber to Rose', value: 'from-amber-400 via-orange-500 to-rose-500' },
    { label: 'Pink to Red', value: 'from-pink-500 via-rose-500 to-red-500' },
    { label: 'Blue to Sky', value: 'from-blue-500 via-cyan-500 to-sky-400' },
    { label: 'Violet to Fuchsia', value: 'from-violet-500 via-purple-500 to-fuchsia-500' },
    { label: 'Emerald to Teal', value: 'from-emerald-400 via-teal-500 to-blue-500' },
];

const DEFAULT_FAQS = [
    {
        q: 'What services and technologies does CodeVenture Tech specialize in?',
        a: 'We engineer high-performance web applications, enterprise SaaS platforms, AI streaming agents, custom cloud portals, and bespoke modern websites using React, Next.js, Laravel, TypeScript, Tailwind CSS, PostgreSQL, and cloud infrastructure.',
    },
    {
        q: 'How does the custom project workflow and delivery milestones operate?',
        a: 'Every custom project is structured into transparent, trackable milestones with deliverables and budget breakdowns. You can track progress in real-time, review deliverables, request revisions, and release milestone funds securely from your dedicated client portal.',
    },
    {
        q: 'How do subscription packages and payment processing work for SaaS products?',
        a: 'You can subscribe to our ready-to-deploy enterprise SaaS platforms with flexible monthly or yearly billing cycles. We support instant local payment verification via bKash and Nagad with Transaction ID validation, as well as enterprise invoicing.',
    },
    {
        q: 'Do you provide post-launch maintenance, cloud hosting, and SLA support?',
        a: 'Yes! All our software products and custom web systems come with ongoing maintenance, high-availability cloud deployment (99.99% uptime), automated database backups, custom domain and SSL provisioning, and priority SLA technical support.',
    },
    {
        q: 'How fast can CodeVenture Tech start on my project?',
        a: 'Once you submit a project inquiry or custom order brief, our senior engineering leads review your requirements and provide an architectural roadmap, deliverable estimates, and a kick-off schedule within 24 hours.',
    },
];

const DEFAULT_TERMS_TEMPLATE = `<h2>1. Acceptance of Terms</h2>
<p>By accessing or utilizing any software, custom development, SaaS products, or digital consulting services provided by CodeVenture Tech, you agree to be bound by these Terms & Conditions.</p>

<h2>2. Scope of Services & Custom Milestones</h2>
<p>CodeVenture Tech engineers high-performance web applications, enterprise SaaS platforms, AI systems, and bespoke digital infrastructure. Custom client projects are structured according to defined project milestones with agreed deliverable scopes, budgets, and testing review windows.</p>

<h2>3. Intellectual Property & Code Ownership</h2>
<p>Upon final payment and formal release of project milestones, the client receives full ownership rights and access to the deliverables and custom source code developed specifically for their order, excluding pre-existing agency libraries and open-source frameworks.</p>

<h2>4. Subscription Billing & SaaS Cancellation</h2>
<p>Subscriptions for ready-to-deploy enterprise SaaS platforms are billed on a recurring monthly or yearly cycle. Instant payment verification via bKash and Nagad with Transaction ID validation facilitates automated instance provisioning. Subscriptions may be modified or cancelled from your client dashboard prior to the next renewal date.</p>

<h2>5. Service Level Agreement (SLA) & Reliability</h2>
<p>We strive to maintain a 99.9% uptime SLA on our managed cloud instances and cloud SaaS offerings, backed by automated backups, encrypted telemetry, and priority technical support.</p>

<h2>6. Contact & Legal Inquiries</h2>
<p>For questions regarding these Terms & Conditions, contact our legal and support team at <a href="mailto:hello@codeventure.tech">hello@codeventure.tech</a>.</p>`;

const DEFAULT_PRIVACY_TEMPLATE = `<h2>1. Information We Collect</h2>
<p>CodeVenture Tech collects information required to deliver high-performance software and client portal services. This includes account contact details (name, business email, phone/WhatsApp number), billing transaction references (bKash/Nagad Transaction IDs), and project requirements submitted via our order brief portals.</p>

<h2>2. How We Use Your Data</h2>
<p>Your information is utilized solely to provide customized software development, verify billing transactions, provision SaaS infrastructure, communicate milestone progress, and provide SLA technical support. We never sell, rent, or trade your personal or business data to third parties.</p>

<h2>3. Data Protection & Security Architecture</h2>
<p>We employ enterprise-grade security standards including SSL/TLS encryption for all in-transit communications, Argon2/Bcrypt password hashing, OTP verification for sensitive account actions, and strict role-based access controls across all databases.</p>

<h2>4. Cookies & Analytical Telemetry</h2>
<p>We use essential cookies to maintain secure authentication sessions and lightweight telemetry logs to monitor application performance and protect against malicious cyber attacks.</p>

<h2>5. Your Rights & Data Portability</h2>
<p>You have the right to review, update, or request the deletion of your account data stored on our systems at any time by contacting our engineering team or visiting your profile settings.</p>

<h2>6. Privacy Contact & Inquiries</h2>
<p>If you have any questions or concerns regarding our privacy practices, please contact us at <a href="mailto:hello@codeventure.tech">hello@codeventure.tech</a>.</p>`;

export default function SettingsIndex({ settings }: SettingsIndexProps) {
    const [activeTab, setActiveTab] = useState<'branding' | 'services' | 'contact' | 'payments' | 'whatsapp' | 'trustpilot' | 'social' | 'media' | 'legal' | 'faqs'>('branding');

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

    // Services / Capabilities State
    const [servicesTitle, setServicesTitle] = useState(
        settings?.services_title || 'Tech that talks business. Code that creates impact.'
    );
    const [servicesSubtitle, setServicesSubtitle] = useState(
        settings?.services_subtitle || 'At CodeVenture, we fuse creativity with clean code to craft digital experiences that move fast, scale effortlessly, and feel fresh.'
    );

    const parseInitialServices = (): ServiceCapabilityItem[] => {
        try {
            if (settings?.services_json) {
                const parsed = JSON.parse(settings.services_json);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            // fallback to default
        }
        return DEFAULT_SERVICES;
    };

    const [servicesList, setServicesList] = useState<ServiceCapabilityItem[]>(parseInitialServices);

    const handleAddService = () => {
        const nextNum = String(servicesList.length + 1).padStart(2, '0');
        setServicesList((prev) => [
            ...prev,
            {
                number: nextNum,
                icon: 'Cpu',
                title: 'New Service Capability',
                description: 'Describe the engineering capabilities and business impact of this service...',
                tags: ['Full Stack', 'Cloud Architecture'],
                link: '/custom-orders/request',
                gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
            }
        ]);
    };

    const handleUpdateService = (index: number, field: keyof ServiceCapabilityItem, value: any) => {
        setServicesList((prev) => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };

    const handleRemoveService = (index: number) => {
        setServicesList((prev) => prev.filter((_, i) => i !== index));
    };

    const handleMoveService = (index: number, direction: 'up' | 'down') => {
        setServicesList((prev) => {
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= prev.length) return prev;
            const copy = [...prev];
            const temp = copy[index];
            copy[index] = copy[targetIndex];
            copy[targetIndex] = temp;
            return copy;
        });
    };

    const handleResetServices = () => {
        setServicesList(DEFAULT_SERVICES);
        setServicesTitle('Tech that talks business. Code that creates impact.');
        setServicesSubtitle('At CodeVenture, we fuse creativity with clean code to craft digital experiences that move fast, scale effortlessly, and feel fresh.');
        showToast('Reset to default agency service capabilities.', 'info');
    };

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
    const [termsContent, setTermsContent] = useState(settings?.terms_and_conditions || DEFAULT_TERMS_TEMPLATE);
    const [privacyContent, setPrivacyContent] = useState(settings?.privacy_policy || DEFAULT_PRIVACY_TEMPLATE);

    // FAQs State
    const parseInitialFaqs = (): Array<{ q: string; a: string }> => {
        try {
            if (settings?.faqs_json) {
                const parsed = JSON.parse(settings.faqs_json);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            // fallback to defaults
        }
        return DEFAULT_FAQS;
    };

    const [faqsList, setFaqsList] = useState<Array<{ q: string; a: string }>>(parseInitialFaqs);

    const handleAddFaq = () => {
        setFaqsList((prev) => [
            ...prev,
            { q: '', a: '' }
        ]);
    };

    const handleUpdateFaq = (index: number, field: 'q' | 'a', value: string) => {
        setFaqsList((prev) => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };

    const handleRemoveFaq = (index: number) => {
        setFaqsList((prev) => prev.filter((_, i) => i !== index));
    };

    const handleMoveFaq = (index: number, direction: 'up' | 'down') => {
        setFaqsList((prev) => {
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= prev.length) return prev;
            const copy = [...prev];
            const temp = copy[index];
            copy[index] = copy[targetIndex];
            copy[targetIndex] = temp;
            return copy;
        });
    };

    const handleResetFaqs = () => {
        setFaqsList(DEFAULT_FAQS);
        showToast('Reset to default agency FAQs.', 'info');
    };

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

        // Services / Capabilities Cards
        formData.append('services_title', servicesTitle);
        formData.append('services_subtitle', servicesSubtitle);
        formData.append('services_json', JSON.stringify(servicesList));

        // Contact
        formData.append('contact_email', contactEmail);
        formData.append('contact_phone', contactPhone);
        formData.append('address_line1', addressLine1);
        formData.append('address_line2', addressLine2);
        formData.append('google_map_embed_url', googleMapEmbedUrl);

        // Payment
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

        // Media & Legal & FAQs
        formData.append('featured_youtube_video', featuredVideo);
        formData.append('terms_and_conditions', termsContent);
        formData.append('privacy_policy', privacyContent);
        formData.append('faqs_json', JSON.stringify(faqsList.filter(f => f.q.trim() || f.a.trim())));

        router.post('/admin/settings', formData, {
            preserveScroll: true,
            onFinish: () => setIsSaving(false),
            onSuccess: () => showToast('All application settings saved successfully.', 'success'),
        });
    };

    const tabs = [
        { id: 'branding', label: 'Branding & Logos', icon: ImageIcon },
        { id: 'services', label: 'What We Build (Services)', icon: Layers },
        { id: 'payments', label: 'bKash & Nagad Payments', icon: CreditCard },
        { id: 'contact', label: 'Contact & Location', icon: MapPin },
        { id: 'faqs', label: 'FAQs & Questions', icon: HelpCircle },
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
            <div className="space-y-6 w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Website & App Configuration
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Update brand logos, dynamic capability cards, WhatsApp integration, and rich legal documents.
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
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-start relative">
                    {/* Left Vertical Tab Bar (Fixed/Sticky in position while right pane scrolls) */}
                    <div className="w-full md:w-64 lg:w-72 shrink-0 p-4 space-y-1 md:sticky md:top-0 md:self-start md:max-h-[calc(100vh-8rem)] md:overflow-y-auto custom-sidebar-scroll md:rounded-tr-none z-10">
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
                    <div className="flex-1 min-w-0 p-6 sm:p-8 lg:p-10">
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

                            {/* TAB 2: WHAT WE BUILD (DYNAMIC SERVICES / CAPABILITIES) */}
                            {activeTab === 'services' && (
                                <div className="space-y-6 animate-in fade-in">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                                What We Build / Services & Capabilities
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Manage headline, subtitle, and dynamic capability cards shown on the landing page.
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                type="button"
                                                onClick={handleResetServices}
                                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                                            >
                                                <RotateCcw className="h-3.5 w-3.5" />
                                                <span>Reset Defaults</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleAddService}
                                                className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                <span>Add Capability Card</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Section Headline & Subtitle */}
                                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
                                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            Section Header & Tagline
                                        </h4>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Section Headline (e.g. "Tech that talks business. Code that creates impact.")
                                            </label>
                                            <input
                                                type="text"
                                                value={servicesTitle}
                                                onChange={(e) => setServicesTitle(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                                            />
                                            <p className="text-[11px] text-slate-400">
                                                Tip: Any sentence following a period will automatically receive radiant cyan gradient styling on the landing page.
                                            </p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Section Subtitle / Description
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={servicesSubtitle}
                                                onChange={(e) => setServicesSubtitle(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                                            />
                                        </div>
                                    </div>

                                    {/* Capability Cards List */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                                Capabilities Cards List ({servicesList.length})
                                            </h4>
                                        </div>

                                        {servicesList.length === 0 ? (
                                            <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                                                <Layers className="h-10 w-10 text-slate-400 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    No capability cards defined.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={handleResetServices}
                                                    className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700"
                                                >
                                                    Restore 8 Default Cards
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {servicesList.map((service, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm relative group"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2.5">
                                                                <span className="font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 text-xs font-bold">
                                                                    {service.number || `0${index + 1}`}
                                                                </span>
                                                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                                    {service.title || `Capability #${index + 1}`}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center space-x-1">
                                                                <button
                                                                    type="button"
                                                                    disabled={index === 0}
                                                                    onClick={() => handleMoveService(index, 'up')}
                                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 transition-colors"
                                                                    title="Move Up"
                                                                >
                                                                    <ArrowUp className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    disabled={index === servicesList.length - 1}
                                                                    onClick={() => handleMoveService(index, 'down')}
                                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 transition-colors"
                                                                    title="Move Down"
                                                                >
                                                                    <ArrowDown className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveService(index)}
                                                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors ml-2"
                                                                    title="Delete Capability"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                            <div className="space-y-1">
                                                                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                                                    Card Index Number
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={service.number}
                                                                    onChange={(e) => handleUpdateService(index, 'number', e.target.value)}
                                                                    placeholder="01"
                                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono"
                                                                />
                                                            </div>

                                                            <div className="space-y-1">
                                                                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                                                    Icon
                                                                </label>
                                                                <select
                                                                    value={service.icon}
                                                                    onChange={(e) => handleUpdateService(index, 'icon', e.target.value)}
                                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
                                                                >
                                                                    {AVAILABLE_ICONS.map((iconName) => (
                                                                        <option key={iconName} value={iconName}>
                                                                            {iconName}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                                                    Gradient Preset
                                                                </label>
                                                                <select
                                                                    value={service.gradient || GRADIENT_PRESETS[0].value}
                                                                    onChange={(e) => handleUpdateService(index, 'gradient', e.target.value)}
                                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
                                                                >
                                                                    {GRADIENT_PRESETS.map((p) => (
                                                                        <option key={p.value} value={p.value}>
                                                                            {p.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            <div className="space-y-1">
                                                                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                                                    Service Title
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={service.title}
                                                                    onChange={(e) => handleUpdateService(index, 'title', e.target.value)}
                                                                    placeholder="e.g. Machine Learning"
                                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
                                                                />
                                                            </div>

                                                            <div className="space-y-1">
                                                                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                                                    Destination Link (Default: /custom-orders/request)
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={service.link || '/custom-orders/request'}
                                                                    onChange={(e) => handleUpdateService(index, 'link', e.target.value)}
                                                                    placeholder="/custom-orders/request"
                                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                                                Description
                                                            </label>
                                                            <textarea
                                                                rows={2}
                                                                value={service.description}
                                                                onChange={(e) => handleUpdateService(index, 'description', e.target.value)}
                                                                placeholder="Service summary..."
                                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs leading-relaxed"
                                                            />
                                                        </div>

                                                        <div className="space-y-1">
                                                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                                                Technical Tags (Comma-separated)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={Array.isArray(service.tags) ? service.tags.join(', ') : service.tags}
                                                                onChange={(e) => {
                                                                    const tagsArr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                                                    handleUpdateService(index, 'tags', tagsArr);
                                                                }}
                                                                placeholder="e.g. Predictive AI, Adaptive Models, Strategic Foresight"
                                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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

                            {/* TAB: FAQS & QUESTIONS */}
                            {activeTab === 'faqs' && (
                                <div className="space-y-6 animate-in fade-in">
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                                Frequently Asked Questions (FAQ)
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Manage questions and answers displayed dynamically across the landing page and SaaS pages.
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                type="button"
                                                onClick={handleResetFaqs}
                                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                                            >
                                                Reset Defaults
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleAddFaq}
                                                className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                <span>Add FAQ</span>
                                            </button>
                                        </div>
                                    </div>

                                    {faqsList.length === 0 ? (
                                        <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                                            <HelpCircle className="h-10 w-10 text-slate-400 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                No FAQs configured yet.
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Click "Add FAQ" or "Reset Defaults" to seed standard agency questions.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={handleAddFaq}
                                                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700 transition-all"
                                            >
                                                + Add First FAQ
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {faqsList.map((faq, index) => (
                                                <div
                                                    key={index}
                                                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm relative group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="inline-flex items-center space-x-2">
                                                            <span className="h-6 w-6 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 text-xs font-bold flex items-center justify-center">
                                                                {index + 1}
                                                            </span>
                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                                FAQ Item #{index + 1}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center space-x-1">
                                                            <button
                                                                type="button"
                                                                disabled={index === 0}
                                                                onClick={() => handleMoveFaq(index, 'up')}
                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 transition-colors"
                                                                title="Move Up"
                                                            >
                                                                <ArrowUp className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={index === faqsList.length - 1}
                                                                onClick={() => handleMoveFaq(index, 'down')}
                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 transition-colors"
                                                                title="Move Down"
                                                            >
                                                                <ArrowDown className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveFaq(index)}
                                                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors ml-2"
                                                                title="Delete FAQ"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                            Question
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={faq.q}
                                                            onChange={(e) => handleUpdateFaq(index, 'q', e.target.value)}
                                                            placeholder="e.g. How does milestone delivery work?"
                                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                            Answer
                                                        </label>
                                                        <textarea
                                                            rows={3}
                                                            value={faq.a}
                                                            onChange={(e) => handleUpdateFaq(index, 'a', e.target.value)}
                                                            placeholder="Detailed explanation answering the customer inquiry..."
                                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 leading-relaxed focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB: LEGAL PAGES (RICH TEXT & COMPLIANCE) */}
                            {activeTab === 'legal' && (
                                <div className="space-y-8 animate-in fade-in">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                                Legal Compliance & Policy Documents
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Edit Terms & Conditions and Privacy Policy using the visual Rich Text Editor.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Terms & Conditions Rich Editor */}
                                    <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                    Terms & Conditions Document
                                                </h4>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    Public page accessible at: <span className="font-mono text-indigo-500">/terms-and-conditions</span>
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setTermsContent(DEFAULT_TERMS_TEMPLATE);
                                                    showToast('Standard Terms & Conditions template loaded.', 'info');
                                                }}
                                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                                <span>Load Standard Template</span>
                                            </button>
                                        </div>

                                        <RichTextEditor
                                            value={termsContent}
                                            onChange={setTermsContent}
                                            placeholder="Compose your agency terms and conditions..."
                                            minHeight="350px"
                                        />
                                    </div>

                                    {/* Privacy Policy Rich Editor */}
                                    <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                    Privacy Policy Document
                                                </h4>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    Public page accessible at: <span className="font-mono text-indigo-500">/privacy-policy</span>
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPrivacyContent(DEFAULT_PRIVACY_TEMPLATE);
                                                    showToast('Standard Privacy Policy template loaded.', 'info');
                                                }}
                                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                                <span>Load Standard Template</span>
                                            </button>
                                        </div>

                                        <RichTextEditor
                                            value={privacyContent}
                                            onChange={setPrivacyContent}
                                            placeholder="Compose your data privacy policy..."
                                            minHeight="350px"
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
