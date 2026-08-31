import React from 'react';
import { SurfaceLayout } from '@/layouts/surface-layout';
import { ShieldCheck, FileText, ArrowLeft, Lock, Mail, ExternalLink } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface LegalPageProps {
    title: string;
    content: string;
}

export default function Legal({ title, content }: LegalPageProps) {
    const isTerms = title.toLowerCase().includes('terms');

    return (
        <SurfaceLayout
            title={title}
            description={`CodeVenture Tech legal compliance, data security policies, and ${title.toLowerCase()}.`}
        >
            <div className="py-16 relative overflow-hidden">
                {/* Background Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <Link
                            href="/"
                            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Home</span>
                        </Link>

                        {/* Quick Legal Switcher Tabs */}
                        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-cyan-500/20 text-xs font-bold">
                            <Link
                                href="/terms-and-conditions"
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    isTerms
                                        ? 'bg-white dark:bg-cyan-500 text-slate-900 dark:text-slate-950 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                Terms & Conditions
                            </Link>
                            <Link
                                href="/privacy-policy"
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    !isTerms
                                        ? 'bg-white dark:bg-cyan-500 text-slate-900 dark:text-slate-950 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                Privacy Policy
                            </Link>
                        </div>
                    </div>

                    <div className="space-y-4 mb-10">
                        <div className="cv-badge">
                            {isTerms ? (
                                <FileText className="h-3.5 w-3.5 text-cyan-400" />
                            ) : (
                                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                            )}
                            <span>Enterprise Legal Compliance</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                            {title}
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Effective Date: August 2026 • CodeVenture Technologies SLA & Compliance
                        </p>
                    </div>

                    {/* Main Legal Document Card */}
                    <div className="cv-card p-8 sm:p-14 rounded-3xl shadow-sm relative overflow-hidden">
                        <div
                            className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-6 [&>h2]:text-xl [&>h2]:font-black [&>h2]:text-slate-900 [&>h2]:dark:text-white [&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:border-b [&>h2]:border-slate-100 [&>h2]:dark:border-cyan-500/15 [&>h2]:pb-2 [&>p]:text-slate-600 [&>p]:dark:text-slate-300 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>a]:text-cyan-500 [&>a]:font-bold [&>a]:underline"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />

                        {/* Legal Inquiries Contact Card at bottom */}
                        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-cyan-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-[#01121e] -mx-4 -mb-4 sm:-mx-8 sm:-mb-8 p-6 rounded-2xl">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Have legal or data privacy questions?
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Our legal and compliance team is available to assist you.
                                </p>
                            </div>
                            <a
                                href="mailto:hello@codeventure.tech"
                                className="cv-btn-secondary text-xs px-4 py-2"
                            >
                                <Mail className="h-3.5 w-3.5 text-cyan-500" />
                                <span>Contact Compliance</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </SurfaceLayout>
    );
}
