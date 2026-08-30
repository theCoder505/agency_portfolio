import React, { useState } from 'react';
import { CustomOrder, CustomOrderMilestone } from '@/types';
import {
    Download,
    X,
    Receipt,
    ShieldCheck,
    Loader2,
    Github,
    HardDrive,
    Globe,
    ExternalLink,
} from 'lucide-react';
import { showToast } from '@/lib/swal';

interface ProjectReportModalProps {
    order: CustomOrder;
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

export const ProjectReportModal: React.FC<ProjectReportModalProps> = ({
    order,
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

    const currency = order.currency || brandSettings.currency_symbol || 'BDT';
    const agreedPrice = order.agreed_price || order.estimated_budget || 0;
    const totalCollected = order.total_collected_amount || 0;
    const totalProcessing = order.total_processing_amount || 0;
    const totalPending = order.total_pending_amount || 0;
    const totalRefunded = order.total_refunded_amount || 0;
    const remainingBalance = Math.max(0, agreedPrice - totalCollected);
    const settlementProgress = order.progress_percentage ?? (agreedPrice > 0 ? Math.min(100, Math.round((totalCollected / agreedPrice) * 100)) : 0);
    const milestones = order.milestones || [];
    const titleSlug = order.slug || (order.title || 'project')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'project';
    const ref = order.order_number || order.id;
    const orderShowPath = `/customer/custom-orders/${ref}/${titleSlug}`;
    const fullVerificationUrl = typeof window !== 'undefined' && window.location.origin
        ? `${window.location.origin}${orderShowPath}`
        : `https://codeventure.tech${orderShowPath}`;

    const formattedGeneratedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const statusBadge = order.status_badge || { label: order.status, color: 'slate', description: '' };

    const handleDownloadPdf = async () => {
        try {
            setIsDownloading(true);
            showToast('Generating official PDF statement...', 'info');

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
            const htmlContent = generateStandaloneReportHtml(
                order,
                brandSettings,
                formattedGeneratedDate,
                currency,
                agreedPrice,
                totalCollected,
                totalProcessing,
                totalPending,
                totalRefunded,
                remainingBalance,
                settlementProgress,
                statusBadge,
                milestones,
                fullVerificationUrl
            );

            // Render container directly in document.body
            const renderContainer = document.createElement('div');
            renderContainer.id = 'pdf-render-direct-wrapper';
            renderContainer.style.position = 'absolute';
            renderContainer.style.left = '-9999px';
            renderContainer.style.top = '0px';
            renderContainer.style.width = '750px';
            renderContainer.style.backgroundColor = '#ffffff';
            renderContainer.innerHTML = htmlContent;
            document.body.appendChild(renderContainer);

            // Allow DOM and inlined background SVG assets to settle
            await new Promise((resolve) => setTimeout(resolve, 300));

            const targetElement = document.getElementById('pdf-statement-doc') || renderContainer;

            const opt = {
                margin: [10, 8, 10, 8],
                filename: `CodeVenture-Order-${order.order_number}-Statement.pdf`,
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

            showToast('PDF statement saved to your device!', 'success');
        } catch (err: any) {
            console.error('PDF generation error:', err);
            showToast(err.message || 'Failed to download PDF.', 'error');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
            <div className="relative w-full max-w-5xl max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto text-slate-900 dark:text-white">
                {/* TOOLBAR */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="flex items-center space-x-2">
                        <Receipt className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Project Deal & Settlement Report PDF
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
                                    <span>Download PDF Statement</span>
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* ON-SCREEN PREVIEW DOCUMENT BODY (FULL WIDTH SCROLLABLE) */}
                <div id="printable-statement" className="p-6 sm:p-10 space-y-6 bg-white dark:bg-slate-900 overflow-y-auto flex-1 w-full relative">
                    {/* WATERMARK BACKGROUND (PREVIEW ONLY) */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden select-none z-0">
                        {brandSettings.logo ? (
                            <img
                                src={brandSettings.logo}
                                alt="Brand Watermark"
                                className="w-[60%] max-w-[550px] max-h-[450px] object-contain opacity-25 dark:opacity-25 pointer-events-none -rotate-45"
                            />
                        ) : (
                            <div className="text-7xl font-black text-indigo-600 opacity-25 dark:opacity-25 uppercase tracking-wider -rotate-45">
                                {brandSettings.brand_name || 'CodeVenture'}
                            </div>
                        )}
                    </div>

                    {/* HEADER WITH BRAND LOGO & BRAND NAME AT START (FULL WIDTH) */}
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
                                        Enterprise Bespoke Software &amp; Cloud Solutions
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
                                            Enterprise Bespoke Software &amp; Cloud Solutions
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
                                Project Deal &amp; Settlement Statement
                            </span>
                            <p className="font-mono text-sm font-black text-slate-900 dark:text-white mt-1">
                                REF #{order.order_number}
                            </p>
                            <p className="text-xs text-slate-500">
                                Date Generated: {formattedGeneratedDate}
                            </p>
                        </div>
                    </div>

                    {/* FULL-WIDTH CLIENT & PROJECT METADATA CARD */}
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50/40 dark:bg-slate-950/30 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800 relative z-10">
                        <div className="space-y-1.5 text-xs">
                            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
                                Client Details
                            </span>
                            <p className="font-black text-sm text-slate-900 dark:text-white">
                                {order.user?.name || 'Authorized Client'}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400">
                                Email: {order.client_email || order.user?.email || 'N/A'}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400">
                                WhatsApp / Phone: {order.client_whatsapp || order.user?.whatsapp_number || order.user?.phone || 'N/A'}
                            </p>
                            {order.created_at && (
                                <p className="text-slate-500 text-[11px] pt-1">
                                    Order Initiated: {new Date(order.created_at).toLocaleDateString()}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5 text-xs sm:text-right">
                            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
                                Project Scope &amp; Classification
                            </span>
                            <p className="font-bold text-sm text-slate-900 dark:text-white">
                                {order.title}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400">
                                Category: {order.category || 'Custom Software Development'}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 sm:justify-end mt-1">
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                    Status: {statusBadge.label}
                                </span>
                                {order.target_deadline && (
                                    <span className="text-slate-500 font-semibold">
                                        &bull; Target Deadline: {new Date(order.target_deadline).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            {order.accepted_at && (
                                <p className="text-slate-500 text-[11px] pt-1">
                                    Accepted Date: {new Date(order.accepted_at).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* PROJECT REPOSITORY & DELIVERABLE LINKS (IF AVAILABLE, FULL WIDTH) */}
                    {(order.github_repo_url || order.drive_link || order.live_demo_url) && (
                        <div className="w-full p-4 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/20 backdrop-blur-xs border border-indigo-100 dark:border-indigo-900/50 relative z-10">
                            <span className="font-bold text-[11px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-2">
                                Project Deliverable Repositories &amp; Assets
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                {order.github_repo_url && (
                                    <div className="flex items-center space-x-2 truncate">
                                        <Github className="h-4 w-4 text-slate-700 dark:text-slate-300 shrink-0" />
                                        <span className="truncate font-mono text-[11px]">{order.github_repo_url}</span>
                                    </div>
                                )}
                                {order.drive_link && (
                                    <div className="flex items-center space-x-2 truncate">
                                        <HardDrive className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                                        <span className="truncate font-mono text-[11px]">{order.drive_link}</span>
                                    </div>
                                )}
                                {order.live_demo_url && (
                                    <div className="flex items-center space-x-2 truncate">
                                        <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                        <span className="truncate font-mono text-[11px]">{order.live_demo_url}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* COMPLETE PROJECT REQUIREMENTS & SPECIFICATIONS (FULL WIDTH) */}
                    {order.requirements && (
                        <div className="space-y-2 text-xs w-full relative z-10">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Complete Project Scope &amp; Technical Requirements
                            </h4>
                            <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/30 backdrop-blur-xs border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line text-xs w-full break-words">
                                {order.requirements}
                            </div>
                        </div>
                    )}

                    {/* REFERENCE LINKS (IF PRESENT, FULL WIDTH) */}
                    {order.reference_links && (
                        <div className="space-y-1.5 text-xs w-full relative z-10">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Project Reference Links &amp; Specifications
                            </h4>
                            <div className="p-3.5 rounded-2xl bg-slate-50/40 dark:bg-slate-900/30 backdrop-blur-xs border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 whitespace-pre-line text-xs w-full break-words">
                                {order.reference_links}
                            </div>
                        </div>
                    )}

                    {/* ITEMIZED MILESTONES & PAYMENTS LEDGER (FULL WIDTH) */}
                    <div className="space-y-3 w-full relative z-10">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Milestone Breakdown &amp; Payment Ledger
                            </h4>
                            <span className="text-xs text-slate-400 font-medium">
                                {milestones.length} Milestone{milestones.length === 1 ? '' : 's'} Recorded
                            </span>
                        </div>
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 w-full bg-white/30 dark:bg-slate-900/20">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-100/40 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                        <th className="py-3 px-4 font-bold w-12">#</th>
                                        <th className="py-3 px-4 font-bold">Milestone Title &amp; Deliverable Details</th>
                                        <th className="py-3 px-4 font-bold whitespace-nowrap">Due Date</th>
                                        <th className="py-3 px-4 font-bold">Payment Channel / Trx ID</th>
                                        <th className="py-3 px-4 font-bold">Status</th>
                                        <th className="py-3 px-4 font-bold text-right whitespace-nowrap">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {milestones.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-6 text-center text-slate-400">
                                                No structured milestones recorded yet. Total agreed project value: {currency} {agreedPrice.toLocaleString()}
                                            </td>
                                        </tr>
                                    ) : (
                                        milestones.map((m, idx) => (
                                            <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                                <td className="py-3.5 px-4 font-mono font-bold text-slate-400 align-top">
                                                    M{idx + 1}
                                                </td>
                                                <td className="py-3.5 px-4 align-top">
                                                    <p className="font-bold text-slate-900 dark:text-white">
                                                        {m.title}
                                                    </p>
                                                    {m.description && (
                                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed break-words">
                                                            {m.description}
                                                        </p>
                                                    )}
                                                    {(m.github_repo_url || m.drive_link || m.live_demo_url) && (
                                                        <div className="flex flex-wrap gap-2 mt-1.5">
                                                            {m.github_repo_url && (
                                                                <span className="inline-flex items-center text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
                                                                    GitHub Linked
                                                                </span>
                                                            )}
                                                            {m.drive_link && (
                                                                <span className="inline-flex items-center text-[10px] text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded font-mono">
                                                                    Drive Assets
                                                                </span>
                                                            )}
                                                            {m.live_demo_url && (
                                                                <span className="inline-flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-mono">
                                                                    Live Demo
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap align-top">
                                                    {m.due_date ? new Date(m.due_date).toLocaleDateString() : 'Flexible / TBD'}
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 align-top">
                                                    <p className="font-medium">{m.client_payment_method || m.payment_method || 'Online / Bank'}</p>
                                                    {m.client_trx_id && (
                                                        <p className="font-mono text-[10px] text-indigo-600 dark:text-cyan-400 mt-0.5">
                                                            Trx: {m.client_trx_id}
                                                        </p>
                                                    )}
                                                    {m.client_sender_info && (
                                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                                            Sender: {m.client_sender_info}
                                                        </p>
                                                    )}
                                                    {m.client_paid_at && (
                                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                                            Paid: {new Date(m.client_paid_at).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                    {m.collected_at && (
                                                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                                                            Verified: {new Date(m.collected_at).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                    {m.refund_trx_id && (
                                                        <p className="font-mono text-[10px] text-rose-500 mt-0.5">
                                                            Refund Trx: {m.refund_trx_id}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 align-top">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                        m.payment_status === 'collected'
                                                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                                            : m.payment_status === 'refunded'
                                                            ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                                            : m.payment_status === 'paid-and-bank-processing'
                                                            ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                                                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                                    }`}>
                                                        {m.status_badge?.short_label || m.payment_status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-black font-mono text-slate-900 dark:text-white whitespace-nowrap align-top">
                                                    {currency} {m.amount.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* FINANCIAL SETTLEMENT SUMMARY LEDGER (FULL WIDTH GRID) */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 relative z-10">
                        <div className="p-5 rounded-2xl bg-slate-50/40 dark:bg-slate-900/30 backdrop-blur-xs border border-slate-200 dark:border-slate-800 space-y-3 text-xs flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-200">
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                    <span>Verified Statement Confirmation</span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                    This document is an authorized, permanent record of project terms, deliverables, and financial settlements for Order #{order.order_number}. All payments are verified and safeguarded.
                                </p>
                            </div>
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                    <span>Payment Settlement:</span>
                                    <span className="text-indigo-600 dark:text-cyan-400">{settlementProgress}% Settled</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full space-y-2.5 p-5 rounded-2xl bg-slate-50/40 dark:bg-slate-900/30 backdrop-blur-xs border border-slate-200 dark:border-slate-800 text-xs">
                            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                <span>Agreed Total Contract Price:</span>
                                <span className="font-bold text-slate-900 dark:text-white font-mono">
                                    {currency} {agreedPrice.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold">
                                <span>Total Paid &amp; Collected:</span>
                                <span className="font-mono">
                                    (+) {currency} {totalCollected.toLocaleString()}
                                </span>
                            </div>

                            {totalProcessing > 0 && (
                                <div className="flex justify-between items-center text-blue-600 dark:text-blue-400">
                                    <span>In-Verification Processing:</span>
                                    <span className="font-bold font-mono">
                                        (~) {currency} {totalProcessing.toLocaleString()}
                                    </span>
                                </div>
                            )}

                            {totalPending > 0 && (
                                <div className="flex justify-between items-center text-amber-600 dark:text-amber-400">
                                    <span>Awaiting Payment:</span>
                                    <span className="font-bold font-mono">
                                        {currency} {totalPending.toLocaleString()}
                                    </span>
                                </div>
                            )}

                            {totalRefunded > 0 && (
                                <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
                                    <span>Returned / Refunded Amount:</span>
                                    <span className="font-bold font-mono">
                                        (-) {currency} {totalRefunded.toLocaleString()}
                                    </span>
                                </div>
                            )}

                            <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                                    Remaining Balance Due:
                                </span>
                                <span className="text-base font-black text-indigo-600 dark:text-cyan-400 font-mono">
                                    {currency} {remainingBalance.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* OFFICIAL BRAND FOOTER WITH LIVE LEDGER DYNAMIC VERIFICATION LINK */}
                    <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs w-full relative z-10">
                        <div className="space-y-1 text-center sm:text-left">
                            <p className="font-bold text-slate-900 dark:text-white">
                                {brandSettings.brand_name || 'CodeVenture Tech'}
                            </p>
                            <p className="text-slate-500 text-[11px]">
                                Engineering &amp; Solutions Department &bull; Support: {brandSettings.contact_email}
                            </p>
                            <p className="text-slate-400 text-[10px] font-mono">
                                Generated on {formattedGeneratedDate} &bull; Order #{order.order_number}
                            </p>
                        </div>

                        <div className="flex items-center space-x-3 bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-950/40 dark:to-cyan-950/30 p-3.5 rounded-2xl border border-indigo-100/80 dark:border-indigo-900/60 shadow-xs max-w-md">
                            <div className="h-10 w-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div className="text-left space-y-0.5 min-w-0">
                                <span className="text-[10px] font-extrabold text-indigo-700 dark:text-cyan-400 uppercase tracking-wider block">
                                    Official Live Ledger Verification
                                </span>
                                <a
                                    href={fullVerificationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-cyan-400 dark:hover:text-cyan-300 group"
                                >
                                    <span className="truncate underline underline-offset-2">{orderShowPath}</span>
                                    <ExternalLink className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// STANDALONE FULL-WIDTH HTML GENERATOR WITH EMBEDDED LOGO AND BACKGROUND WATERMARK
function generateStandaloneReportHtml(
    order: CustomOrder,
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
    currency: string,
    agreedPrice: number,
    totalCollected: number,
    totalProcessing: number,
    totalPending: number,
    totalRefunded: number,
    remainingBalance: number,
    settlementProgress: number,
    statusBadge: { label: string; color: string; description: string },
    milestones: CustomOrderMilestone[],
    fullVerificationUrl: string = ''
): string {
    const brandName = brandSettings.brand_name || 'CodeVenture Tech';
    const contactEmail = brandSettings.contact_email || 'hello@codeventure.tech';
    const contactPhone = brandSettings.contact_phone || '+880 1700-000000';
    const addressLine1 = brandSettings.address_line1 || 'House #42, Road #11, Banani';
    const addressLine2 = brandSettings.address_line2 || 'Dhaka - 1213, Bangladesh';

    const milestonesRows = milestones.length === 0
        ? `<tr><td colspan="6" style="padding: 16px 12px; text-align: center; color: #94a3b8; font-size: 11px;">No structured milestones recorded yet. Total agreed project value: ${currency} ${agreedPrice.toLocaleString()}</td></tr>`
        : milestones.map((m, idx) => {
            let statusBg = '#fef3c7';
            let statusColor = '#d97706';
            if (m.payment_status === 'collected') {
                statusBg = '#dcfce7';
                statusColor = '#15803d';
            } else if (m.payment_status === 'refunded') {
                statusBg = '#fee2e2';
                statusColor = '#b91c1c';
            } else if (m.payment_status === 'paid-and-bank-processing') {
                statusBg = '#dbeafe';
                statusColor = '#1d4ed8';
            }

            const formattedDate = m.due_date ? new Date(m.due_date).toLocaleDateString() : 'Flexible / TBD';
            const method = m.client_payment_method || m.payment_method || 'Online / Bank';
            const clientTrx = m.client_trx_id ? `<div style="font-family: monospace; font-size: 9.5px; color: #4f46e5; margin-top: 1px;">Trx: ${m.client_trx_id}</div>` : '';
            const senderInfo = m.client_sender_info ? `<div style="font-size: 9.5px; color: #64748b; margin-top: 1px;">Sender: ${m.client_sender_info}</div>` : '';
            const paidDate = m.client_paid_at ? `<div style="font-size: 9.5px; color: #64748b; margin-top: 1px;">Paid: ${new Date(m.client_paid_at).toLocaleDateString()}</div>` : '';
            const verifiedDate = m.collected_at ? `<div style="font-size: 9.5px; color: #16a34a; font-weight: 600; margin-top: 1px;">Verified: ${new Date(m.collected_at).toLocaleDateString()}</div>` : '';
            const refundTrx = m.refund_trx_id ? `<div style="font-family: monospace; font-size: 9.5px; color: #ef4444; margin-top: 1px;">Refund Trx: ${m.refund_trx_id}</div>` : '';
            const desc = m.description ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px; line-height: 1.35; word-break: break-word;">${m.description}</div>` : '';

            let deliverableLinks = '';
            if (m.github_repo_url || m.drive_link || m.live_demo_url) {
                deliverableLinks = `
                    <div style="margin-top: 3px; font-size: 9px;">
                        ${m.github_repo_url ? `<span style="display: inline-block; background: #eef2ff; color: #4f46e5; padding: 1px 4px; border-radius: 3px; margin-right: 3px; font-family: monospace;">GitHub</span>` : ''}
                        ${m.drive_link ? `<span style="display: inline-block; background: #ecfeff; color: #0891b2; padding: 1px 4px; border-radius: 3px; margin-right: 3px; font-family: monospace;">Drive</span>` : ''}
                        ${m.live_demo_url ? `<span style="display: inline-block; background: #f0fdf4; color: #16a34a; padding: 1px 4px; border-radius: 3px; margin-right: 3px; font-family: monospace;">Demo</span>` : ''}
                    </div>
                `;
            }

            return `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 8px 10px 10px; font-family: monospace; font-weight: bold; color: #94a3b8; font-size: 10.5px; vertical-align: top;">M${idx + 1}</td>
                    <td style="padding: 10px 8px; vertical-align: top; word-break: break-word;">
                        <div style="font-weight: 700; color: #0f172a; font-size: 11px;">${m.title}</div>
                        ${desc}
                        ${deliverableLinks}
                    </td>
                    <td style="padding: 10px 8px; color: #475569; font-size: 10.5px; white-space: nowrap; vertical-align: top;">${formattedDate}</td>
                    <td style="padding: 10px 8px; color: #475569; font-size: 10.5px; vertical-align: top; word-break: break-word;">
                        <div style="font-weight: 600;">${method}</div>
                        ${clientTrx}
                        ${senderInfo}
                        ${paidDate}
                        ${verifiedDate}
                        ${refundTrx}
                    </td>
                    <td style="padding: 10px 8px; vertical-align: top;">
                        <span style="display: inline-block; padding: 2px 6px; border-radius: 9999px; font-size: 9px; font-weight: 700; background-color: ${statusBg}; color: ${statusColor}; white-space: nowrap;">
                            ${m.status_badge?.short_label || m.payment_status}
                        </span>
                    </td>
                    <td style="padding: 10px 10px 10px 8px; text-align: right; font-weight: 800; font-family: monospace; color: #0f172a; font-size: 11px; white-space: nowrap; vertical-align: top;">
                        ${currency} ${Number(m.amount).toLocaleString()}
                    </td>
                </tr>
            `;
        }).join('');

    return `
    <div id="pdf-statement-doc" style="position: relative; width: 750px; box-sizing: border-box; padding: 24px 28px; background-color: #ffffff; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; line-height: 1.45; text-align: left; overflow: hidden;">
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
            .page-break-before {
                page-break-before: always !important;
                break-before: page !important;
            }
        </style>

        <!-- PAGE 1 CONTAINER -->
        <div style="position: relative; width: 100%; min-height: 960px;">
            <!-- Page 1 Watermark (Centered in Page 1, -45deg, 60% width) -->
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); opacity: 0.25; pointer-events: none; z-index: 0; text-align: center; width: 450px;">
                ${brandSettings.logo ? `
                    <img src="${brandSettings.logo}" alt="Watermark" style="width: 100%; max-height: 350px; object-fit: contain; display: inline-block; opacity: 0.25;" />
                ` : `
                    <div style="font-size: 48px; font-weight: 900; color: #4f46e5; letter-spacing: -1px; text-transform: uppercase; opacity: 0.25;">
                        ${brandName}
                    </div>
                `}
            </div>

            <!-- Page 1 Document Content (z-index: 2) -->
            <div style="position: relative; z-index: 2;">
                <!-- BRAND LOGO & HEADER AT START (FULL WIDTH) -->
                <table class="pdf-avoid-break pdf-card" style="width: 100%; border-collapse: collapse; table-layout: fixed; margin: 0 0 16px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 14px; page-break-inside: avoid !important; break-inside: avoid !important;">
            <tr>
                <td style="vertical-align: top; width: 58%; padding: 0 10px 14px 0; text-align: left;">
                    ${brandSettings.logo ? `
                        <div style="margin-bottom: 3px;">
                            <img src="${brandSettings.logo}" alt="${brandName}" style="height: 38px; width: auto; max-width: 240px; object-fit: contain; display: block;" />
                        </div>
                        <div style="font-size: 10px; color: #64748b; font-weight: 500; margin-top: 2px;">
                            Enterprise Bespoke Software &amp; Cloud Solutions
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
                                        Enterprise Bespoke Software &amp; Cloud Solutions
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
                <td style="vertical-align: top; text-align: right; width: 40%; padding: 0 4px 14px 10px;">
                    <div style="display: inline-block; padding: 3px 8px; border-radius: 9999px; background-color: #e0e7ff; color: #4338ca; font-weight: 800; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.5px;">
                        Project Deal &amp; Settlement Statement
                    </div>
                    <div style="font-family: monospace; font-size: 13px; font-weight: 900; color: #0f172a; margin-top: 5px;">
                        REF #${order.order_number}
                    </div>
                    <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">
                        Date Generated: ${formattedGeneratedDate}
                    </div>
                    <div style="margin-top: 4px;">
                        <span style="display: inline-block; padding: 1.5px 6px; border-radius: 9999px; font-size: 9px; font-weight: 700; background-color: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe;">
                            Status: ${statusBadge.label}
                        </span>
                    </div>
                </td>
            </tr>
        </table>

        <!-- CLIENT & PROJECT SPECIFICATIONS OVERVIEW (FULL WIDTH) -->
        <div class="pdf-avoid-break pdf-card" style="width: 100%; box-sizing: border-box; background-color: rgba(248, 250, 252, 0.4); border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; margin-bottom: 14px; page-break-inside: avoid !important; break-inside: avoid !important;">
            <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
                <tr>
                    <td style="width: 50%; vertical-align: top; padding: 0 10px 0 0; text-align: left;">
                        <div style="font-size: 8.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Client Details</div>
                        <div style="font-weight: 800; font-size: 11.5px; color: #0f172a;">${order.user?.name || 'Authorized Client'}</div>
                        <div style="font-size: 10px; color: #475569; margin-top: 1px;">Email: ${order.client_email || order.user?.email || 'N/A'}</div>
                        <div style="font-size: 10px; color: #475569;">WhatsApp / Phone: ${order.client_whatsapp || order.user?.whatsapp_number || order.user?.phone || 'N/A'}</div>
                        ${order.created_at ? `<div style="font-size: 9.5px; color: #94a3b8; margin-top: 2px;">Initiated: ${new Date(order.created_at).toLocaleDateString()}</div>` : ''}
                    </td>
                    <td style="width: 50%; vertical-align: top; text-align: right; padding: 0 4px 0 10px;">
                        <div style="font-size: 8.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Project Scope &amp; Deliverables</div>
                        <div style="font-weight: 800; font-size: 11.5px; color: #0f172a;">${order.title}</div>
                        <div style="font-size: 10px; color: #475569; margin-top: 1px;">Category: ${order.category || 'Custom Software Development'}</div>
                        <div style="font-size: 10px; color: #475569;">
                            Target Deadline: <strong>${order.target_deadline ? new Date(order.target_deadline).toLocaleDateString() : 'Not Specified'}</strong>
                        </div>
                        ${order.accepted_at ? `<div style="font-size: 9.5px; color: #94a3b8; margin-top: 2px;">Accepted On: ${new Date(order.accepted_at).toLocaleDateString()}</div>` : ''}
                    </td>
                </tr>
            </table>
        </div>

        <!-- DELIVERABLE REPOSITORIES & URLS (IF ANY, FULL WIDTH) -->
        ${(order.github_repo_url || order.drive_link || order.live_demo_url) ? `
        <div class="pdf-avoid-break pdf-card" style="width: 100%; box-sizing: border-box; background-color: rgba(245, 243, 255, 0.4); border: 1px solid #e0e7ff; border-radius: 10px; padding: 10px 14px; margin-bottom: 14px; page-break-inside: avoid !important; break-inside: avoid !important;">
            <div style="font-size: 8.5px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Project Deliverable Repositories &amp; Links</div>
            <table style="width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 9.5px;">
                <tr>
                    ${order.github_repo_url ? `
                    <td style="padding: 2px 6px 2px 0; word-break: break-all;">
                        <strong>GitHub:</strong> <span style="font-family: monospace; color: #334155;">${order.github_repo_url}</span>
                    </td>
                    ` : ''}
                    ${order.drive_link ? `
                    <td style="padding: 2px 6px 2px 0; word-break: break-all;">
                        <strong>Drive:</strong> <span style="font-family: monospace; color: #0891b2;">${order.drive_link}</span>
                    </td>
                    ` : ''}
                    ${order.live_demo_url ? `
                    <td style="padding: 2px 6px 2px 4px; word-break: break-all;">
                        <strong>Live Demo:</strong> <span style="font-family: monospace; color: #16a34a;">${order.live_demo_url}</span>
                    </td>
                    ` : ''}
                </tr>
            </table>
        </div>
        ` : ''}

        <!-- FULL PROJECT TECHNICAL SPECIFICATIONS (FULL WIDTH) -->
        ${order.requirements ? `
        <div class="pdf-avoid-break pdf-card" style="width: 100%; box-sizing: border-box; margin-bottom: 14px; page-break-inside: avoid !important; break-inside: avoid !important;">
            <div style="font-size: 8.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;">Agreed Scope &amp; Technical Specifications</div>
            <div style="width: 100%; box-sizing: border-box; background-color: rgba(255, 255, 255, 0.4); border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; font-size: 10.5px; color: #334155; line-height: 1.5; white-space: pre-line; word-break: break-word;">
                ${order.requirements}
            </div>
        </div>
        ` : ''}

        <!-- REFERENCE LINKS (IF ANY, FULL WIDTH) -->
        ${order.reference_links ? `
        <div class="pdf-avoid-break pdf-card" style="width: 100%; box-sizing: border-box; margin-bottom: 14px; page-break-inside: avoid !important; break-inside: avoid !important;">
            <div style="font-size: 8.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;">Reference Links &amp; Attachments</div>
            <div style="width: 100%; box-sizing: border-box; background-color: rgba(248, 250, 252, 0.4); border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; font-size: 9.5px; color: #475569; line-height: 1.45; white-space: pre-line; word-break: break-word;">
                ${order.reference_links}
            </div>
        </div>
        ` : ''}

        <!-- ITEMIZED MILESTONES & PAYMENTS LEDGER TABLE (FULL WIDTH) -->
        <div class="pdf-avoid-break pdf-card" style="width: 100%; box-sizing: border-box; margin-bottom: 14px; page-break-inside: avoid !important; break-inside: avoid !important;">
            <div style="font-size: 8.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;">Milestone Deliverables &amp; Payment Ledger</div>
            <div style="width: 100%; box-sizing: border-box; background-color: rgba(255, 255, 255, 0.3); border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
                    <thead>
                        <tr class="pdf-avoid-break" style="background-color: rgba(241, 245, 249, 0.45); border-bottom: 1px solid #e2e8f0; page-break-inside: avoid !important; break-inside: avoid !important;">
                            <th style="width: 5%; padding: 8px 6px 8px 10px; font-size: 9px; font-weight: 700; color: #334155; text-transform: uppercase; text-align: left;">#</th>
                            <th style="width: 33%; padding: 8px 8px; font-size: 9px; font-weight: 700; color: #334155; text-transform: uppercase; text-align: left;">Milestone Title &amp; Deliverables</th>
                            <th style="width: 13%; padding: 8px 8px; font-size: 9px; font-weight: 700; color: #334155; text-transform: uppercase; text-align: left;">Due Date</th>
                            <th style="width: 23%; padding: 8px 8px; font-size: 9px; font-weight: 700; color: #334155; text-transform: uppercase; text-align: left;">Payment Channel / Trx</th>
                            <th style="width: 12%; padding: 8px 8px; font-size: 9px; font-weight: 700; color: #334155; text-transform: uppercase; text-align: left;">Status</th>
                            <th style="width: 14%; padding: 8px 10px 8px 6px; font-size: 9px; font-weight: 700; color: #334155; text-transform: uppercase; text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${milestonesRows}
                    </tbody>
                </table>
            </div>
        </div>
            </div>
        </div>

        <!-- PAGE BREAK: FINANCIAL SUMMARY STARTS CLEANLY ON NEXT PAGE -->
        <div class="html2pdf__page-break" style="page-break-before: always !important; break-before: page !important; height: 0; line-height: 0; font-size: 0; margin: 0; padding: 0;"></div>

        <!-- PAGE 2 CONTAINER -->
        <div style="position: relative; width: 100%; min-height: 750px; padding-top: 14px;">
            <!-- Page 2 Watermark (Centered in Page 2, -45deg, 60% width) -->
            <div style="position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); opacity: 0.25; pointer-events: none; z-index: 0; text-align: center; width: 450px;">
                ${brandSettings.logo ? `
                    <img src="${brandSettings.logo}" alt="Watermark" style="width: 100%; max-height: 350px; object-fit: contain; display: inline-block; opacity: 0.25;" />
                ` : `
                    <div style="font-size: 48px; font-weight: 900; color: #4f46e5; letter-spacing: -1px; text-transform: uppercase; opacity: 0.25;">
                        ${brandName}
                    </div>
                `}
            </div>

            <!-- Page 2 Document Content (z-index: 2) -->
            <div style="position: relative; z-index: 2;">
                <!-- FINANCIAL SETTLEMENT SUMMARY (FULL WIDTH 2-COLUMN GRID) -->
                <div class="pdf-avoid-break pdf-card pdf-section" style="width: 100%; box-sizing: border-box; margin-top: 6px; margin-bottom: 14px; page-break-inside: avoid !important; break-inside: avoid !important; break-inside: avoid-page !important;">
                    <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
                        <tr>
                            <td style="vertical-align: top; width: 50%; padding: 0 8px 0 0;">
                                <div style="background-color: rgba(248, 250, 252, 0.4); border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; box-sizing: border-box;">
                                    <div style="font-size: 10.5px; font-weight: 700; color: #059669; margin-bottom: 3px;">✓ Verified Statement Confirmation</div>
                                    <div style="font-size: 9.5px; color: #64748b; line-height: 1.45;">
                                        This document serves as an authorized, verified deal confirmation and financial ledger for Order #${order.order_number}. All recorded payments are guaranteed and protected by ${brandName} agreements.
                                    </div>
                                    <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0; font-size: 9.5px; font-weight: 700; color: #475569;">
                                        Settlement Progress: <span style="color: #4f46e5;">${settlementProgress}% Settled</span>
                                    </div>
                                </div>
                            </td>
                            <td style="vertical-align: top; width: 50%; padding: 0 0 0 8px;">
                                <div style="background-color: rgba(248, 250, 252, 0.4); border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; box-sizing: border-box;">
                                    <table style="width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 9.5px;">
                                        <tr>
                                            <td style="color: #64748b; padding: 2px 0;">Agreed Total Contract Price:</td>
                                            <td style="text-align: right; font-weight: 700; font-family: monospace; color: #0f172a; padding: 2px 2px 2px 0;">${currency} ${agreedPrice.toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td style="color: #16a34a; padding: 2px 0; font-weight: 700;">Total Paid &amp; Collected:</td>
                                            <td style="text-align: right; font-weight: 800; font-family: monospace; color: #16a34a; padding: 2px 2px 2px 0;">(+) ${currency} ${totalCollected.toLocaleString()}</td>
                                        </tr>
                                        ${totalProcessing > 0 ? `
                                        <tr>
                                            <td style="color: #2563eb; padding: 2px 0;">In-Verification Processing:</td>
                                            <td style="text-align: right; font-weight: 700; font-family: monospace; color: #2563eb; padding: 2px 2px 2px 0;">(~) ${currency} ${totalProcessing.toLocaleString()}</td>
                                        </tr>
                                        ` : ''}
                                        ${totalPending > 0 ? `
                                        <tr>
                                            <td style="color: #d97706; padding: 2px 0;">Awaiting Client Payment:</td>
                                            <td style="text-align: right; font-weight: 700; font-family: monospace; color: #d97706; padding: 2px 2px 2px 0;">${currency} ${totalPending.toLocaleString()}</td>
                                        </tr>
                                        ` : ''}
                                        ${totalRefunded > 0 ? `
                                        <tr>
                                            <td style="color: #dc2626; padding: 2px 0;">Returned / Refunded:</td>
                                            <td style="text-align: right; font-weight: 700; font-family: monospace; color: #dc2626; padding: 2px 2px 2px 0;">(-) ${currency} ${totalRefunded.toLocaleString()}</td>
                                        </tr>
                                        ` : ''}
                                        <tr style="border-top: 1px solid #e2e8f0;">
                                            <td style="padding-top: 5px; font-weight: 800; font-size: 9.5px; text-transform: uppercase; color: #0f172a;">Remaining Balance Due:</td>
                                            <td style="padding-top: 5px; text-align: right; font-weight: 900; font-family: monospace; font-size: 11.5px; color: #4f46e5; padding-right: 2px;">${currency} ${remainingBalance.toLocaleString()}</td>
                                        </tr>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- OFFICIAL FOOTER & VERIFICATION DYNAMIC LINK (AT LAST OF PDF) -->
                <div class="pdf-avoid-break pdf-card pdf-section" style="width: 100%; box-sizing: border-box; margin-top: 16px; border-top: 1.5px solid #e2e8f0; padding-top: 14px; page-break-inside: avoid !important; break-inside: avoid !important; break-inside: avoid-page !important;">
                    <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
                        <tr>
                            <td style="vertical-align: middle; width: 55%; text-align: left; padding: 0 10px 0 0;">
                                <div style="font-weight: 800; font-size: 11px; color: #0f172a;">${brandName}</div>
                                <div style="font-size: 8.5px; color: #64748b; margin-top: 1.5px;">Engineering &amp; Solutions Department &bull; Support: ${contactEmail}</div>
                                <div style="font-size: 8.5px; color: #94a3b8; font-family: monospace; margin-top: 2px;">Generated on ${formattedGeneratedDate} &bull; Ref #${order.order_number}</div>
                                <div style="font-size: 8.5px; color: #4f46e5; font-weight: 700; margin-top: 4px;">
                                    🔒 Authorized Statement &amp; Deliverables Live Ledger
                                </div>
                            </td>
                            <td style="vertical-align: middle; width: 45%; text-align: right; padding: 0 0 0 12px;">
                                <div style="font-size: 8.5px; font-weight: 700; color: #475569; margin-bottom: 2px;">
                                    Live Ledger Verification Link:
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
    </div>
    `;
}
