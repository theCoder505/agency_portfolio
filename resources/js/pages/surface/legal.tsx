import React from 'react';
import { SurfaceLayout } from '@/layouts/surface-layout';
import { ShieldCheck, FileText, ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface LegalPageProps {
    title: string;
    content: string;
}

export default function Legal({ title, content }: LegalPageProps) {
    return (
        <SurfaceLayout
            title={title}
            description={`CodeVenture Tech legal compliance and ${title.toLowerCase()}.`}
        >
            <div className="py-12 border-b border-slate-200/60 dark:border-cyan-500/10 relative">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-cyan-500 dark:hover:text-cyan-400 mb-6 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Home</span>
                    </Link>

                    <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <FileText className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                            {title}
                        </h1>
                    </div>
                    <p className="text-xs text-slate-400">Last updated: August 2026</p>
                </div>
            </div>

            <div className="py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="cv-card p-8 sm:p-12 rounded-3xl shadow-sm">
                        <div
                            className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </div>
                </div>
            </div>
        </SurfaceLayout>
    );
}
