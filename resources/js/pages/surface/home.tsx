import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Category, Portfolio, Review, TeamMember, SharedData } from '@/types';
import { SurfaceLayout } from '@/layouts/surface-layout';
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
    Award
} from 'lucide-react';

interface HomePageProps {
    categories: Category[];
    portfolios: Portfolio[];
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
    reviews,
    teamMembers,
    stats,
}: HomePageProps) {
    const { app_settings } = usePage<SharedData>().props;
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    const featuredVideo = app_settings?.featured_youtube_video || 'https://www.youtube.com/watch?v=LXb3EKWsInQ';

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
            {/* HERO SECTION */}
            <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
                {/* Dynamic Ambient Background Glows */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-cyan-500/20 rounded-full blur-[140px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto space-y-8">
                        {/* Top Badge */}
                        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900/5 dark:bg-slate-900/80 border border-indigo-500/30 text-indigo-600 dark:text-cyan-400 text-xs font-extrabold uppercase tracking-wider shadow-inner">
                            <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
                            <span>Premier Web Development & SaaS Engineering Agency</span>
                        </div>

                        {/* Main Title */}
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                            We Build <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400">High-Performance</span> Web Platforms That Scale.
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                            Transforming complex vision into pristine, ultra-responsive digital software. From multi-tenant SaaS to interactive 3D web applications.
                        </p>

                        {/* Dual Action CTAs */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link
                                href="/works"
                                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-105 active:scale-95"
                            >
                                <span>Explore Our Works (15+ Case Studies)</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>

                            <button
                                onClick={() => setIsVideoOpen(true)}
                                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-6 py-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-sm"
                            >
                                <div className="h-7 w-7 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md">
                                    <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                                </div>
                                <span>Watch Agency Showreel</span>
                            </button>
                        </div>

                        {/* Quick Trust Highlights */}
                        <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md">
                                <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-cyan-400">{stats.projects_delivered}+</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Projects Delivered</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md">
                                <div className="text-2xl sm:text-3xl font-black text-emerald-500">{stats.client_satisfaction}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Client Satisfaction</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md">
                                <div className="text-2xl sm:text-3xl font-black text-amber-500">{stats.trustpilot_score} ★</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Trustpilot Score</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md">
                                <div className="text-2xl sm:text-3xl font-black text-purple-500">{stats.years_experience}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Years of Innovation</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SERVICES SECTION */}
            <section className="py-24 bg-slate-50/70 dark:bg-slate-950/40 border-y border-slate-200/80 dark:border-slate-850 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
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
                        <div className="space-y-6">
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
                        <div className="rounded-3xl bg-slate-950/90 border border-slate-800 p-6 shadow-2xl space-y-4">
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
