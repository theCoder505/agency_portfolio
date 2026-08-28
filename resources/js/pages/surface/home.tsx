import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Blog, Category, Portfolio, Review, SaasProduct, TeamMember, SharedData } from '@/types';
import { SurfaceLayout } from '@/layouts/surface-layout';
import { SurfaceHero } from '@/components/surface/hero_section';
import { WorksGrid } from '@/components/surface/works-grid';
import { TrustpilotCarousel } from '@/components/surface/trustpilot-carousel';
import { YouTubeModal } from '@/components/surface/youtube-modal';
import {
    Sparkles,
    ArrowRight,
    Play,
    CheckCircle2,
    Code2,
    Cpu,
    Zap,
    Shield,
    Database,
    Layout,
    Globe,
    Layers,
    Rocket,
    Users,
    Star,
    Award,
    BookOpen,
    Eye,
    Clock,
    Calendar,
    ArrowUpRight
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
    teamMembers,
    stats,
}: HomePageProps) {
    const { app_settings } = usePage<SharedData>().props;
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    const featuredVideo = app_settings?.featured_youtube_video || 'https://www.youtube.com/watch?v=LXb3EKWsInQ';
    const currency = app_settings?.currency_symbol || '৳';

    const services = [
        {
            icon: Code2,
            title: 'SaaS Platform Engineering',
            description: 'Multi-tenant, high-throughput web applications with robust billing, real-time analytics, and role-based permissions.',
            gradient: 'from-blue-500 to-indigo-600',
        },
        {
            icon: Cpu,
            title: 'AI & Intelligent Workspaces',
            description: 'Integrating generative AI, LLM streaming agents, semantic vector databases, and custom workflow canvases.',
            gradient: 'from-purple-500 to-pink-600',
        },
        {
            icon: Globe,
            title: 'Headless E-Commerce Solutions',
            description: 'Sub-second page load times, 3D interactive product configurators, and global multi-currency checkout experiences.',
            gradient: 'from-amber-500 to-orange-600',
        },
        {
            icon: Layout,
            title: 'Interactive Web & 3D Experiences',
            description: 'Award-winning digital experiences featuring Three.js 3D animations, custom shader effects, and smooth scroll interactions.',
            gradient: 'from-teal-500 to-emerald-600',
        },
        {
            icon: Database,
            title: 'Enterprise Portals & Cloud ERP',
            description: 'Secure, HIPAA/SOC2 compliant internal management systems, telemetry dashboards, and automated business workflows.',
            gradient: 'from-cyan-500 to-blue-600',
        },
        {
            icon: Zap,
            title: 'Cloud DevOps & API Architecture',
            description: 'Automated CI/CD pipelines, Kubernetes containerization, Redis caching layers, and high-availability serverless setups.',
            gradient: 'from-red-500 to-rose-600',
        },
    ];

    return (
        <SurfaceLayout
            title="Modern Web Development Agency"
            description="CodeVenture Tech builds high performance SaaS web applications, AI platforms, and bespoke digital experiences for global leaders."
        >
            {/* INTERACTIVE CANVAS SCROLL HERO SECTION */}
            <SurfaceHero
                settings={app_settings}
                stats={stats}
                onOpenVideo={() => setIsVideoOpen(true)}
            />

            {/* SERVICES SECTION */}
            <section id="what-we-build" className="py-24 bg-slate-50/70 dark:bg-slate-950/40 relative w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
                        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20 text-xs font-bold mb-3">
                            <Layers className="h-3.5 w-3.5" />
                            <span>Core Engineering Capabilities</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                            What We Build
                        </h2>
                        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                            Enterprise-grade full stack technologies designed for extreme speed, reliability, and market leadership.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, index) => {
                            const IconComponent = service.icon;
                            return (
                                <div
                                    key={index}
                                    data-aos="fade-up"
                                    data-aos-delay={`${(index % 3) * 100}`}
                                    className="group relative rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 p-8 shadow-sm hover:shadow-xl hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${service.gradient} flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                                        <IconComponent className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                        {service.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {service.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* FEATURED SAAS PRODUCTS SHOWCASE SECTION */}
            {saasProducts && saasProducts.length > 0 && (
                <section className="py-24 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800/80 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16" data-aos="fade-up">
                            <div className="space-y-2">
                                <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20 text-xs font-bold">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>Turnkey SaaS Subscriptions</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                                    Enterprise SaaS Products Ready to Deploy
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                                    Pre-engineered cloud platforms ready for instant launch with custom domain mapping, dedicated databases, and bKash/Nagad billing.
                                </p>
                            </div>

                            <Link
                                href="/saas-products"
                                className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:shadow-xl transition-all self-start sm:self-auto group"
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
                                    className={`relative flex flex-col justify-between rounded-3xl p-6 border transition-all duration-300 ${
                                        product.is_featured
                                            ? 'bg-slate-950 text-white border-indigo-500/80 shadow-xl shadow-indigo-500/15'
                                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm hover:shadow-lg hover:border-indigo-500/40'
                                    }`}
                                >
                                    {product.badge && (
                                        <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-black text-[10px] uppercase shadow-sm">
                                            {product.badge}
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                                                <Layers className="h-5 w-5" />
                                            </div>
                                            <span className="text-xs font-black text-indigo-600 dark:text-cyan-400">
                                                {currency}{product.monthly_price.toLocaleString()}<span className="text-[10px] text-slate-400 font-normal">/mo</span>
                                            </span>
                                        </div>

                                        <h3 className="text-base font-bold tracking-tight mb-1">
                                            {product.name}
                                        </h3>

                                        <p className={`text-xs line-clamp-2 leading-relaxed mb-4 ${
                                            product.is_featured ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
                                        }`}>
                                            {product.tagline || product.description}
                                        </p>

                                        {Array.isArray(product.features) && (
                                            <div className="space-y-1.5 mb-6">
                                                {product.features.slice(0, 3).map((feat, fI) => (
                                                    <div key={fI} className="flex items-center space-x-2 text-[11px]">
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                                        <span className="truncate">{feat}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <Link
                                        href={`/checkout/${product.slug}?billing_cycle=monthly`}
                                        className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-xs font-bold text-center transition-all mt-auto flex items-center justify-center space-x-1.5"
                                    >
                                        <span>Order & Deploy</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
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
                title="Featured Products & Websites (Max 15 Showcase)"
                subtitle="Explore direct-link and deep in-app case studies of scalable web applications crafted by CodeVenture."
            />

            {/* WHY CHOOSE US / AGENCY ADVANTAGE */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6" data-aos="fade-right">
                            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold">
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
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                                        <span className="text-sm font-medium text-slate-200">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4">
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
                                >
                                    <span>Schedule a Technical Discovery Call</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Interactive Code / Architecture Card */}
                        <div className="rounded-3xl bg-slate-950/90 border border-slate-800 p-6 shadow-2xl space-y-4" data-aos="fade-left">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                                <div className="flex items-center space-x-2">
                                    <span className="h-3 w-3 rounded-full bg-red-500"></span>
                                    <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
                                    <span className="h-3 w-3 rounded-full bg-green-500"></span>
                                </div>
                                <span className="text-xs font-mono text-slate-500">CodeVentureEngine.ts</span>
                            </div>

                            <pre className="font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto p-2">
                                {`// Enterprise Architecture Blueprint
export async function bootstrapPlatform(config: AppConfig) {
  const stack = {
    backend: 'Laravel 12 (PHP 8.3)',
    client: 'React 19 + Inertia.js',
    styling: 'Tailwind CSS v4 + Shadcn UI',
    database: 'MySQL + Redis Telemetry',
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
                <section className="py-24 bg-slate-100/60 dark:bg-slate-900/30 border-t border-slate-200/80 dark:border-slate-800/80 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12" data-aos="fade-up">
                            <div className="space-y-2">
                                <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20 text-xs font-bold">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    <span>Knowledge Hub</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                                    Latest Engineering Insights & Articles
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                                    Deep architectural analyses, production benchmarks, and software engineering best practices from our architects.
                                </p>
                            </div>

                            <Link
                                href="/blogs"
                                className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all self-start sm:self-auto group"
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
                                    className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/50 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden"
                                >
                                    <Link
                                        href={`/blogs/${blog.slug}`}
                                        className="relative aspect-[16/10] overflow-hidden bg-slate-950 block"
                                    >
                                        {blog.thumbnail ? (
                                            <img
                                                src={blog.thumbnail}
                                                alt={blog.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-tr from-slate-900 to-indigo-950 flex items-center justify-center">
                                                <BookOpen className="h-10 w-10 text-indigo-400/40" />
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
                                                <Calendar className="h-3 w-3" />
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
                                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
                                                    {blog.title}
                                                </h3>
                                            </Link>

                                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                {blog.short_description}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                                                {blog.author_name || 'CodeVenture Lead'}
                                            </span>
                                            <Link
                                                href={`/blogs/${blog.slug}`}
                                                className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform"
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
                        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left" data-aos="fade-up">
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
                                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-indigo-600 dark:hover:bg-cyan-400 dark:hover:text-slate-950 transition-all shadow-md flex-shrink-0"
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

            {/* FAST CALL TO ACTION BANNER */}
            <section className="py-20 relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-950 text-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                    <Rocket className="h-12 w-12 text-cyan-400 mx-auto animate-bounce" />
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                        Have a Project in Mind? Let's Turn Your Vision Into Code.
                    </h2>
                    <p className="text-base text-slate-300 max-w-2xl mx-auto">
                        Connect directly with our architects for a technical estimate, architecture review, and roadmap delivery within 24 hours.
                    </p>
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/contact"
                            className="px-8 py-4 rounded-2xl bg-white text-slate-950 font-black text-sm shadow-xl hover:bg-slate-100 transition-all hover:scale-105"
                        >
                            Start Your Project Today
                        </Link>
                        <Link
                            href="/works"
                            className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-md transition-all"
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
