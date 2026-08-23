import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { TeamMember, SharedData } from '@/types';
import { SurfaceLayout } from '@/layouts/surface-layout';
import {
    Users,
    Code,
    Sparkles,
    Shield,
    Globe,
    Zap,
    MapPin,
    Github,
    Linkedin,
    Twitter,
    Award,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';

interface AboutPageProps {
    teamMembers: TeamMember[];
}

export default function About({ teamMembers }: AboutPageProps) {
    const { app_settings } = usePage<SharedData>().props;

    const brandName = app_settings?.brand_name || 'CodeVenture Tech';
    const address1 = app_settings?.address_line1 || '100 Silicon Vista Way, Suite 400';
    const address2 = app_settings?.address_line2 || 'San Francisco, CA 94107, USA';
    const mapEmbedUrl = app_settings?.google_map_embed_url;

    const milestones = [
        { year: '2019', title: 'Agency Founded', desc: 'Started with 3 full-stack engineers building custom Laravel applications.' },
        { year: '2021', title: 'SaaS Specialization', desc: 'Scaled to 15+ engineers and delivered 50+ enterprise SaaS platforms.' },
        { year: '2023', title: 'Global Recognition', desc: 'Named Top Rated Web Engineering Agency with 4.9+ Trustpilot score.' },
        { year: '2026', title: 'AI & Next-Gen Systems', desc: 'Pioneering streaming LLM workspaces and WebGL 3D web applications.' },
    ];

    return (
        <SurfaceLayout
            title="About Us & Engineering Team"
            description={`Learn about ${brandName}'s mission, engineering standards, leadership team, and global footprint.`}
        >
            {/* Hero Header */}
            <section className="pt-16 pb-20 bg-slate-900/40 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-850 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl relative z-10">
                    <div
                        data-aos="fade-down"
                        className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20 text-xs font-bold mb-4"
                    >
                        <Users className="h-3.5 w-3.5" />
                        <span>The People Behind The Code</span>
                    </div>
                    <h1
                        data-aos="fade-up"
                        data-aos-delay="100"
                        className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight"
                    >
                        Crafting High-Performance Software for Ambitious Teams
                    </h1>
                    <p
                        data-aos="fade-up"
                        data-aos-delay="200"
                        className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed"
                    >
                        We are an elite squad of product engineers, systems architects, and UI/UX designers dedicated to building digital platforms that set industry benchmarks.
                    </p>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div
                            data-aos="fade-up"
                            data-aos-delay="100"
                            className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                        >
                            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                                <Code className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Architectural Integrity</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                We believe in pristine codebases, comprehensive type safety, robust test coverage, and modular components that your team can effortlessly maintain for years.
                            </p>
                        </div>

                        <div
                            data-aos="fade-up"
                            data-aos-delay="200"
                            className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                        >
                            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                                <Zap className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Extreme Velocity & Speed</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                99+ Core Web Vitals, sub-second TTFB, and optimized serverless bundles. We eliminate bloat so your users experience immediate gratification.
                            </p>
                        </div>

                        <div
                            data-aos="fade-up"
                            data-aos-delay="300"
                            className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                        >
                            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Aesthetic Mastery</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Design is not just how it looks—it is how it feels. Micro-animations, dark mode precision, and intuitive flows that captivate users from first visit.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* TEAM MEMBERS GRID */}
            <section className="py-20 bg-slate-50/70 dark:bg-slate-950/40 border-y border-slate-200/80 dark:border-slate-850">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
                        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-bold mb-3">
                            <Users className="h-3.5 w-3.5" />
                            <span>Leadership & Engineering</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                            Meet the Builders
                        </h2>
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                            Senior engineers and designers dedicated to bringing your product to life.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {teamMembers.map((member, idx) => (
                            <div
                                key={member.id}
                                data-aos="fade-up"
                                data-aos-delay={`${(idx % 4) * 100}`}
                                className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between"
                            >
                                <div className="p-6 text-center space-y-4">
                                    <div className="relative mx-auto h-28 w-28 rounded-full overflow-hidden ring-4 ring-slate-100 dark:ring-slate-800 group-hover:ring-indigo-500 transition-all">
                                        {member.avatar ? (
                                            <img
                                                src={member.avatar}
                                                alt={member.name}
                                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold">
                                                {member.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            {member.name}
                                        </h3>
                                        <p className="text-xs font-semibold text-indigo-600 dark:text-cyan-400 mt-0.5">
                                            {member.role}
                                        </p>
                                    </div>

                                    {member.bio && (
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                                            {member.bio}
                                        </p>
                                    )}
                                </div>

                                {/* Social Links */}
                                <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-center space-x-3">
                                    {member.social_linkedin && (
                                        <a href={member.social_linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors">
                                            <Linkedin className="h-4 w-4" />
                                        </a>
                                    )}
                                    {member.social_github && (
                                        <a href={member.social_github} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors">
                                            <Github className="h-4 w-4" />
                                        </a>
                                    )}
                                    {member.social_twitter && (
                                        <a href={member.social_twitter} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors">
                                            <Twitter className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MILESTONES TIMELINE */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                            Our Journey & Milestones
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {milestones.map((item, idx) => (
                            <div
                                key={idx}
                                data-aos="zoom-in-up"
                                data-aos-delay={`${idx * 100}`}
                                className="relative p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                            >
                                <span className="text-2xl font-black text-indigo-600 dark:text-cyan-400">{item.year}</span>
                                <h4 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AGENCY LOCATION & MAP */}
            <section className="py-20 bg-slate-900 text-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-5 space-y-6">
                            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold">
                                <MapPin className="h-4 w-4" />
                                <span>Global Headquarters</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                                Where We Are Located
                            </h2>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Our core engineering hub is situated in San Francisco, with distributed architects collaborating seamlessly across North America, Europe, and Asia.
                            </p>
                            <div className="space-y-2 pt-2 text-sm text-slate-300">
                                <div className="font-semibold text-white">{address1}</div>
                                <div>{address2}</div>
                            </div>
                            <div className="pt-2">
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                                >
                                    <span>Plan a Visit or Video Call</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="lg:col-span-7">
                            <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl h-80 bg-slate-950">
                                {mapEmbedUrl ? (
                                    <iframe
                                        src={mapEmbedUrl}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm">
                                        Map Embed Preview
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </SurfaceLayout>
    );
}
