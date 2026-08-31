import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Blog, Category, Portfolio, Review, SaasProduct, TeamMember, SharedData, ServiceCapabilityItem } from '@/types';
import { SurfaceLayout } from '@/layouts/surface-layout';
import { SurfaceHero } from '@/components/surface/hero_section';
import { WorksGrid } from '@/components/surface/works-grid';
import { TrustpilotCarousel } from '@/components/surface/trustpilot-carousel';
import { YouTubeModal } from '@/components/surface/youtube-modal';
import { PipelineFlowSection } from '@/components/surface/pipeline-flow-section';
import {
    Sparkles,
    ArrowRight,
    CheckCircle2,
    Code2,
    Cpu,
    Brain,
    Radio,
    CircuitBoard,
    ShoppingCart,
    Smartphone,
    Palette,
    TrendingUp,
    Zap,
    Database,
    Layout,
    Globe,
    Layers,
    Rocket,
    Award,
    BookOpen,
    Eye,
    Calendar,
    ArrowUpRight,
    HelpCircle,
    ChevronDown
} from 'lucide-react';

interface HomePageProps {
    categories: Category[];
    portfolios: Portfolio[];
    blogs?: Blog[];
    saasProducts?: SaasProduct[];
    reviews: Review[];
    teamMembers: TeamMember[];
    stats: {
        projects_delivered: number;
        client_satisfaction: string;
        trustpilot_score: string;
        total_reviews: string;
        years_experience: string;
    };
}

