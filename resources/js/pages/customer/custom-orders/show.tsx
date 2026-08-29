import React, { useState, FormEventHandler } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { CustomerLayout } from '@/layouts/customer-layout';
import { CustomOrder, CustomOrderMilestone, AppSettings } from '@/types';
import {
    FolderGit2,
    Clock,
    CheckCircle2,
    AlertCircle,
    Globe,
    Key,
    ExternalLink,
    Copy,
    Check,
    Receipt,
    Shield,
    Smartphone,
    ArrowRight,
    Lock,
    Eye,
    EyeOff,
    Github,
    HardDrive,
    CreditCard,
    DollarSign,
    Building2,
    Calendar,
    Layers,
    FileText,
    UploadCloud,
    X,
    MessageSquare,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { showToast, showSuccessAlert } from '@/lib/swal';

interface CustomOrderShowProps {
    order: CustomOrder;
    appSettings: AppSettings;
    currencySymbol: string;
    defaultPaymentSettings: {
        currency_symbol: string;
        currency_code: string;
        bkash_number: string;
        bkash_instructions: string;
        nagad_number: string;
        nagad_instructions: string;
    };
}

export default function CustomOrderShow({
    order,
    appSettings,
    currencySymbol = '$',
    defaultPaymentSettings,
}: CustomOrderShowProps) {
    const [selectedMilestoneForPayment, setSelectedMilestoneForPayment] = useState<CustomOrderMilestone | null>(null);
    const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

    const agreedPrice = order.agreed_price || order.estimated_budget || 0;
    const totalCollected = order.total_collected_amount || 0;
    const totalProcessing = order.total_processing_amount || 0;
    const totalPending = order.total_pending_amount || 0;
    const milestones = order.milestones || [];

    const statusBadge = order.status_badge || { label: order.status, color: 'slate', description: '' };

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedLabel(label);
        showToast(`${label} copied to clipboard!`, 'success');
        setTimeout(() => setCopiedLabel(null), 2500);
    };

    // Payment Form
    const { data, setData, post, processing, errors, reset } = useForm({
        client_payment_method: 'Payoneer',
        client_trx_id: '',
        client_sender_info: '',
        client_payment_proof: null as File | null,
        client_payment_notes: '',
    });

    const openPaymentModal = (milestone: CustomOrderMilestone) => {
        setSelectedMilestoneForPayment(milestone);
        setData({
            client_payment_method: milestone.payment_method || 'Payoneer',
            client_trx_id: '',
            client_sender_info: '',
            client_payment_proof: null,
            client_payment_notes: '',
        });
    };

    const handlePaymentSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!selectedMilestoneForPayment) return;

        post(`/customer/custom-orders/${order.id}/milestones/${selectedMilestoneForPayment.id}/submit-payment`, {
            forceFormData: true,
            onSuccess: () => {
                setSelectedMilestoneForPayment(null);
                reset();
                showSuccessAlert('Payment Submitted', 'Your payment proof has been submitted. Our financial team will verify it shortly.');
            },
            onError: (err) => {
                const firstError = Object.values(err)[0];
                if (firstError) showToast(firstError, 'error');
            },
        });
    };

    const whatsappNumber = appSettings?.whatsapp_number;
    const cleanWhatsapp = whatsappNumber ? whatsappNumber.replace(/[^0-9]/g, '') : '';
    const whatsappPrompt = `Hello CodeVenture Tech! I am reaching out regarding my custom project #${order.order_number} (${order.title}).`;
    const whatsappUrl = cleanWhatsapp ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(whatsappPrompt)}` : '';

    return (
        <CustomerLayout
            title={`Project Workspace - ${order.title}`}
            breadcrumbs={[
                { title: 'Custom Projects', href: '/customer/custom-orders' },
                { title: `#${order.order_number}` },
            ]}
        >
            <div className="space-y-8 max-w-6xl mx-auto">
                {/* PROJECT HEADER CARD */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-start space-x-4 min-w-0">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                                <FolderGit2 className="h-7 w-7" />
                            </div>
                            <div className="min-w-0 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-xs font-black text-indigo-600 dark:text-cyan-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800">
                                        #{order.order_number}
                                    </span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                        statusBadge.color === 'emerald'
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                            : statusBadge.color === 'amber'
                                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                            : statusBadge.color === 'indigo' || statusBadge.color === 'blue'
                                            ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                    }`}>
                                        {statusBadge.label}
                                    </span>
                                    {order.category && (
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            &bull; {order.category}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                                    {order.title}
                                </h1>
                            </div>
                        </div>

                        {/* WhatsApp Discussion Button */}
                        {whatsappUrl && (
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors shadow-sm shrink-0"
                            >
                                <WhatsAppIcon className="h-4 w-4" />
                                <span>Chat with Assigned Engineer</span>
                            </a>
                        )}
                    </div>

                    {/* FINANCIALS & DEADLINE SUMMARY GRID */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Total Agreed Price
                            </span>
                            <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                                {order.currency} {agreedPrice.toLocaleString()}
                            </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Collected (Received)
                            </span>
                            <span className="text-xl font-black text-emerald-500 mt-1 block">
                                {order.currency} {totalCollected.toLocaleString()}
                            </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Processing / Verification
                            </span>
                            <span className="text-xl font-black text-blue-500 mt-1 block">
                                {order.currency} {totalProcessing.toLocaleString()}
                            </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Target Completion
                            </span>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1 block">
                                {order.target_deadline ? new Date(order.target_deadline).toLocaleDateString() : 'To be confirmed'}
                            </span>
                        </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-600 dark:text-slate-300">
                                Project & Payment Settlement Progress
                            </span>
                            <span className="text-indigo-600 dark:text-cyan-400">
                                {order.progress_percentage || 0}%
                            </span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-500"
                                style={{ width: `${order.progress_percentage || 5}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* CODEBASE & DELIVERABLES HUB (IF SHARED) */}
                {(order.github_repo_url || order.drive_link || order.live_demo_url) && (
                    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-500/30 p-6 sm:p-8 shadow-md space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center">
                                    <FolderGit2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-white">
                                        Source Code & Deliverables Hub
                                    </h2>
                                    <p className="text-xs text-slate-300">
                                        Access your production source code repositories and cloud storage archives.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                            {order.github_repo_url && (
                                <a
                                    href={order.github_repo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Github className="h-6 w-6 text-purple-300" />
                                        <div>
                                            <span className="text-xs font-bold text-white block">GitHub Repository</span>
                                            <span className="text-[10px] text-slate-300">Source Code Access</span>
                                        </div>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                                </a>
                            )}

                            {order.drive_link && (
                                <a
                                    href={order.drive_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center space-x-3">
                                        <HardDrive className="h-6 w-6 text-cyan-300" />
                                        <div>
                                            <span className="text-xs font-bold text-white block">Google Drive Cloud</span>
                                            <span className="text-[10px] text-slate-300">Assets & Archives</span>
                                        </div>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                                </a>
                            )}

                            {order.live_demo_url && (
                                <a
                                    href={order.live_demo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Globe className="h-6 w-6 text-emerald-300" />
                                        <div>
                                            <span className="text-xs font-bold text-white block">Live Staging Preview</span>
                                            <span className="text-[10px] text-slate-300">Interactive Demo</span>
                                        </div>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* ARCHITECT NOTES BANNER */}
                {order.admin_notes && (
                    <div className="bg-indigo-50/70 dark:bg-indigo-950/30 rounded-3xl border border-indigo-200/60 dark:border-indigo-800/60 p-6 space-y-2">
                        <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4 text-indigo-500" />
                            <span>Notes & Terms from Engineering Team:</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-indigo-950 dark:text-indigo-100 whitespace-pre-line leading-relaxed">
                            {order.admin_notes}
                        </p>
                    </div>
                )}

                {/* MILESTONES PAYMENT SECTION */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Payment Milestones & Deliverables
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Settled amounts, payment instructions (Payoneer, PayPal, Bank), and submission status.
                            </p>
                        </div>
                    </div>

                    {milestones.length === 0 ? (
                        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                            <div className="h-12 w-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                <Clock className="h-6 w-6" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Milestones Being Structured
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                Our engineering leadership is currently finalizing the milestones breakdown and payment channels for this project.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {milestones.map((m, index) => {
                                const mBadge = m.status_badge || { label: m.payment_status, color: 'slate', short_label: m.payment_status };

                                return (
                                    <div
                                        key={m.id}
                                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs">
                                                    M{index + 1}
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                                        {m.title}
                                                    </h3>
                                                    {m.due_date && (
                                                        <span className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>Target Due: {new Date(m.due_date).toLocaleDateString()}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <span className="text-lg font-black text-slate-900 dark:text-white">
                                                    {order.currency} {m.amount.toLocaleString()}
                                                </span>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    m.payment_status === 'collected'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                        : m.payment_status === 'paid-and-bank-processing'
                                                        ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                }`}>
                                                    {mBadge.label}
                                                </span>
                                            </div>
                                        </div>

                                        {m.description && (
                                            <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                                {m.description}
                                            </p>
                                        )}

                                        {/* PAYMENT INSTRUCTIONS BOX (If Provided by Admin) */}
                                        {(m.payment_details || m.payment_instructions || m.payment_method) && (
                                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                                                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-200">
                                                    <span className="flex items-center space-x-1.5">
                                                        <CreditCard className="h-3.5 w-3.5 text-indigo-500" />
                                                        <span>Payment Instructions ({m.payment_method || 'Online / Bank'})</span>
                                                    </span>
                                                </div>

                                                {m.payment_details && (
                                                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-slate-800 dark:text-slate-200 whitespace-pre-line flex items-start justify-between gap-2">
                                                        <span className="select-all">{m.payment_details}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopy(m.payment_details || '', `Milestone ${index + 1} Details`)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 transition-colors shrink-0"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}

                                                {m.payment_instructions && (
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                                                        Note: {m.payment_instructions}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* MILESTONE DELIVERABLES IF UNLOCKED */}
                                        {m.has_deliverables && m.is_deliverable_unlocked && (
                                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                                                <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                                    <span>Phase Deliverables Unlocked:</span>
                                                </span>
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {m.github_repo_url && (
                                                        <a
                                                            href={m.github_repo_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                                                        >
                                                            <Github className="h-3.5 w-3.5" />
                                                            <span>GitHub Repository</span>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                    {m.drive_link && (
                                                        <a
                                                            href={m.drive_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500"
                                                        >
                                                            <HardDrive className="h-3.5 w-3.5" />
                                                            <span>Google Drive Link</span>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                    {m.live_demo_url && (
                                                        <a
                                                            href={m.live_demo_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500"
                                                        >
                                                            <Globe className="h-3.5 w-3.5" />
                                                            <span>Demo URL</span>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                                {m.deliverable_notes && (
                                                    <p className="text-xs text-slate-300 mt-1">
                                                        {m.deliverable_notes}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* ACTION BAR PER MILESTONE STATUS */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                                            {m.payment_status === 'waiting-client-to-pay' ? (
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="text-xs text-amber-500 font-semibold flex items-center space-x-1.5">
                                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                                        <span>Awaiting client payment for this phase.</span>
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => openPaymentModal(m)}
                                                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center space-x-1.5 shrink-0"
                                                    >
                                                        <CreditCard className="h-3.5 w-3.5" />
                                                        <span>Submit Payment Proof</span>
                                                    </button>
                                                </div>
                                            ) : m.payment_status === 'paid-and-bank-processing' ? (
                                                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs w-full space-y-1">
                                                    <div className="flex items-center justify-between text-blue-400 font-bold">
                                                        <span className="flex items-center space-x-1.5">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            <span>Transaction Submitted & Under Bank Verification</span>
                                                        </span>
                                                        <span className="font-mono">{m.client_trx_id}</span>
                                                    </div>
                                                    <p className="text-slate-400 text-[11px]">
                                                        Submitted via {m.client_payment_method} on {m.client_paid_at ? new Date(m.client_paid_at).toLocaleString() : 'recently'}. Once cleared in account, status updates to collected.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-2 text-xs text-emerald-500 font-bold">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span>Payment confirmed & collected in account on {m.collected_at ? new Date(m.collected_at).toLocaleDateString() : 'verified'}.</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ORIGINAL REQUIREMENTS & ATTACHMENTS ACCORDION */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Project Specifications & Request Details
                    </h3>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                        {order.requirements}
                    </div>

                    {order.reference_links && (
                        <div className="text-xs space-y-1">
                            <span className="font-bold text-slate-500">Reference Links:</span>
                            <p className="font-mono text-cyan-600 dark:text-cyan-400 break-all">
                                {order.reference_links}
                            </p>
                        </div>
                    )}

                    {order.attachments && order.attachments.length > 0 && (
                        <div className="space-y-2 pt-2">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Attached Requirements Files:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {order.attachments.map((att, i) => (
                                    <a
                                        key={i}
                                        href={att.path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-indigo-500 hover:text-white transition-colors"
                                    >
                                        <FileText className="h-3.5 w-3.5" />
                                        <span>{att.name}</span>
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* PAYMENT SUBMISSION MODAL */}
            {selectedMilestoneForPayment && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Submit Milestone Payment
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {selectedMilestoneForPayment.title} &bull; {order.currency} {selectedMilestoneForPayment.amount.toLocaleString()}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedMilestoneForPayment(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handlePaymentSubmit} className="space-y-4">
                            {/* Payment Method Selector */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Payment Method Used <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.client_payment_method}
                                    onChange={(e) => setData('client_payment_method', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="Payoneer">Payoneer (Transfer / Payment Link)</option>
                                    <option value="PayPal">PayPal (Link / Direct Transfer)</option>
                                    <option value="Bank Transfer">Bank Wire Transfer (SWIFT / IBAN / ACH)</option>
                                    <option value="bKash">bKash (Personal / Merchant)</option>
                                    <option value="Nagad">Nagad (Personal / Merchant)</option>
                                    <option value="Wise">Wise (TransferWise)</option>
                                    <option value="Stripe">Stripe / Credit Card Link</option>
                                    <option value="Crypto">Crypto (USDT / BTC / ETH)</option>
                                    <option value="Other">Other Gateway</option>
                                </select>
                            </div>

                            {/* Transaction ID */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Transaction ID / Reference Number <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.client_trx_id}
                                    onChange={(e) => setData('client_trx_id', e.target.value)}
                                    placeholder="e.g. 9J82194819 or TRXZ-88912"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-indigo-500"
                                />
                                {errors.client_trx_id && <p className="text-rose-500 text-xs mt-1">{errors.client_trx_id}</p>}
                            </div>

                            {/* Sender Info */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Sender Account / Email / Number
                                </label>
                                <input
                                    type="text"
                                    value={data.client_sender_info}
                                    onChange={(e) => setData('client_sender_info', e.target.value)}
                                    placeholder="e.g. client@domain.com or +1 555-0192"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Payment Proof Receipt Upload */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Upload Receipt / Screenshot (Optional)
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => setData('client_payment_proof', e.target.files ? e.target.files[0] : null)}
                                    accept=".png,.jpg,.jpeg,.pdf,.webp"
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950/60 dark:file:text-indigo-300 hover:file:bg-indigo-100"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Additional Notes (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.client_payment_notes}
                                    onChange={(e) => setData('client_payment_notes', e.target.value)}
                                    placeholder="Any payment reference notes for our finance team..."
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setSelectedMilestoneForPayment(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-bold shadow-md hover:opacity-95 disabled:opacity-50"
                                >
                                    {processing ? 'Submitting...' : 'Confirm Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}
