import React, { useState } from 'react';
import { SubscriptionInvoice } from '@/types';
import {
    Download,
    X,
    Receipt,
    ShieldCheck,
    Loader2,
    Printer,
    ExternalLink,
    Building2,
    Calendar,
    CreditCard,
    CheckCircle2,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { showToast } from '@/lib/swal';
import { formatCurrency } from '@/lib/formatters';

interface InvoiceReceiptModalProps {
    invoice: SubscriptionInvoice;
    isOpen: boolean;
    onClose: () => void;
    brandSettings?: {
        brand_name?: string;
        logo?: string;
        contact_email?: string;
        contact_phone?: string;
        address_line1?: string;
        address_line2?: string;
        currency_symbol?: string;
    };
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({
    invoice,
    isOpen,
    onClose,
    brandSettings = {
        brand_name: 'CodeVenture Tech',
        contact_email: 'hello@codeventure.tech',
        contact_phone: '+880 1700-000000',
        address_line1: 'House #42, Road #11, Banani',
        address_line2: 'Dhaka - 1213, Bangladesh',
        currency_symbol: '৳',
    },
}) => {
    if (!isOpen) return null;

    const [isDownloading, setIsDownloading] = useState(false);

    const currency = invoice.currency || brandSettings.currency_symbol || '৳';
    const amount = Number(invoice.amount) || 0;
    const isPaid = invoice.status === 'paid';
    const isPending = invoice.status === 'pending';
    const isRejected = invoice.status === 'rejected';

    const fullVerificationUrl = typeof window !== 'undefined' && window.location.origin
        ? `${window.location.origin}/customer/invoices?ref=${invoice.invoice_number}`
        : `https://codeventure.tech/customer/invoices?ref=${invoice.invoice_number}`;

    const formattedGeneratedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const formattedInvoiceDate = new Date(invoice.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    const handleDownloadPdf = async () => {
        try {
            setIsDownloading(true);
            showToast('Generating official PDF invoice statement...', 'info');

            // Dynamically load html2pdf.js library if not already loaded
            if (!(window as any).html2pdf) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
                    script.integrity = 'sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==';
                    script.crossOrigin = 'anonymous';
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error('Unable to load PDF generator library.'));
                    document.head.appendChild(script);
                });
            }

            const html2pdf = (window as any).html2pdf;

            // Generate clean standalone HTML snippet with pure standard HEX/RGB CSS, full width and background watermark
            const htmlContent = generateStandaloneInvoiceHtml(
                invoice,
                brandSettings,
                formattedGeneratedDate,
                formattedInvoiceDate,
                currency,
                amount,
                fullVerificationUrl
            );

            // Render container directly in document.body
            const renderContainer = document.createElement('div');
            renderContainer.id = 'pdf-invoice-render-direct-wrapper';
            renderContainer.style.position = 'absolute';
            renderContainer.style.left = '-9999px';
            renderContainer.style.top = '0px';
            renderContainer.style.width = '750px';
            renderContainer.style.backgroundColor = '#ffffff';
            renderContainer.innerHTML = htmlContent;
            document.body.appendChild(renderContainer);

            // Allow DOM and inlined background SVG assets to settle
            await new Promise((resolve) => setTimeout(resolve, 300));

            const targetElement = document.getElementById('pdf-invoice-doc') || renderContainer;

            const opt = {
                margin: [10, 8, 10, 8],
                filename: `CodeVenture-Invoice-${invoice.invoice_number}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    scrollX: 0,
                    scrollY: 0,
                    x: 0,
                    y: 0,
                    width: 750,
                    windowWidth: 750,
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                },
                pagebreak: {
                    mode: ['avoid-all', 'css', 'legacy'],
                    avoid: ['.pdf-avoid-break', '.pdf-card', '.pdf-section', 'table', 'tr']
                }
            };

            await html2pdf().set(opt).from(targetElement).save();
            document.body.removeChild(renderContainer);

            showToast('PDF invoice downloaded successfully!', 'success');
        } catch (err: any) {
            console.error('PDF invoice generation error:', err);
            showToast(err.message || 'Failed to download PDF invoice.', 'error');
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
            <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto text-slate-900 dark:text-white">
                {/* TOOLBAR */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0 print:hidden">
                    <div className="flex items-center space-x-2">
                        <Receipt className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Invoice &amp; Payment Statement PDF
                        </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={isDownloading}
                            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {isDownloading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Generating PDF...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4" />
                                    <span>Download PDF Invoice</span>
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* ON-SCREEN PREVIEW DOCUMENT BODY (WITH BACKGROUND WATERMARK) */}
                <div id="printable-invoice-statement" className="p-6 sm:p-10 space-y-6 bg-white dark:bg-slate-900 overflow-y-auto flex-1 w-full relative">
                    {/* WATERMARK BACKGROUND (PREVIEW ONLY) */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden select-none z-0">
                        {brandSettings.logo ? (
                            <img
                                src={brandSettings.logo}
                                alt="Brand Watermark"
                                className="w-[60%] max-w-[500px] max-h-[400px] object-contain opacity-25 dark:opacity-25 pointer-events-none -rotate-45"
                            />
                        ) : (
                            <div className="text-7xl font-black text-indigo-600 opacity-25 dark:opacity-25 uppercase tracking-wider -rotate-45">
                                {brandSettings.brand_name || 'CodeVenture'}
                            </div>
                        )}
                    </div>

                    {/* HEADER WITH BRAND LOGO & INVOICE META */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-slate-200 dark:border-slate-800 w-full relative z-10">
                        <div className="space-y-2">
                            {brandSettings.logo ? (
                                <div>
                                    <img
                                        src={brandSettings.logo}
                                        alt={brandSettings.brand_name || 'Brand Logo'}
                                        className="h-12 w-auto max-w-[240px] object-contain rounded-lg"
                                    />
                                    <p className="text-xs text-slate-500 font-medium mt-1">
                                        Enterprise Cloud Platforms &amp; Software Solutions
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3.5">
                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 text-white flex items-center justify-center font-black shadow-md shrink-0">
                                        <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                            {brandSettings.brand_name || 'CodeVenture Tech'}
                                        </h1>
                                        <p className="text-xs text-slate-500 font-medium">
                                            Enterprise Cloud Platforms &amp; Software Solutions
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="text-xs text-slate-500 pt-1 space-y-0.5">
                                <p>{brandSettings.address_line1}</p>
                                {brandSettings.address_line2 && <p>{brandSettings.address_line2}</p>}
                                <p>Email: {brandSettings.contact_email} &bull; Support: {brandSettings.contact_phone}</p>
                            </div>
                        </div>

                        <div className="sm:text-right space-y-1.5 shrink-0">
                            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400 border border-indigo-200 dark:border-indigo-800">
                                Official Invoice Statement
                            </span>
                            <p className="font-mono text-sm font-black text-slate-900 dark:text-white mt-1">
                                {invoice.invoice_number}
                            </p>
                            <p className="text-xs text-slate-500">
                                Issue Date: {formattedInvoiceDate}
                            </p>
                            <div className="pt-1">
                                <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${isPaid
                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                        : isPending
                                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                    }`}>
                                    STATUS: {invoice.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* CLIENT DETAILS & SUBSCRIPTION METADATA */}
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800 relative z-10">
                        <div className="space-y-1.5 text-xs">
                            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
                                Billed To (Client Account)
                            </span>
                            <p className="font-black text-sm text-slate-900 dark:text-white">
                                {invoice.user?.name || 'Authorized Account Holder'}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400">
                                Email: {invoice.user?.email || 'N/A'}
                            </p>
                            {invoice.user?.phone && (
                                <p className="text-slate-600 dark:text-slate-400">
                                    Phone / WhatsApp: {invoice.user?.phone}
                                </p>
                            )}
                            <p className="text-slate-500 text-[11px] pt-1 font-mono">
                                Client Account ID: #{invoice.user_id}
                            </p>
                        </div>

                        <div className="space-y-1.5 text-xs sm:text-right">
                            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
                                SaaS Product &amp; Service Details
                            </span>
                            <p className="font-bold text-sm text-slate-900 dark:text-white">
                                {invoice.subscription?.product?.name || 'SaaS Cloud Instance Subscription'}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 capitalize">
                                Billing Cycle: {invoice.billing_cycle ? invoice.billing_cycle.replace('_', ' ') : 'Standard'}
                            </p>
                            {invoice.period_start && invoice.period_end && (
                                <p className="text-slate-500 text-[11px] pt-1">
                                    Service Period: {new Date(invoice.period_start).toLocaleDateString()} &ndash; {new Date(invoice.period_end).toLocaleDateString()}
                                </p>
                            )}
                            <p className="text-slate-500 text-[11px]">
                                Invoice Type: <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">{invoice.type || 'Subscription'}</span>
                            </p>
                        </div>
                    </div>

                    {/* ITEMIZED BILLING LEDGER TABLE */}
                    <div className="space-y-3 w-full relative z-10">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Itemized Billing Breakdown
                        </h4>
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 w-full bg-white/40 dark:bg-slate-900/30">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                        <th className="py-3 px-4 font-bold w-12">#</th>
                                        <th className="py-3 px-4 font-bold">Service Description &amp; Specifications</th>
                                        <th className="py-3 px-4 font-bold whitespace-nowrap">Billing Term</th>
                                        <th className="py-3 px-4 font-bold">Payment Method</th>
                                        <th className="py-3 px-4 font-bold text-right whitespace-nowrap">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    <tr>
                                        <td className="py-3.5 px-4 font-mono font-bold text-slate-400 align-top">
                                            01
                                        </td>
                                        <td className="py-3.5 px-4 align-top">
                                            <p className="font-bold text-slate-900 dark:text-white">
                                                {invoice.subscription?.product?.name || 'SaaS Cloud Instance'}
                                            </p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                Turnkey Managed SaaS Environment with SSL, high availability &amp; instant verification.
                                            </p>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap capitalize align-top">
                                            {invoice.billing_cycle ? invoice.billing_cycle.replace('_', ' ') : 'Standard'}
                                        </td>
                                        <td className="py-3.5 px-4 uppercase font-mono font-semibold text-slate-700 dark:text-slate-300 align-top">
                                            {invoice.payment_method}
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-black font-mono text-slate-900 dark:text-white text-sm align-top whitespace-nowrap">
                                            {formatCurrency(amount, currency)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* PAYMENT CONFIRMATION & FINANCIAL SETTLEMENT SUMMARY */}
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                        {/* Transaction Verification Block */}
                        <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                            <div className="font-bold text-[11px] uppercase tracking-wider text-indigo-600 dark:text-cyan-400 flex items-center space-x-1.5">
                                <ShieldCheck className="h-4 w-4" />
                                <span>Verified Transaction Details</span>
                            </div>
                            <div className="space-y-1 text-slate-600 dark:text-slate-400">
                                <div>
                                    <strong className="text-slate-900 dark:text-white">Payment Method:</strong> {invoice.payment_method.toUpperCase()}
                                </div>
                                <div>
                                    <strong className="text-slate-900 dark:text-white">Transaction ID (TrxID):</strong>{' '}
                                    <span className="font-mono font-bold text-indigo-600 dark:text-cyan-400">
                                        {invoice.transaction_id || 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <strong className="text-slate-900 dark:text-white">Sender Account / Number:</strong>{' '}
                                    <span className="font-mono">{invoice.sender_number || 'N/A'}</span>
                                </div>
                                {invoice.paid_at && (
                                    <div>
                                        <strong className="text-slate-900 dark:text-white">Paid At:</strong>{' '}
                                        {new Date(invoice.paid_at).toLocaleString()}
                                    </div>
                                )}
                                {invoice.notes && (
                                    <div className="pt-1 border-t border-slate-200 dark:border-slate-800 mt-1">
                                        <strong className="text-slate-900 dark:text-white">Notes:</strong> {invoice.notes}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Totals Summary */}
                        <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
                            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                <span>Subtotal:</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">
                                    {formatCurrency(amount, currency)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                <span>Tax / VAT:</span>
                                <span className="font-mono text-slate-500">0.00</span>
                            </div>
                            <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold">
                                <span>Total Paid Amount:</span>
                                <span className="font-mono">
                                    {isPaid ? formatCurrency(amount, currency) : formatCurrency(0, currency)}
                                </span>
                            </div>
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <span className="font-bold text-sm text-slate-900 dark:text-white">
                                    {isPaid ? 'Balance Due:' : 'Total Amount Due:'}
                                </span>
                                <span className="font-mono font-black text-lg text-indigo-600 dark:text-cyan-400">
                                    {isPaid ? formatCurrency(0, currency) : formatCurrency(amount, currency)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* OFFICIAL FOOTER & VERIFICATION URL LINK */}
                    <div className="w-full pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-slate-500 relative z-10">
                        <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">
                                {brandSettings.brand_name || 'CodeVenture Tech'} &bull; Engineering &amp; Solutions
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Generated on {formattedGeneratedDate} &bull; Ref #{invoice.invoice_number}
                            </p>
                        </div>
                        <div className="sm:text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                Live Invoice Verification Link:
                            </span>
                            <a
                                href={fullVerificationUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1 font-mono text-[11px] text-indigo-600 dark:text-cyan-400 hover:underline"
                            >
                                <span className="truncate max-w-[280px]">{fullVerificationUrl}</span>
                                <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// STANDALONE FULL-WIDTH HTML GENERATOR WITH EMBEDDED LOGO AND BACKGROUND WATERMARK FOR HTML2PDF
function generateStandaloneInvoiceHtml(
    invoice: SubscriptionInvoice,
    brandSettings: {
        brand_name?: string;
        logo?: string;
        contact_email?: string;
        contact_phone?: string;
        address_line1?: string;
        address_line2?: string;
        currency_symbol?: string;
    },
    formattedGeneratedDate: string,
    formattedInvoiceDate: string,
    currency: string,
    amount: number,
    fullVerificationUrl: string = ''
): string {
    const brandName = brandSettings.brand_name || 'CodeVenture Tech';
    const contactEmail = brandSettings.contact_email || 'hello@codeventure.tech';
    const contactPhone = brandSettings.contact_phone || '+880 1700-000000';
    const addressLine1 = brandSettings.address_line1 || 'House #42, Road #11, Banani';
    const addressLine2 = brandSettings.address_line2 || 'Dhaka - 1213, Bangladesh';

    const isPaid = invoice.status === 'paid';
    const statusBg = isPaid ? '#dcfce7' : invoice.status === 'pending' ? '#fef3c7' : '#fee2e2';
    const statusColor = isPaid ? '#15803d' : invoice.status === 'pending' ? '#d97706' : '#b91c1c';

    return `
    <div id="pdf-invoice-doc" style="position: relative; width: 750px; box-sizing: border-box; padding: 28px 32px; background-color: #ffffff; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; line-height: 1.45; text-align: left; overflow: hidden;">
        <style>
            * {
                box-sizing: border-box;
            }
            .pdf-avoid-break,
            .pdf-card,
            .pdf-section,
            tr,
            table,
            tbody,
            thead {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
        </style>

        <!-- WATERMARK (CENTERED IN PAGE CONTAINER, -45DEG, 60% WIDTH) -->
        <div style="position: absolute; top: 48%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); opacity: 0.22; pointer-events: none; z-index: 0; text-align: center; width: 480px;">
            ${brandSettings.logo ? `
                <img src="${brandSettings.logo}" alt="Watermark" style="width: 100%; max-height: 380px; object-fit: contain; display: inline-block; opacity: 0.22;" />
            ` : `
                <div style="font-size: 52px; font-weight: 900; color: #4f46e5; letter-spacing: -1px; text-transform: uppercase; opacity: 0.22;">
                    ${brandName}
                </div>
            `}
        </div>

        <!-- DOCUMENT CONTENT (Z-INDEX: 2) -->
        <div style="position: relative; z-index: 2;">
            <!-- BRAND LOGO & HEADER (FULL WIDTH) -->
            <table class="pdf-avoid-break pdf-card" style="width: 100%; border-collapse: collapse; table-layout: fixed; margin: 0 0 16px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 14px; page-break-inside: avoid !important; break-inside: avoid !important;">
                <tr>
                    <td style="vertical-align: top; width: 58%; padding: 0 10px 14px 0; text-align: left;">
                        ${brandSettings.logo ? `
                            <div style="margin-bottom: 3px;">
                                <img src="${brandSettings.logo}" alt="${brandName}" style="height: 38px; width: auto; max-width: 240px; object-fit: contain; display: block;" />
                            </div>
                            <div style="font-size: 10px; color: #64748b; font-weight: 500; margin-top: 2px;">
                                Enterprise Cloud Platforms &amp; Software Solutions
                            </div>
                        ` : `
                            <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
                                <tr>
                                    <td style="vertical-align: middle; width: 42px; padding: 0 8px 0 0;">
                                        <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #4f46e5, #9333ea, #06b6d4); border-radius: 8px; text-align: center; line-height: 36px; display: inline-block;">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; display: inline-block;">
                                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                            </svg>
                                        </div>
                                    </td>
                                    <td style="vertical-align: middle; padding: 0;">
                                        <div style="font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; line-height: 1.15;">
                                            ${brandName}
                                        </div>
                                        <div style="font-size: 10px; color: #64748b; font-weight: 500; margin-top: 1px;">
                                            Enterprise Cloud Platforms &amp; Software Solutions
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        `}
                        <div style="font-size: 9.5px; color: #64748b; margin-top: 6px; line-height: 1.4;">
                            <div>${addressLine1}</div>
                            ${addressLine2 ? `<div>${addressLine2}</div>` : ''}
                            <div>Email: ${contactEmail} &bull; Support: ${contactPhone}</div>
                        </div>
                    </td>
                    <td style="vertical-align: top; text-align: right; width: 42%; padding: 0 4px 14px 10px;">
                        <div style="display: inline-block; padding: 3px 8px; border-radius: 9999px; background-color: #e0e7ff; color: #4338ca; font-weight: 800; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.5px;">
                            Official Invoice Statement
                        </div>
                        <div style="font-family: monospace; font-size: 13px; font-weight: 900; color: #0f172a; margin-top: 5px;">
                            ${invoice.invoice_number}
                        </div>
                        <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">
                            Issue Date: ${formattedInvoiceDate}
                        </div>
                        <div style="margin-top: 5px;">
                            <span style="display: inline-block; padding: 2px 7px; border-radius: 9999px; font-size: 9px; font-weight: 800; background-color: ${statusBg}; color: ${statusColor}; text-transform: uppercase;">
                                STATUS: ${invoice.status.toUpperCase()}
                            </span>
                        </div>
                    </td>
                </tr>
            </table>

            <!-- CLIENT & SERVICE SPECIFICATIONS CARD (FULL WIDTH) -->
            <div class="pdf-avoid-break pdf-card" style="width: 100%; box-sizing: border-box; background-color: rgba(248, 250, 252, 0.5); border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; margin-bottom: 14px; page-break-inside: avoid !important; break-inside: avoid !important;">
                <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
                    <tr>
                        <td style="width: 50%; vertical-align: top; padding: 0 10px 0 0; text-align: left;">
                            <div style="font-size: 8.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Billed To (Client Account)</div>
                            <div style="font-weight: 800; font-size: 11.5px; color: #0f172a;">${invoice.user?.name || 'Authorized Account Holder'}</div>
                            <div style="font-size: 10px; color: #475569; margin-top: 1px;">Email: ${invoice.user?.email || 'N/A'}</div>
                            ${invoice.user?.phone ? `<div style="font-size: 10px; color: #475569;">Phone: ${invoice.user.phone}</div>` : ''}
                            <div style="font-size: 9.5px; color: #94a3b8; margin-top: 2px; font-family: monospace;">Client Account ID: #${invoice.user_id}</div>
                        </td>
                        <td style="width: 50%; vertical-align: top; text-align: right; padding: 0 4px 0 10px;">
                            <div style="font-size: 8.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">SaaS Product &amp; Subscription</div>
                            <div style="font-weight: 800; font-size: 11.5px; color: #0f172a;">${invoice.subscription?.product?.name || 'SaaS Cloud Subscription'}</div>
                            <div style="font-size: 10px; color: #475569; margin-top: 1px; text-transform: capitalize;">Billing Cycle: ${invoice.billing_cycle ? invoice.billing_cycle.replace('_', ' ') : 'Standard'}</div>
                            ${invoice.period_start && invoice.period_end ? `
                                <div style="font-size: 9.5px; color: #475569; margin-top: 1px;">
                                    Period: ${new Date(invoice.period_start).toLocaleDateString()} &ndash; ${new Date(invoice.period_end).toLocaleDateString()}
                                </div>
                            ` : ''}
                            <div style="font-size: 9.5px; color: #94a3b8; margin-top: 2px; text-transform: capitalize;">Type: ${invoice.type || 'Subscription'}</div>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- ITEMIZED BILLING BREAKDOWN TABLE -->
            <div class="pdf-avoid-break pdf-card" style="width: 100%; box-sizing: border-box; margin-bottom: 14px; page-break-inside: avoid !important; break-inside: avoid !important;">
                <div style="font-size: 8.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;">Itemized Billing Ledger</div>
                <div style="width: 100%; box-sizing: border-box; background-color: rgba(255, 255, 255, 0.4); border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
                        <thead>
                            <tr style="background-color: rgba(241, 245, 249, 0.6); border-bottom: 1px solid #e2e8f0;">
                                <th style="width: 6%; padding: 8px 6px 8px 10px; font-size: 9px; font-weight: 700; color: #334155; text-transform: uppercase; text-align: left;">#</th>
                                <th style="width: 46%; padding: 8px 8px; font-size: 9px; font-weight: 700; color: #334155; text-transform: uppercase; text-align: left;">Service Description</th>
                                <th style="width: 16%; padding: 8px 8px; font-size: 9px; font-weight: 700; color: #334155; text-transform: uppercase; text-align: left;">Cycle</th>
                                <th style="width: 16%; padding: 8px 8px; font-size: 9px; font-weight: 700; color: #334155; text-transform: uppercase; text-align: left;">Gateway</th>
                                <th style="width: 16%; padding: 8px 10px 8px 6px; font-size: 9px; font-weight: 700; color: #334155; text-transform: uppercase; text-align: right;">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 10px 6px 10px 10px; font-family: monospace; font-weight: bold; color: #94a3b8; font-size: 10.5px; vertical-align: top;">01</td>
                                <td style="padding: 10px 8px; vertical-align: top;">
                                    <div style="font-weight: 700; color: #0f172a; font-size: 11px;">
                                        ${invoice.subscription?.product?.name || 'SaaS Cloud Instance'}
                                    </div>
                                    <div style="font-size: 9.5px; color: #64748b; margin-top: 1.5px;">
                                        Turnkey Managed SaaS Environment with SSL, high availability &amp; instant verification.
                                    </div>
                                </td>
                                <td style="padding: 10px 8px; color: #475569; font-size: 10px; text-transform: capitalize; vertical-align: top;">
                                    ${invoice.billing_cycle ? invoice.billing_cycle.replace('_', ' ') : 'Standard'}
                                </td>
                                <td style="padding: 10px 8px; color: #475569; font-size: 10px; text-transform: uppercase; font-family: monospace; font-weight: 600; vertical-align: top;">
                                    ${invoice.payment_method}
                                </td>
                                <td style="padding: 10px 10px 10px 6px; text-align: right; font-weight: 800; font-family: monospace; color: #0f172a; font-size: 11.5px; white-space: nowrap; vertical-align: top;">
                                    ${currency} ${amount.toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- PAYMENT TRANSACTION & FINANCIAL TOTALS GRID (FULL WIDTH) -->
            <div class="pdf-avoid-break pdf-card pdf-section" style="width: 100%; box-sizing: border-box; margin-bottom: 14px; page-break-inside: avoid !important; break-inside: avoid !important;">
                <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
                    <tr>
                        <td style="vertical-align: top; width: 50%; padding: 0 8px 0 0;">
                            <div style="background-color: rgba(248, 250, 252, 0.5); border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; box-sizing: border-box;">
                                <div style="font-size: 9.5px; font-weight: 700; color: #4f46e5; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                                    🔒 Verified Transaction Confirmation
                                </div>
                                <div style="font-size: 9.5px; color: #475569; line-height: 1.45;">
                                    <div><strong>Gateway:</strong> ${invoice.payment_method.toUpperCase()}</div>
                                    <div style="margin-top: 2px;"><strong>Transaction ID (TrxID):</strong> <span style="font-family: monospace; font-weight: 700; color: #4f46e5;">${invoice.transaction_id || 'N/A'}</span></div>
                                    <div style="margin-top: 2px;"><strong>Sender Account:</strong> <span style="font-family: monospace;">${invoice.sender_number || 'N/A'}</span></div>
                                    ${invoice.paid_at ? `<div style="margin-top: 2px;"><strong>Paid Timestamp:</strong> ${new Date(invoice.paid_at).toLocaleString()}</div>` : ''}
                                    ${invoice.notes ? `<div style="margin-top: 3px; padding-top: 3px; border-top: 1px solid #e2e8f0; color: #64748b;"><strong>Notes:</strong> ${invoice.notes}</div>` : ''}
                                </div>
                            </div>
                        </td>
                        <td style="vertical-align: top; width: 50%; padding: 0 0 0 8px;">
                            <div style="background-color: rgba(248, 250, 252, 0.5); border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; box-sizing: border-box;">
                                <table style="width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 9.5px;">
                                    <tr>
                                        <td style="color: #64748b; padding: 2px 0;">Subtotal:</td>
                                        <td style="text-align: right; font-weight: 700; font-family: monospace; color: #0f172a; padding: 2px 0;">${currency} ${amount.toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #64748b; padding: 2px 0;">Tax / VAT (0%):</td>
                                        <td style="text-align: right; font-family: monospace; color: #64748b; padding: 2px 0;">${currency} 0.00</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #16a34a; padding: 2px 0; font-weight: 700;">Total Paid:</td>
                                        <td style="text-align: right; font-weight: 800; font-family: monospace; color: #16a34a; padding: 2px 0;">${isPaid ? `(+) ${currency} ${amount.toLocaleString()}` : `${currency} 0.00`}</td>
                                    </tr>
                                    <tr style="border-top: 1px solid #e2e8f0;">
                                        <td style="padding-top: 5px; font-weight: 800; font-size: 9.5px; text-transform: uppercase; color: #0f172a;">
                                            ${isPaid ? 'Balance Due:' : 'Total Amount Due:'}
                                        </td>
                                        <td style="padding-top: 5px; text-align: right; font-weight: 900; font-family: monospace; font-size: 12px; color: #4f46e5;">
                                            ${isPaid ? `${currency} 0.00` : `${currency} ${amount.toLocaleString()}`}
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- OFFICIAL FOOTER & VERIFICATION LINK (AT LAST OF PDF) -->
            <div class="pdf-avoid-break pdf-card pdf-section" style="width: 100%; box-sizing: border-box; margin-top: 16px; border-top: 1.5px solid #e2e8f0; padding-top: 14px; page-break-inside: avoid !important; break-inside: avoid !important;">
                <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
                    <tr>
                        <td style="vertical-align: middle; width: 55%; text-align: left; padding: 0 10px 0 0;">
                            <div style="font-weight: 800; font-size: 11px; color: #0f172a;">${brandName}</div>
                            <div style="font-size: 8.5px; color: #64748b; margin-top: 1.5px;">Engineering &amp; Cloud Platform Division &bull; ${contactEmail}</div>
                            <div style="font-size: 8.5px; color: #94a3b8; font-family: monospace; margin-top: 2px;">Generated on ${formattedGeneratedDate} &bull; Ref #${invoice.invoice_number}</div>
                            <div style="font-size: 8.5px; color: #4f46e5; font-weight: 700; margin-top: 4px;">
                                🔒 Authorized &amp; Verified Electronic Invoice Statement
                            </div>
                        </td>
                        <td style="vertical-align: middle; width: 45%; text-align: right; padding: 0 0 0 12px;">
                            <div style="font-size: 8.5px; font-weight: 700; color: #475569; margin-bottom: 2px;">
                                Live Verification URL:
                            </div>
                            <a href="${fullVerificationUrl}" target="_blank" style="display: inline-block; font-size: 9px; font-weight: 700; color: #4f46e5; text-decoration: underline; word-break: break-all; font-family: monospace; line-height: 1.35;">
                                ${fullVerificationUrl}
                            </a>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
    `;
}
