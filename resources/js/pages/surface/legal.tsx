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
            <div className="py-12 bg-slate-900/30 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-850">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-cyan-400 mb-6 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Home</span>
                    </Link>

                    <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400">
                            <FileText className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                            {title}
                        </h1>
                    </div>
                    <p className="text-xs text-slate-500">Last updated: August 2026</p>
                </div>
            </div>

            <div className="py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
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
