import React, { useEffect } from 'react';
import { usePage, Head } from '@inertiajs/react';
import { SharedData } from '@/types';
import { SurfaceHeader } from '@/components/surface/surface-header';
import { SurfaceFooter } from '@/components/surface/surface-footer';
import { WhatsAppWidget } from '@/components/surface/whatsapp-widget';
import { ScrollToTop } from '@/components/surface/scroll-to-top';
import { showToast, showSuccessAlert, showErrorAlert } from '@/lib/swal';

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
    const brandName = app_settings?.brand_name || 'CodeVenture Tech';
    const pageTitle = title ? `${title} | ${brandName}` : `${brandName} - Modern Web Development Agency`;

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
        <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-indigo-500 selection:text-white transition-colors duration-200">
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={description} />
                {app_settings?.favicon && (
                    <link rel="icon" type="image/x-icon" href={app_settings.favicon} />
                )}
            </Head>

            {/* Glassmorphic Navbar */}
            <SurfaceHeader />

            {/* Page Content */}
            <main className="flex-grow pt-20">
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
