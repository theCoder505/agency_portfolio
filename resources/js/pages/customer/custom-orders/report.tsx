import React from 'react';
import { Head } from '@inertiajs/react';
import { CustomOrder } from '@/types';
import { ProjectReportModal } from '@/components/custom-orders/project-report-modal';

interface CustomOrderReportPageProps {
    order: CustomOrder;
    brandSettings: {
        brand_name?: string;
        logo?: string;
        contact_email?: string;
        contact_phone?: string;
        address_line1?: string;
        address_line2?: string;
        currency_symbol?: string;
    };
}

export default function CustomOrderReportPage({
    order,
    brandSettings,
}: CustomOrderReportPageProps) {
    return (
        <div className="min-h-screen bg-slate-950/80 flex items-center justify-center p-4">
            <Head title={`Project Report #${order.order_number} - ${order.title}`} />

            <ProjectReportModal
                order={order}
                isOpen={true}
                onClose={() => window.history.back()}
                brandSettings={brandSettings}
            />
        </div>
    );
}
