import React, { useEffect } from 'react';
import { usePage, Head } from '@inertiajs/react';
import { SharedData } from '@/types';
import { SurfaceHeader } from '@/components/surface/surface-header';
import { SurfaceFooter } from '@/components/surface/surface-footer';
import { WhatsAppWidget } from '@/components/surface/whatsapp-widget';
import { ScrollToTop } from '@/components/surface/scroll-to-top';
import { showToast, showSuccessAlert, showErrorAlert } from '@/lib/swal';
import { initAOS, refreshAOS } from '@/lib/aos';

interface SurfaceLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export const SurfaceLayout: React.FC<SurfaceLayoutProps> = ({
    children,
    title,
    description = 'High performance web applications, SaaS development, and bespoke digital experiences.',
}) => {
    const { app_settings, flash } = usePage<SharedData>().props;
    const { url } = usePage();
    const brandName = app_settings?.brand_name || 'CodeVenture Tech';
    const pageTitle = title ? `${title} | ${brandName}` : `${brandName} - Modern Web Development Agency`;

    useEffect(() => {
        initAOS({
            duration: 700,
            offset: 40,
            once: true,
        });
    }, []);

    useEffect(() => {
        // Refresh AOS animations on route/content change
        const timer = setTimeout(() => {
            refreshAOS();
        }, 100);
        return () => clearTimeout(timer);
    }, [url, children]);

    useEffect(() => {
        if (flash?.success) {
            showSuccessAlert('Success', flash.success);
        } else if (flash?.error) {
            showErrorAlert('Error', flash.error);
        } else if (flash?.warning) {
            showToast(flash.warning, 'warning');
        } else if (flash?.info) {
            showToast(flash.info, 'info');
        }
    }, [flash]);

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-[#010a10] text-slate-900 dark:text-[#e5e8ec] selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-300 relative overflow-x-clip">
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={description} />
                {app_settings?.favicon && (
                    <link rel="icon" type="image/x-icon" href={app_settings.favicon} />
                )}
            </Head>

            {/* Ambient Background Gradient Lighting Effects */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute -top-40 left-1/4 w-[650px] h-[650px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[140px] cv-ambient-pulse" />
                <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[140px] cv-ambient-pulse" style={{ animationDelay: '3s' }} />
                <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-[140px] cv-ambient-pulse" style={{ animationDelay: '5s' }} />
            </div>

            {/* Glassmorphic Navbar (Kept intact) */}
            <SurfaceHeader />

            {/* Page Content */}
            <main className="flex-grow pt-20 relative z-10">
                {children}
            </main>

            {/* Global Footer */}
            <SurfaceFooter />

            {/* Scroll-Triggered Floating WhatsApp Chat */}
            <WhatsAppWidget settings={app_settings} />

            {/* Smooth Scroll-To-Top Button */}
            <ScrollToTop />
        </div>
    );
};