export default function Home({
    categories,
    portfolios,
    blogs = [],
    saasProducts = [],
    reviews,
    stats,
}: HomePageProps) {
    const { app_settings } = usePage<SharedData>().props;
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

    const defaultFaqs = [
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

    let faqs = defaultFaqs;
    if (app_settings?.faqs_json) {
        try {
            const parsed = JSON.parse(app_settings.faqs_json);
            if (Array.isArray(parsed) && parsed.length > 0) {
                faqs = parsed;
            }
        } catch (e) {
            console.log(e);
        }
    }

    const featuredVideo = app_settings?.featured_youtube_video || 'https://www.youtube.com/watch?v=LXb3EKWsInQ';
    const currency = app_settings?.currency_symbol || '৳';

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

    const ICON_MAP: Record<string, React.ElementType> = {
        Brain,
        Cpu,
        Radio,
        CircuitBoard,
        ShoppingCart,
        Smartphone,
        Palette,
        TrendingUp,
        Code2,
        Database,
        Layout,
        Globe,
        Zap,
        Rocket,
        Award,
        ShieldCheck: CheckCircle2,
        Layers,
        Sparkles,
    };

    let services: ServiceCapabilityItem[] = DEFAULT_SERVICES;
    if (app_settings?.services_json) {
        try {
            const parsed = JSON.parse(app_settings.services_json);
            if (Array.isArray(parsed) && parsed.length > 0) {
                services = parsed;
            }
        } catch (e) {
            console.error('Failed to parse dynamic services:', e);
        }
    }

    const servicesTitle = app_settings?.services_title || 'Tech that talks business. Code that creates impact.';
    const servicesSubtitle = app_settings?.services_subtitle || 'At CodeVenture, we fuse creativity with clean code to craft digital experiences that move fast, scale effortlessly, and feel fresh.';

    const techStackTicker = [
        'Laravel 12 (PHP 8.4)',
        'React 19 + Inertia.js',
        'TypeScript Architecture',
        'Tailwind CSS v4',
        'Next.js & Vite Dev',
        'PostgreSQL & Redis',
        'Docker & Kubernetes',
        'AI & LLM Streaming Agents',
        'Sub-Second Core Web Vitals',
        'AWS & Cloudflare CDN',
        'bKash & Nagad OTP Billing',
        'SOC2 Compliant Architecture',
    ];

    return (
        <SurfaceLayout
            title="Modern Web Development Agency"
            description="CodeVenture Tech builds high performance SaaS web applications, AI platforms, and bespoke digital experiences for global leaders."
        >
            {/* INTERACTIVE CANVAS SCROLL HERO SECTION (Header is preserved untouched in layout) */}
            <SurfaceHero
                settings={app_settings}
                stats={stats}
                onOpenVideo={() => setIsVideoOpen(true)}
            />

            {/* SIGNATURE TECH STACK MARQUEE TICKER (CodeVenture Design Signature) */}
            <div className="relative z-20 py-6 bg-slate-50 dark:bg-[#010e16] overflow-hidden cv-marquee-mask shadow-xl">
                <div className="cv-marquee-track flex items-center space-x-4">
                    {[...techStackTicker, ...techStackTicker].map((item, idx) => (
                        <div
                            key={idx}
                            className="flex-shrink-0 inline-flex items-center space-x-2.5 px-4 py-2 rounded-xl bg-white/80 dark:bg-[#01121e]/90 border border-slate-200/80 dark:border-cyan-500/20 shadow-sm"
                        >
                            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                                {item}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* WHAT WE BUILD / CORE CAPABILITIES (Matching codeventuretechnologies.com design) */}
            <section id="what-we-build" className="py-28 relative w-full overflow-hidden">
                {/* Ambient background lighting */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20" data-aos="fade-up">
                        <div className="cv-badge mb-4" data-aos="zoom-in">
                            <Layers className="h-3.5 w-3.5 text-cyan-400" />
                            <span>Core Engineering Capabilities</span>
                        </div>
                        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                            {servicesTitle.includes('.') ? (
                                <>
                                    {servicesTitle.split('.')[0]}.{' '}
                                    <span className="cv-gradient-text block sm:inline">
                                        {servicesTitle.split('.').slice(1).join('.').trim()}
                                    </span>
                                </>
                            ) : (
                                <span className="cv-gradient-text">{servicesTitle}</span>
                            )}
                        </h2>
                        <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
                            {servicesSubtitle}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service, index) => {
                            const IconComponent = ICON_MAP[service.icon] || Code2;
                            const gradient = service.gradient || 'from-cyan-500 via-blue-500 to-indigo-600';
                            const targetLink = service.link || '/custom-orders/request';

                            return (
                                <div
                                    key={index}
                                    data-aos="fade-up"
                                    data-aos-delay={`${(index % 3) * 100}`}
                                    className="cv-card cv-service-card rounded-3xl p-7 flex flex-col justify-between group cursor-default transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2"
                                >
                                    <div>
                                        {/* Card Top: Gradient Icon + Monospace Index Number */}
                                        <div className="flex items-center justify-between mb-6">
                                            <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                                                <IconComponent className="h-6 w-6" />
                                            </div>
                                            <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#01121e] border border-slate-200/60 dark:border-cyan-500/15 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
                                                {service.number || `0${index + 1}`}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                            {service.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {service.description}
                                        </p>
                                    </div>

                                    {/* Bottom: Technical Tag Chips + Interactive Action */}
                                    <div className="mt-6 pt-5 border-t border-slate-100 dark:border-cyan-500/10 space-y-4">
                                        {service.tags && service.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {service.tags.map((tag, tIdx) => (
                                                    <span
                                                        key={tIdx}
                                                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#01121e] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-cyan-500/15 group-hover:border-cyan-500/30 transition-colors"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <Link
                                            href={targetLink}
                                            className="inline-flex items-center text-xs font-bold text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform"
                                        >
                                            <span>Venture Beyond</span>
                                            <ArrowUpRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ON-DEMAND ARCHITECTURE & CONNECTED CIRCUIT PIPELINE SECTION */}
            <PipelineFlowSection />

            {/* FEATURED SAAS PRODUCTS SHOWCASE SECTION */}
            {saasProducts && saasProducts.length > 0 && (
                <section className="py-24 bg-slate-50/60 dark:bg-[#010e16]/60 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16" data-aos="fade-up">
                            <div className="space-y-2">
                                <div className="cv-badge">
                                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                                    <span>Turnkey SaaS Subscriptions</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                                    Enterprise SaaS Products Ready to Deploy
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                                    Pre-engineered cloud platforms ready for instant launch with custom domain mapping, dedicated databases, and bKash/Nagad billing.
                                </p>
                            </div>

                            <Link
                                href="/saas-products"
                                className="cv-btn-secondary self-start sm:self-auto group"
                            >
                                <span>View All SaaS Plans</span>
                                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {saasProducts.map((product, pIdx) => (
                                <div
                                    key={product.id}
                                    data-aos="fade-up"
                                    data-aos-delay={`${(pIdx % 4) * 100}`}
                                    className={`cv-card rounded-3xl flex flex-col justify-between overflow-hidden group ${
                                        product.is_featured
                                            ? 'border-cyan-500/50 shadow-cyan-500/10'
                                            : ''
                                    }`}
                                >
                                    {/* Thumbnail Image */}
                                    {product.thumbnail && (
                                        <Link href={`/saas-products/${product.slug}`} className="block relative aspect-video w-full overflow-hidden bg-slate-950">
                                            <img
                                                src={product.thumbnail}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                            />
                                            {product.badge && (
                                                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[9px] uppercase shadow-sm">
                                                    {product.badge}
                                                </div>
                                            )}
                                        </Link>
                                    )}

                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                {!product.thumbnail && product.badge && (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 font-bold text-[10px]">
                                                        {product.badge}
                                                    </span>
                                                )}
                                                <div className="text-sm font-black text-cyan-600 dark:text-cyan-400 ml-auto font-mono">
                                                    {currency}{Number(product.monthly_price).toLocaleString('en-US')}<span className="text-[10px] text-slate-400 font-normal">/mo</span>
                                                </div>
                                            </div>

                                            <Link href={`/saas-products/${product.slug}`}>
                                                <h3 className="text-base font-bold tracking-tight mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                                    {product.name}
                                                </h3>
                                            </Link>

                                            <p className="text-xs line-clamp-2 leading-relaxed mb-4 text-slate-600 dark:text-slate-400">
                                                {product.tagline || product.description}
                                            </p>

                                            {Array.isArray(product.features) && (
                                                <div className="space-y-1.5 mb-6">
                                                    {product.features.slice(0, 3).map((feat, fI) => (
                                                        <div key={fI} className="flex items-center space-x-2 text-[11px]">
                                                            <CheckCircle2 className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                                                            <span className="truncate">{feat}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-2 flex items-center space-x-2">
                                            <Link
                                                href={`/saas-products/${product.slug}`}
                                                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-bold text-center transition-all flex items-center justify-center space-x-1.5 shadow-sm"
                                            >
                                                <span>View Packages</span>
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* WORKS / PRODUCTS SHOWCASE (3x5 Grid, Max 15 Items) */}
            <WorksGrid
                portfolios={portfolios}
                categories={categories}
                showViewAll={true}
                title="Featured Products & Digital Portfolios"
                subtitle="Explore direct-link and deep in-app case studies of scalable web applications crafted by CodeVenture."
            />

            {/* WHY CHOOSE US / THE CODEVENTURE ADVANTAGE */}
            <section className="py-24 bg-[#010e16] text-white relative overflow-hidden">
                {/* Background lighting */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6" data-aos="fade-right">
                            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold">
                                <Award className="h-4 w-4" />
                                <span>The CodeVenture Standard</span>
                            </div>
                            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                                Why Visionary Founders Partner With Us
                            </h2>
                            <p className="text-base text-slate-300 leading-relaxed">
                                We combine rigorous software engineering practices with cutting-edge UI design aesthetics to build platforms that win in competitive markets.
                            </p>

                            <div className="space-y-4 pt-2">
                                {[
                                    'Sub-Second Page Loads & 99+ Core Web Vitals Guaranteed',
                                    'Modern Stack: Laravel 12, Inertia.js, React 19, Tailwind CSS v4',
                                    'Clean, Modular, Fully-Documented Codebases Ready for Enterprise Audit',
                                    'Continuous Delivery, Automated CI/CD & 24/7 Monitoring Retainers',
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center space-x-3">
                                        <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0" />
                                        <span className="text-sm font-medium text-slate-200">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4">
                                <Link
                                    href="/contact"
                                    className="cv-btn-primary"
                                >
                                    <span>Schedule a Technical Discovery Call</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Interactive Code / Architecture Card */}
                        <div className="rounded-3xl bg-[#01121e] border border-cyan-500/20 p-6 sm:p-8 shadow-2xl space-y-4 shadow-cyan-500/5" data-aos="fade-left">
                            <div className="flex items-center justify-between pb-4 border-b border-cyan-500/10">
                                <div className="flex items-center space-x-2">
                                    <span className="h-3 w-3 rounded-full bg-red-500/80" />
                                    <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                                    <span className="h-3 w-3 rounded-full bg-cyan-500/80" />
                                </div>
                                <span className="text-xs font-mono text-cyan-400/70">CodeVentureEngine.ts</span>
                            </div>

                            <pre className="font-mono text-xs sm:text-sm text-cyan-300 leading-relaxed overflow-x-auto p-2">
                                {`// Enterprise Architecture Blueprint
export async function bootstrapPlatform(config: AppConfig) {
  const stack = {
    backend: 'Laravel 12 (PHP 8.4)',
    client: 'React 19 + Inertia.js',
    styling: 'Tailwind CSS v4 + Shadcn UI',
    database: 'PostgreSQL + Redis Telemetry',
    security: 'AES-256 OTP Guards + Turnstile'
  };

  await stack.deployToProduction({
    reliability: '99.99%',
    performanceScore: 100
  });

  return 'Ready for Global Scale 🚀';
}`}
                            </pre>
                        </div>
                    </div>
                </div>
            </section>

            {/* LATEST INSIGHTS & BLOGS SECTION - 12 ARTICLES SHOWCASE */}
            {blogs && blogs.length > 0 && (
                <section className="py-24 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12" data-aos="fade-up">
                            <div className="space-y-2">
                                <div className="cv-badge">
                                    <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
                                    <span>Knowledge Hub</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                                    Latest Engineering Insights & Articles
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                                    Deep architectural analyses, production benchmarks, and software engineering best practices from our architects.
                                </p>
                            </div>

                            <Link
                                href="/blogs"
                                className="cv-btn-secondary self-start sm:self-auto group"
                            >
                                <span>Browse All Articles</span>
                                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Link>
                        </div>

                        {/* 12-Item Responsive Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {blogs.map((blog, idx) => (
                                <article
                                    key={blog.id}
                                    data-aos="fade-up"
                                    data-aos-delay={`${(idx % 4) * 80}`}
                                    className="cv-card group flex flex-col rounded-3xl overflow-hidden"
                                >
                                    <Link
                                        href={`/blogs/${blog.slug}`}
                                        className="relative aspect-[16/10] overflow-hidden bg-slate-950 block"
                                    >
                                        {blog.thumbnail ? (
                                            <img
                                                src={blog.thumbnail}
                                                alt={blog.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-tr from-slate-950 to-[#01121e] flex items-center justify-center">
                                                <BookOpen className="h-10 w-10 text-cyan-400/40" />
                                            </div>
                                        )}

                                        {blog.category && (
                                            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold tracking-wide">
                                                {blog.category.name}
                                            </div>
                                        )}

                                        <div className="absolute bottom-3 right-3 inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md border border-white/10 text-cyan-400 font-mono text-[10px] font-bold">
                                            <Eye className="h-2.5 w-2.5 text-cyan-400" />
                                            <span>{(blog.reads_count || 0).toLocaleString()}</span>
                                        </div>
                                    </Link>

                                    <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
                                                <Calendar className="h-3 w-3 text-cyan-500" />
                                                <span>
                                                    {blog.published_at
                                                        ? new Date(blog.published_at).toLocaleDateString(undefined, {
                                                              month: 'short',
                                                              day: 'numeric',
                                                              year: 'numeric',
                                                          })
                                                        : 'Recently'}
                                                </span>
                                            </div>

                                            <Link href={`/blogs/${blog.slug}`}>
                                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
                                                    {blog.title}
                                                </h3>
                                            </Link>

                                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                {blog.short_description}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-slate-100 dark:border-cyan-500/10 flex items-center justify-between">
                                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                                                {blog.author_name || 'CodeVenture Lead'}
                                            </span>
                                            <Link
                                                href={`/blogs/${blog.slug}`}
                                                className="inline-flex items-center space-x-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform"
                                            >
                                                <span>Read</span>
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Bottom CTA Banner with All Blogs Link */}
                        <div className="mt-12 p-6 sm:p-8 rounded-3xl cv-card flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left" data-aos="fade-up">
                            <div className="space-y-1">
                                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                    Want to explore more architectural guides & tutorials?
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Explore topics on React 19, AI Agents, Cloud DevOps, Distributed Databases, and UI Choreography.
                                </p>
                            </div>

                            <Link
                                href="/blogs"
                                className="cv-btn-primary flex-shrink-0 text-xs"
                            >
                                <span>View All Blog Articles</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* TRUSTPILOT REVIEWS SWIPER CAROUSEL */}
            <TrustpilotCarousel reviews={reviews} settings={app_settings} />

            {/* DYNAMIC FREQUENTLY ASKED QUESTIONS */}
            {faqs.length > 0 && (
                <section id="faq" className="py-24 relative overflow-hidden">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
                            <div className="cv-badge mb-3.5">
                                <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
                                <span>Answers & Knowledge</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                                Frequently Asked Questions
                            </h2>
                            <p className="mt-3.5 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                                Everything you need to know about our engineering process, pricing, delivery milestones, and SLA guarantees.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, idx) => {
                                const isOpen = openFaqIndex === idx;
                                return (
                                    <div
                                        key={idx}
                                        data-aos="fade-up"
                                        data-aos-delay={`${(idx % 5) * 60}`}
                                        className={`cv-card rounded-2xl transition-all duration-300 overflow-hidden ${
                                            isOpen
                                                ? 'border-cyan-500/50 dark:border-cyan-400/60 shadow-lg'
                                                : ''
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                            className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                                        >
                                            <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                                                {faq.q}
                                            </span>
                                            <div className={`p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400' : ''}`}>
                                                <ChevronDown className="h-4 w-4" />
                                            </div>
                                        </button>

                                        {isOpen && (
                                            <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-cyan-500/10 animate-in fade-in">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* FAST CALL TO ACTION BANNER */}
            <section className="py-20 relative overflow-hidden bg-gradient-to-r from-[#01121e] via-[#010e16] to-[#010a10] text-white">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(19,155,253,0.15),transparent_70%)] pointer-events-none" />
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
                    <Rocket className="h-12 w-12 text-cyan-400 mx-auto animate-bounce" />
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                        Have a Project in Mind? Let's Turn Your Vision Into Code.
                    </h2>
                    <p className="text-base text-slate-300 max-w-2xl mx-auto">
                        Connect directly with our architects for a technical estimate, architecture review, and roadmap delivery within 24 hours.
                    </p>
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/contact"
                            className="cv-btn-primary"
                        >
                            Start Your Project Today
                        </Link>
                        <Link
                            href="/works"
                            className="cv-btn-secondary"
                        >
                            Browse All Case Studies
                        </Link>
                    </div>
                </div>
            </section>

            {/* YouTube Video Modal Player */}
            <YouTubeModal
                videoUrl={featuredVideo}
                isOpen={isVideoOpen}
                onClose={() => setIsVideoOpen(false)}
            />
        </SurfaceLayout>
    );
}
