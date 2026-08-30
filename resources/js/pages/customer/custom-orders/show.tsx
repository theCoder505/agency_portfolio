import React, { useState, FormEventHandler } from 'react';
import { useForm, router } from '@inertiajs/react';
import { CustomerLayout } from '@/layouts/customer-layout';
import { CustomOrder, CustomOrderMilestone, AppSettings } from '@/types';
import {
    FolderGit2,
    Clock,
    CheckCircle2,
    Globe,
    ExternalLink,
    Copy,
    Github,
    HardDrive,
    CreditCard,
    Calendar,
    X,
    MessageSquare,
    Printer,
    Star,
    RotateCcw,
    AlertTriangle,
    Coins,
    Edit3,
    Award
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { showToast, showSuccessAlert, showConfirmDialog } from '@/lib/swal';
import { getCurrencySymbol, CURRENCY_OPTIONS } from '@/lib/formatters';
import { ProjectReportModal } from '@/components/custom-orders/project-report-modal';

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
    currencySymbol = '৳',
    defaultPaymentSettings,
}: CustomOrderShowProps) {
    const [selectedMilestoneForPayment, setSelectedMilestoneForPayment] = useState<CustomOrderMilestone | null>(null);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

    const agreedPrice = order.agreed_price || order.estimated_budget || 0;
    const totalCollected = order.total_collected_amount || 0;
    const totalProcessing = order.total_processing_amount || 0;
    const totalPending = order.total_pending_amount || 0;
    const totalRefunded = order.total_refunded_amount || 0;
    const remainingBalance = order.remaining_balance ?? Math.max(0, agreedPrice - totalCollected);
    const milestones = order.milestones || [];

    const settlementProgress = order.progress_percentage ?? (agreedPrice > 0 ? Math.min(100, Math.round((totalCollected / agreedPrice) * 100)) : 0);

    const isFullySettled = (order.is_fully_paid ?? false) || (agreedPrice > 0 && remainingBalance <= 0 && totalCollected >= agreedPrice);

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

    // Budget Modification Proposal Form (Sends to Admin for Verification)
    const budgetForm = useForm({
        estimated_budget: order.proposed_budget || order.estimated_budget || order.agreed_price || '',
        currency: order.proposed_currency || order.currency || 'BDT',
        notes: order.proposed_budget_notes || '',
    });

    const handleBudgetSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        budgetForm.post(`/customer/custom-orders/${order.id}/update-budget`, {
            onSuccess: () => {
                setIsBudgetModalOpen(false);
                showSuccessAlert(
                    'Budget Proposal Submitted',
                    'Your proposed budget update has been sent to the administration for verification. It will take effect upon verification.'
                );
            },
            onError: (err) => {
                const firstError = Object.values(err)[0];
                if (firstError) showToast(firstError, 'error');
            },
        });
    };

    // Review / Feedback Form
    const existingReview = order.review;
    const reviewForm = useForm({
        rating: existingReview?.rating || 5,
        review_title: existingReview?.review_title || 'Outstanding Software Delivery & Communication',
        review_text: existingReview?.review_text || '',
        author_role: existingReview?.author_role || 'Verified Customer',
        company: existingReview?.company || '',
    });

    const handleReviewSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        reviewForm.post(`/customer/custom-orders/${order.id}/review`, {
            onSuccess: () => {
                setIsReviewModalOpen(false);
                showSuccessAlert('Review Published', 'Thank you! Your verified client review and testimonial has been submitted.');
            },
            onError: (err) => {
                const firstError = Object.values(err)[0];
                if (firstError) showToast(firstError, 'error');
            },
        });
    };

    // Customer Mark Project Completed
    const handleMarkComplete = async () => {
        if (!isFullySettled) {
            showToast(`Cannot mark as completed: The project must be 100% settled first (Remaining: ${order.currency} ${remainingBalance.toLocaleString()}).`, 'error');
            return;
        }
        const confirmed = await showConfirmDialog(
            'Confirm Project Completion?',
            `Are you sure you want to mark Order #${order.order_number} as Completed & Delivered?`,
            'Yes, Confirm Completion'
        );
        if (confirmed) {
            router.post(`/customer/custom-orders/${order.id}/complete`, {}, {
                onSuccess: () => {
                    showSuccessAlert('Project Completed', 'Order marked as completed! You can now write a review for our engineering team.');
                },
            });
        }
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

                                    {/* Late / Overdue Indicator */}
                                    {order.is_late && (
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center space-x-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            <span>
                                                {order.status === 'completed'
                                                    ? `Delivered ${order.days_overdue} days late`
                                                    : `Overdue by ${order.days_overdue} days`}
                                            </span>
                                        </span>
                                    )}

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

                        <div className="flex flex-wrap items-center gap-3">
                            {/* PDF Report Download Button */}
                            <button
                                type="button"
                                onClick={() => setIsReportModalOpen(true)}
                                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-xs shrink-0"
                            >
                                <Printer className="h-4 w-4 text-indigo-500" />
                                <span>Download PDF Statement</span>
                            </button>

                            {/* Mark Completed Button */}
                            {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'denied' && (
                                <button
                                    type="button"
                                    onClick={handleMarkComplete}
                                    disabled={!isFullySettled}
                                    className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all shrink-0 ${
                                        isFullySettled
                                            ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-75'
                                    }`}
                                    title={
                                        isFullySettled
                                            ? 'Mark as Completed & Delivered'
                                            : `Cannot complete: 100% settlement required (Remaining Due: ${order.currency} ${remainingBalance.toLocaleString()})`
                                    }
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>{isFullySettled ? 'Mark as Completed' : '100% Settlement Required'}</span>
                                </button>
                            )}

                            {/* Review Button - ONLY available when project is completed */}
                            {order.status === 'completed' && (
                                <button
                                    type="button"
                                    onClick={() => setIsReviewModalOpen(true)}
                                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-xs hover:bg-amber-500/20 transition-colors shadow-xs shrink-0"
                                >
                                    <Star className="h-4 w-4 fill-current" />
                                    <span>{order.review ? 'Edit Your Review' : 'Leave a Review'}</span>
                                </button>
                            )}

                            {/* WhatsApp Discussion Button */}
                            {whatsappUrl && (
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors shadow-sm shrink-0"
                                >
                                    <WhatsAppIcon className="h-4 w-4" />
                                    <span>Send Message</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* CLIENT BUDGET UPDATE PENDING BANNER */}
                    {order.has_pending_budget_request && (
                        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start space-x-3 text-xs">
                            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-bold text-amber-900 dark:text-amber-200">
                                    Budget Revision Request Under Verification:
                                </p>
                                <p className="text-amber-800 dark:text-amber-300">
                                    You requested to update project budget to{' '}
                                    <strong className="font-bold font-mono">
                                        {order.proposed_currency || order.currency} {order.proposed_budget?.toLocaleString()}
                                    </strong>
                                    . Our financial & management team will review and apply this proposal shortly.
                                </p>
                                {order.proposed_budget_notes && (
                                    <p className="text-[11px] text-amber-700 dark:text-amber-400 italic">
                                        Note: "{order.proposed_budget_notes}"
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* FINANCIALS & DEADLINE SUMMARY GRID */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 relative group">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Agreed Total Price
                                </span>
                                {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'denied' && (
                                    <button
                                        type="button"
                                        onClick={() => setIsBudgetModalOpen(true)}
                                        className="text-indigo-500 hover:text-indigo-600 p-0.5 rounded-md hover:bg-indigo-50 dark:hover:bg-slate-800"
                                        title="Propose Revised Budget"
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                            <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                                {order.currency} {agreedPrice.toLocaleString()}
                            </span>
                            {order.estimated_budget && order.estimated_budget !== agreedPrice && (
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                    Client Budget: {order.currency} {order.estimated_budget.toLocaleString()}
                                </span>
                            )}
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Collected (Received)
                            </span>
                            <span className="text-xl font-black text-emerald-500 mt-1 block">
                                {order.currency} {totalCollected.toLocaleString()}
                            </span>
                            {totalRefunded > 0 && (
                                <span className="text-[10px] text-rose-500 block mt-0.5 font-bold">
                                    Returned: {order.currency} {totalRefunded.toLocaleString()}
                                </span>
                            )}
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Remaining Due
                            </span>
                            <span className="text-xl font-black text-indigo-600 dark:text-cyan-400 mt-1 block">
                                {order.currency} {remainingBalance.toLocaleString()}
                            </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Target Completion
                            </span>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1 block">
                                {order.target_deadline ? new Date(order.target_deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'To be confirmed'}
                            </span>
                            {order.is_late && (
                                <span className="text-[10px] text-rose-500 font-bold block mt-0.5">
                                    Delayed: {order.days_overdue} days
                                </span>
                            )}
                        </div>
                    </div>

                    {/* PROJECT & PAYMENT SETTLEMENT PROGRESS BAR (COMPUTED FROM COMPLETED PAYMENTS RESPECT TO AGREED PRICE) */}
                    <div className="space-y-2 pt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold gap-1">
                            <span className="text-slate-700 dark:text-slate-300">
                                Project & Payment Settlement Progress
                            </span>
                            <span className="text-indigo-600 dark:text-cyan-400 font-mono">
                                {order.currency} {totalCollected.toLocaleString()} of {order.currency} {agreedPrice.toLocaleString()} ({settlementProgress}% Settled)
                            </span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(5, settlementProgress)}%` }}
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

                {/* CLIENT REVIEW & TESTIMONIAL CARD */}
                {existingReview && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                    <Award className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                        <span>Your Verified Client Review</span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                                            Verified Delivery
                                        </span>
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        This testimonial is featured on our client showcase.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsReviewModalOpen(true)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-cyan-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition-colors"
                            >
                                Edit Review
                            </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-2">
                            <div className="flex items-center space-x-1 text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < existingReview.rating ? 'fill-current' : 'text-slate-300'}`}
                                    />
                                ))}
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                                    {existingReview.rating}.0 / 5.0
                                </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {existingReview.review_title}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                {existingReview.review_text}
                            </p>
                        </div>
                    </div>
                )}

                {/* MILESTONES PAYMENT SECTION */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
                                const isRefunded = m.payment_status === 'refunded';

                                return (
                                    <div
                                        key={m.id}
                                        className={`bg-white dark:bg-slate-900 rounded-3xl border ${
                                            isRefunded
                                                ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/10'
                                                : 'border-slate-200/80 dark:border-slate-800'
                                        } p-6 shadow-xs space-y-5`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center space-x-3">
                                                <div className={`h-9 w-9 rounded-xl ${
                                                    isRefunded ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                                } flex items-center justify-center font-black text-xs`}>
                                                    M{index + 1}
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                                        {m.title}
                                                    </h3>
                                                    {m.due_date && (
                                                        <div className="flex items-center space-x-2 mt-0.5">
                                                            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>Due: {new Date(m.due_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                            </span>
                                                            {m.is_late && (
                                                                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.2 rounded">
                                                                    Overdue {m.days_overdue}d
                                                                </span>
                                                            )}
                                                        </div>
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
                                                        : isRefunded
                                                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
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

                                        {/* REFUND NOTICE (IF REFUNDED) */}
                                        {isRefunded && (
                                            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 space-y-1.5 text-xs">
                                                <div className="flex items-center space-x-2 font-bold text-rose-800 dark:text-rose-300">
                                                    <RotateCcw className="h-4 w-4 text-rose-500" />
                                                    <span>Payment Returned / Refunded ({order.currency} {(m.refund_amount || m.amount).toLocaleString()})</span>
                                                </div>
                                                {m.refund_trx_id && (
                                                    <p className="text-[11px] font-mono text-rose-700 dark:text-rose-400">
                                                        Refund Trx Ref: {m.refund_trx_id}
                                                    </p>
                                                )}
                                                {m.refund_reason && (
                                                    <p className="text-[11px] text-rose-700 dark:text-rose-400 italic">
                                                        Reason: "{m.refund_reason}"
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* PAYMENT INSTRUCTIONS BOX */}
                                        {!isRefunded && (m.payment_details || m.payment_instructions || m.payment_method) && (
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
                                                            onClick={() => handleCopy(m.payment_details || '', `Payment details for M${index + 1}`)}
                                                            className="text-slate-400 hover:text-indigo-500 p-1"
                                                            title="Copy"
                                                        >
                                                            <Copy className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                )}

                                                {m.payment_instructions && (
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                        {m.payment_instructions}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* SUBMIT PAYMENT BUTTON / STATUS */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                                            {m.payment_status === 'waiting-client-to-pay' && (
                                                <button
                                                    type="button"
                                                    onClick={() => openPaymentModal(m)}
                                                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all self-start"
                                                >
                                                    <CreditCard className="h-4 w-4" />
                                                    <span>Submit Payment Proof for M{index + 1}</span>
                                                </button>
                                            )}

                                            {m.payment_status === 'paid-and-bank-processing' && (
                                                <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800">
                                                    <Clock className="h-4 w-4" />
                                                    <span>Payment submitted (Trx: {m.client_trx_id}). Verifying reference.</span>
                                                </div>
                                            )}

                                            {m.payment_status === 'collected' && (
                                                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span>Payment settled & verified.</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* PAYMENT SUBMISSION MODAL WITH PROPER DUE DATE DISPLAY */}
            {selectedMilestoneForPayment && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
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

                        {/* DUE DATE CARD IN PAYMENT POPUP */}
                        {selectedMilestoneForPayment.due_date && (
                            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-200 font-bold">
                                    <Calendar className="h-4 w-4 text-indigo-500" />
                                    <span>
                                        Milestone Due Date:{' '}
                                        {new Date(selectedMilestoneForPayment.due_date).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                                {selectedMilestoneForPayment.is_late && (
                                    <span className="text-[10px] font-bold text-rose-500 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded-full">
                                        Overdue {selectedMilestoneForPayment.days_overdue} days
                                    </span>
                                )}
                            </div>
                        )}

                        <form onSubmit={handlePaymentSubmit} className="space-y-4">
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

            {/* CLIENT BUDGET UPDATE PROPOSAL MODAL */}
            {isBudgetModalOpen && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                    <Coins className="h-5 w-5 text-indigo-500" />
                                    <span>Propose Revised Budget & Currency</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Request a revised budget for Order #{order.order_number} (Requires Admin Verification).
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsBudgetModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                            <p className="font-bold">Admin Verification Notice:</p>
                            <p className="text-[11px] leading-relaxed">
                                To protect agreement integrity, your budget proposal will be sent to the administration team for verification before active pricing is modified.
                            </p>
                        </div>

                        <form onSubmit={handleBudgetSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                                    <span>Currency</span>
                                    <span className="text-[10px] text-indigo-500 font-bold">Default: BDT (৳)</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {CURRENCY_OPTIONS.map((cur) => (
                                        <button
                                            key={cur.code}
                                            type="button"
                                            onClick={() => budgetForm.setData('currency', cur.code)}
                                            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border ${
                                                budgetForm.data.currency === cur.code
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                            }`}
                                        >
                                            <span className="font-mono">{cur.symbol}</span>
                                            <span>{cur.code}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Your Proposed Budget ({getCurrencySymbol(budgetForm.data.currency)}) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                                        {getCurrencySymbol(budgetForm.data.currency)}
                                    </span>
                                    <input
                                        type="number"
                                        min="1"
                                        step="any"
                                        value={budgetForm.data.estimated_budget}
                                        onChange={(e) => budgetForm.setData('estimated_budget', e.target.value)}
                                        placeholder="e.g. 50000"
                                        required
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                {budgetForm.errors.estimated_budget && (
                                    <p className="text-rose-500 text-xs mt-1">{budgetForm.errors.estimated_budget}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Reason / Scope Details for Revision
                                </label>
                                <textarea
                                    rows={3}
                                    value={budgetForm.data.notes}
                                    onChange={(e) => budgetForm.setData('notes', e.target.value)}
                                    placeholder="Explain the scope update or new financial expectations for our software team..."
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsBudgetModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={budgetForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center space-x-1.5"
                                >
                                    <Coins className="h-4 w-4" />
                                    <span>{budgetForm.processing ? 'Submitting...' : 'Submit for Verification'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CLIENT REVIEW & TESTIMONIAL MODAL */}
            {isReviewModalOpen && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                    <Star className="h-5 w-5 text-amber-500 fill-current" />
                                    <span>{existingReview ? 'Update Your Review' : 'Rate & Review Project'}</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Share your experience with CodeVenture Tech engineers for Order #{order.order_number}.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsReviewModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                    Your Rating <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex items-center space-x-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => reviewForm.setData('rating', star)}
                                            className="p-1 rounded-lg hover:scale-110 transition-transform"
                                        >
                                            <Star
                                                className={`h-7 w-7 ${
                                                    star <= reviewForm.data.rating
                                                        ? 'text-amber-500 fill-current'
                                                        : 'text-slate-300 dark:text-slate-700'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-2 font-mono">
                                        ({reviewForm.data.rating} / 5 Stars)
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Headline / Review Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={reviewForm.data.review_title}
                                    onChange={(e) => reviewForm.setData('review_title', e.target.value)}
                                    placeholder="e.g. Exceptional Engineering & Clean Architecture"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                                />
                                {reviewForm.errors.review_title && (
                                    <p className="text-rose-500 text-xs mt-1">{reviewForm.errors.review_title}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Detailed Feedback & Testimonial <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows={4}
                                    value={reviewForm.data.review_text}
                                    onChange={(e) => reviewForm.setData('review_text', e.target.value)}
                                    placeholder="Tell us about the project execution, technical competence, and deliverables quality..."
                                    required
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                                />
                                {reviewForm.errors.review_text && (
                                    <p className="text-rose-500 text-xs mt-1">{reviewForm.errors.review_text}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Your Role / Title
                                    </label>
                                    <input
                                        type="text"
                                        value={reviewForm.data.author_role}
                                        onChange={(e) => reviewForm.setData('author_role', e.target.value)}
                                        placeholder="e.g. Founder & CTO"
                                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        value={reviewForm.data.company}
                                        onChange={(e) => reviewForm.setData('company', e.target.value)}
                                        placeholder="e.g. Acme Tech Inc."
                                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsReviewModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={reviewForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-bold text-xs shadow-md hover:opacity-95 disabled:opacity-50"
                                >
                                    {reviewForm.processing ? 'Saving...' : 'Submit Verified Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PRINTABLE PDF REPORT MODAL */}
            <ProjectReportModal
                order={order}
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                brandSettings={{
                    currency_symbol: currencySymbol,
                    brand_name: appSettings?.brand_name || 'CodeVenture Tech',
                    logo: appSettings?.logo,
                    contact_email: appSettings?.contact_email || 'hello@codeventure.tech',
                    contact_phone: appSettings?.contact_phone || '+880 1700-000000',
                    address_line1: appSettings?.address_line1 || 'House #42, Road #11, Banani',
                    address_line2: appSettings?.address_line2 || 'Dhaka - 1213, Bangladesh',
                }}
            />
        </CustomerLayout>
    );
}
