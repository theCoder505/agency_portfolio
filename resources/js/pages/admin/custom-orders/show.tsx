import React, { useState, FormEventHandler } from 'react';
import { useForm, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { CustomOrder, CustomOrderMilestone, AppSettings } from '@/types';
import { getCurrencySymbol, CURRENCY_OPTIONS } from '@/lib/formatters';
import {
    FolderGit2,
    PlusCircle,
    CheckCircle2,
    Globe,
    Github,
    HardDrive,
    ExternalLink,
    Trash2,
    Edit3,
    Calendar,
    X,
    Save,
    Coins,
    Printer,
    Star,
    ShieldCheck,
    RotateCcw,
    AlertTriangle,
    Check,
    Eye,
    EyeOff,
    Lock
} from 'lucide-react';
import { showToast, showConfirmDialog, showSuccessAlert } from '@/lib/swal';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { ProjectReportModal } from '@/components/custom-orders/project-report-modal';

interface CustomOrderAdminShowProps {
    order: CustomOrder;
    currencySymbol: string;
    appSettings: AppSettings;
}

export default function CustomOrderAdminShow({
    order,
    currencySymbol = '৳',
    appSettings,
}: CustomOrderAdminShowProps) {
    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
    const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isDeliverablesModalOpen, setIsDeliverablesModalOpen] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState<CustomOrderMilestone | null>(null);
    const [refundingMilestone, setRefundingMilestone] = useState<CustomOrderMilestone | null>(null);
    const [isDeliverablesEditing, setIsDeliverablesEditing] = useState(false);

    const isCompleted = order.status === 'completed';

    const agreedPrice = order.agreed_price || order.estimated_budget || 0;
    const totalCollected = order.total_collected_amount || 0;
    const totalProcessing = order.total_processing_amount || 0;
    const totalPending = order.total_pending_amount || 0;
    const totalRefunded = order.total_refunded_amount || 0;
    const remainingBalance = order.remaining_balance ?? Math.max(0, agreedPrice - totalCollected);
    const milestones = order.milestones || [];
    const statusBadge = order.status_badge || { label: order.status, color: 'slate', description: '' };

    const settlementProgress = order.progress_percentage ?? (agreedPrice > 0 ? Math.min(100, Math.round((totalCollected / agreedPrice) * 100)) : 0);

    // Total amount of non-returned/active milestones
    const totalActiveMilestonesAmount = order.total_active_milestones_amount ??
        milestones.filter(m => m.payment_status !== 'refunded').reduce((acc, m) => acc + Number(m.amount), 0);

    // Remaining milestone capacity that can still be created for this order
    const unallocatedMilestoneAmount = order.unallocated_milestone_amount ??
        Math.max(0, agreedPrice - totalActiveMilestonesAmount);

    const isMilestonesFullyAllocated = agreedPrice > 0 && unallocatedMilestoneAmount <= 0;

    // Maximum allowed amount for milestone creation / update
    const maxAllowedMilestoneAmount = editingMilestone
        ? (editingMilestone.payment_status === 'refunded'
            ? unallocatedMilestoneAmount
            : Math.max(0, agreedPrice - (totalActiveMilestonesAmount - Number(editingMilestone.amount))))
        : unallocatedMilestoneAmount;

    // Deliverables Hub Form
    const deliverablesHubForm = useForm({
        github_repo_url: order.github_repo_url || '',
        drive_link: order.drive_link || '',
        live_demo_url: order.live_demo_url || '',
    });

    const handleDeliverablesHubSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        deliverablesHubForm.post(`/admin/custom-orders/${order.id}/deliverables`, {
            onSuccess: () => {
                setIsDeliverablesModalOpen(false);
                showToast('Source code & deliverables hub updated!', 'success');
            },
        });
    };

    // Deliverables & Project Details Form
    const deliverablesForm = useForm({
        title: order.title,
        category: order.category || '',
        client_whatsapp: order.client_whatsapp || order.user?.whatsapp_number || order.user?.phone || '',
        client_email: order.client_email || order.user?.email || '',
        estimated_budget: order.estimated_budget || 0,
        agreed_price: order.agreed_price || 0,
        target_deadline: order.target_deadline ? String(order.target_deadline).substring(0, 10) : '',
        status: order.status,
        admin_notes: order.admin_notes || '',
        requirements: order.requirements,
        reference_links: order.reference_links || '',
        github_repo_url: order.github_repo_url || '',
        drive_link: order.drive_link || '',
        live_demo_url: order.live_demo_url || '',
    });

    const handleDeliverablesSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        deliverablesForm.put(`/admin/custom-orders/${order.id}`, {
            onSuccess: () => {
                setIsDeliverablesEditing(false);
                showToast('Deliverables and project details updated!', 'success');
            },
        });
    };

    // Budget & Currency Update Form
    const budgetForm = useForm<{
        agreed_price: number | string;
        estimated_budget: number | string;
        currency: string;
        exchange_rate_to_bdt: number | string;
        admin_notes: string;
    }>({
        agreed_price: order.agreed_price || order.estimated_budget || 0,
        estimated_budget: order.estimated_budget || 0,
        currency: order.currency || 'BDT',
        exchange_rate_to_bdt: order.exchange_rate_to_bdt || order.effective_exchange_rate || (order.currency === 'EUR' ? 130 : (order.currency === 'USD' ? 120 : 1)),
        admin_notes: order.admin_notes || '',
    });

    const handleBudgetSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        budgetForm.put(`/admin/custom-orders/${order.id}/budget`, {
            onSuccess: () => {
                setIsBudgetModalOpen(false);
                showToast('Budget, currency and exchange rate updated!', 'success');
            },
        });
    };

    // Accept Proposal Form
    const acceptForm = useForm<{
        agreed_price: number | string;
        currency: string;
        exchange_rate_to_bdt: number | string;
        target_deadline: string;
        admin_notes: string;
    }>({
        agreed_price: order.agreed_price || order.estimated_budget || 0,
        currency: order.currency || 'BDT',
        exchange_rate_to_bdt: order.exchange_rate_to_bdt || order.effective_exchange_rate || (order.currency === 'EUR' ? 130 : (order.currency === 'USD' ? 120 : 1)),
        target_deadline: order.target_deadline ? String(order.target_deadline).substring(0, 10) : '',
        admin_notes: order.admin_notes || '',
    });

    const handleAcceptSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        acceptForm.post(`/admin/custom-orders/${order.id}/accept`, {
            onSuccess: () => {
                setIsAcceptModalOpen(false);
                showToast('Custom order accepted and client notified!', 'success');
            },
        });
    };

    // Deny Proposal Form
    const denyForm = useForm({
        rejection_reason: '',
    });

    const handleDenySubmit: FormEventHandler = (e) => {
        e.preventDefault();
        denyForm.post(`/admin/custom-orders/${order.id}/deny`, {
            onSuccess: () => {
                setIsDenyModalOpen(false);
                showToast('Order marked as denied and customer notified.', 'warning');
            },
        });
    };

    // Milestone Form (Create & Edit) with ISO Date slice fix
    const milestoneForm = useForm<{
        title: string;
        description: string;
        amount: string | number;
        due_date: string;
        order: number;
        payment_status: 'waiting-client-to-pay' | 'paid-and-bank-processing' | 'collected' | 'refunded';
        payment_method: string;
        payment_details: string;
        payment_instructions: string;
        github_repo_url: string;
        drive_link: string;
        live_demo_url: string;
        deliverable_notes: string;
        is_deliverable_unlocked: boolean;
    }>({
        title: '',
        description: '',
        amount: '',
        due_date: '',
        order: milestones.length + 1,
        payment_status: 'waiting-client-to-pay',
        payment_method: 'Payoneer',
        payment_details: '',
        payment_instructions: '',
        github_repo_url: '',
        drive_link: '',
        live_demo_url: '',
        deliverable_notes: '',
        is_deliverable_unlocked: true,
    });

    const openAddMilestoneModal = () => {
        if (isMilestonesFullyAllocated) {
            showToast(`Cannot add milestone: Active milestones (${order.currency} ${totalActiveMilestonesAmount.toLocaleString()}) already equal the agreed main contract price (${order.currency} ${agreedPrice.toLocaleString()}).`, 'warning');
            return;
        }

        setEditingMilestone(null);
        milestoneForm.setData({
            title: `Milestone ${milestones.length + 1}: `,
            description: '',
            amount: Math.max(0, unallocatedMilestoneAmount),
            due_date: '',
            order: milestones.length + 1,
            payment_status: 'waiting-client-to-pay',
            payment_method: 'Payoneer',
            payment_details: 'Payoneer Email: payments@codeventure.tech\nPayoneer Payment Link: https://payoneer.com/pay/...',
            payment_instructions: 'Please select Payoneer transfer or payment link and enter the Transaction ID upon payment.',
            github_repo_url: order.github_repo_url || '',
            drive_link: order.drive_link || '',
            live_demo_url: order.live_demo_url || '',
            deliverable_notes: '',
            is_deliverable_unlocked: true,
        });
        setIsMilestoneModalOpen(true);
    };

    const openEditMilestoneModal = (m: CustomOrderMilestone) => {
        if (m.payment_status !== 'waiting-client-to-pay') {
            showToast('Milestones can only be edited while pending payment from client.', 'warning');
            return;
        }
        setEditingMilestone(m);
        milestoneForm.setData({
            title: m.title,
            description: m.description || '',
            amount: m.amount,
            due_date: m.due_date ? String(m.due_date).substring(0, 10) : '',
            order: m.order,
            payment_status: m.payment_status,
            payment_method: m.payment_method || 'Payoneer',
            payment_details: m.payment_details || '',
            payment_instructions: m.payment_instructions || '',
            github_repo_url: m.github_repo_url || '',
            drive_link: m.drive_link || '',
            live_demo_url: m.live_demo_url || '',
            deliverable_notes: m.deliverable_notes || '',
            is_deliverable_unlocked: m.is_deliverable_unlocked ?? true,
        });
        setIsMilestoneModalOpen(true);
    };

    const handleMilestoneSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        const enteredAmount = Number(milestoneForm.data.amount) || 0;
        if (enteredAmount <= 0) {
            showToast('Milestone amount must be greater than zero.', 'error');
            return;
        }

        if (enteredAmount > maxAllowedMilestoneAmount) {
            showToast(`Milestone amount cannot exceed the available contract allowance of ${order.currency} ${maxAllowedMilestoneAmount.toLocaleString()}!`, 'error');
            return;
        }

        if (editingMilestone && editingMilestone.payment_status === 'collected' && milestoneForm.data.payment_status === 'waiting-client-to-pay') {
            showToast('A completed/collected milestone cannot be reverted back to awaiting client payment.', 'error');
            return;
        }

        if (editingMilestone) {
            milestoneForm.put(`/admin/custom-orders/${order.id}/milestones/${editingMilestone.id}`, {
                onSuccess: () => {
                    setIsMilestoneModalOpen(false);
                    showToast('Milestone updated successfully!', 'success');
                },
            });
        } else {
            milestoneForm.post(`/admin/custom-orders/${order.id}/milestones`, {
                onSuccess: () => {
                    setIsMilestoneModalOpen(false);
                    showToast('Milestone added successfully!', 'success');
                },
            });
        }
    };

    const handleQuickMilestoneStatus = (m: CustomOrderMilestone, newStatus: string) => {
        if (m.payment_status === 'collected' && newStatus === 'waiting-client-to-pay') {
            showToast('A completed/collected milestone cannot be reverted back to awaiting client payment.', 'error');
            return;
        }

        router.post(`/admin/custom-orders/${order.id}/milestones/${m.id}/status`, {
            payment_status: newStatus,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                showToast(`Milestone status updated to: ${newStatus}`, 'success');
            },
        });
    };

    const handleDeleteMilestone = async (m: CustomOrderMilestone) => {
        if (m.payment_status !== 'waiting-client-to-pay') {
            showToast('Only pending milestones (awaiting client payment) can be deleted.', 'error');
            return;
        }

        const confirmed = await showConfirmDialog(
            'Delete Pending Milestone?',
            `Are you sure you want to delete pending milestone "${m.title}"?`,
            'Delete Milestone'
        );
        if (confirmed) {
            router.delete(`/admin/custom-orders/${order.id}/milestones/${m.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    showToast(`Pending milestone "${m.title}" removed.`, 'info');
                },
            });
        }
    };

    // Refund / Return Payment Form
    const refundForm = useForm({
        refund_amount: '' as string | number,
        refund_trx_id: '',
        refund_reason: '',
        refunded_at: new Date().toISOString().substring(0, 10),
    });

    const openRefundModal = (m: CustomOrderMilestone) => {
        setRefundingMilestone(m);
        refundForm.setData({
            refund_amount: m.amount,
            refund_trx_id: '',
            refund_reason: 'Client requested refund on project deliverable scope.',
            refunded_at: new Date().toISOString().substring(0, 10),
        });
        setIsRefundModalOpen(true);
    };

    const handleRefundSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!refundingMilestone) return;

        refundForm.post(`/admin/custom-orders/${order.id}/milestones/${refundingMilestone.id}/refund`, {
            onSuccess: () => {
                setIsRefundModalOpen(false);
                showSuccessAlert('Payment Returned', `Milestone '${refundingMilestone.title}' has been marked as refunded.`);
            },
        });
    };

    const isFullySettled = (order.is_fully_paid ?? false) || (agreedPrice > 0 && remainingBalance <= 0 && totalCollected >= agreedPrice);

    // Complete Order Action
    const handleMarkComplete = async () => {
        if (!isFullySettled) {
            showToast(`Cannot mark order as completed: The project must be 100% settled first (Remaining Balance Due: ${order.currency} ${remainingBalance.toLocaleString()}).`, 'error');
            return;
        }

        const confirmed = await showConfirmDialog(
            'Complete & Deliver Project?',
            `Mark Order #${order.order_number} as Completed & Delivered?`,
            'Yes, Mark Completed'
        );
        if (confirmed) {
            router.post(`/admin/custom-orders/${order.id}/complete`, {}, {
                onSuccess: () => {
                    showSuccessAlert('Order Completed', `Order #${order.order_number} marked as Completed & Delivered.`);
                },
            });
        }
    };

    // Budget Request Verification Actions
    const handleApproveBudget = () => {
        router.post(`/admin/custom-orders/${order.id}/budget-requests/approve`, {}, {
            onSuccess: () => {
                showSuccessAlert('Budget Approved', 'Client proposed budget has been approved and applied to the contract.');
            },
        });
    };

    const handleDeclineBudget = async () => {
        const confirmed = await showConfirmDialog(
            'Decline Budget Proposal?',
            'Are you sure you want to decline the client’s requested budget revision?',
            'Yes, Decline'
        );
        if (confirmed) {
            router.post(`/admin/custom-orders/${order.id}/budget-requests/reject`, {}, {
                onSuccess: () => {
                    showToast('Budget update request declined.', 'info');
                },
            });
        }
    };

    // Review Visibility Toggle
    const handleToggleReviewVisibility = () => {
        if (!order.review) return;
        router.post(`/admin/custom-orders/${order.id}/reviews/${order.review.id}/toggle-featured`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                showToast('Review visibility updated!', 'success');
            },
        });
    };

    return (
        <AdminLayout
            title={`Manage Custom Order #${order.order_number}`}
            breadcrumbs={[
                { title: 'Custom Orders', href: '/admin/custom-orders' },
                { title: `#${order.order_number}` },
            ]}
        >
            <div className="space-y-8 max-w-7xl mx-auto">
                {/* COMPLETED IMMUTABILITY BANNER */}
                {isCompleted && (
                    <div className="p-4 sm:p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                        <div className="flex items-center space-x-3.5">
                            <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-xs shrink-0">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                    <span>Project Completed & Delivered</span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                                        Locked & Finalized
                                    </span>
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                                    This project is finalized. All contract deliverables, financial settlements, and milestone payments are archived and immutable.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-slate-950/50 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                            <Lock className="h-3.5 w-3.5 mr-1" />
                            <span>100% Settled & Archived</span>
                        </div>
                    </div>
                )}

                {/* TOP COMMAND BAR */}
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
                                                    ? `Delivered ${order.days_overdue}d late`
                                                    : `Overdue ${order.days_overdue} days`}
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

                        {/* Top Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* PDF Statement Button */}
                            <button
                                type="button"
                                onClick={() => setIsReportModalOpen(true)}
                                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-xs shrink-0"
                            >
                                <Printer className="h-4 w-4 text-indigo-500" />
                                <span>PDF Statement</span>
                            </button>

                            {/* Mark Completed Button */}
                            {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'denied' && (
                                <button
                                    type="button"
                                    onClick={handleMarkComplete}
                                    disabled={!isFullySettled}
                                    className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all shrink-0 ${
                                        isFullySettled
                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-75'
                                    }`}
                                    title={
                                        isFullySettled
                                            ? 'Mark Project as Completed & Delivered'
                                            : `Cannot complete: 100% settlement required (Remaining Due: ${order.currency} ${remainingBalance.toLocaleString()})`
                                    }
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>{isFullySettled ? 'Mark as Completed' : '100% Settlement Required'}</span>
                                </button>
                            )}

                            {order.status === 'pending' && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setIsAcceptModalOpen(true)}
                                        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Accept Project</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsDenyModalOpen(true)}
                                        className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold text-xs hover:bg-rose-100 transition-all"
                                    >
                                        <X className="h-4 w-4" />
                                        <span>Deny Request</span>
                                    </button>
                                </>
                            )}

                            {!isCompleted && (
                                <button
                                    type="button"
                                    onClick={openAddMilestoneModal}
                                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-600 dark:text-cyan-400 font-bold text-xs hover:bg-indigo-100 transition-colors shadow-xs shrink-0"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Add Milestone</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* CLIENT BUDGET REQUEST VERIFICATION BANNER */}
                    {order.has_pending_budget_request && (
                        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start space-x-3 text-xs">
                                <Coins className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                                        Client Requested Budget Revision:
                                    </p>
                                    <p className="text-slate-600 dark:text-slate-300">
                                        Client proposed revised budget to{' '}
                                        <strong className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                            {order.proposed_currency || order.currency} {order.proposed_budget?.toLocaleString()}
                                        </strong>{' '}
                                        (Current: {order.currency} {agreedPrice.toLocaleString()}).
                                    </p>
                                    {order.proposed_budget_notes && (
                                        <p className="text-[11px] text-slate-500 italic">
                                            Client Note: "{order.proposed_budget_notes}"
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={handleApproveBudget}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5"
                                >
                                    <Check className="h-4 w-4" />
                                    <span>Verify & Approve</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeclineBudget}
                                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5"
                                >
                                    <X className="h-4 w-4" />
                                    <span>Decline</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* FINANCIALS & DEADLINE METRICS */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 relative group">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Agreed Contract Value
                                </span>
                                {!isCompleted && (
                                    <button
                                        type="button"
                                        onClick={() => setIsBudgetModalOpen(true)}
                                        className="text-indigo-500 hover:text-indigo-600 p-0.5 rounded-md hover:bg-indigo-50 dark:hover:bg-slate-800"
                                        title="Edit Contract Budget"
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                            <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                                {order.currency} {agreedPrice.toLocaleString()}
                            </span>
                            {order.currency !== 'BDT' && (
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block mt-0.5">
                                    ≈ ৳{((order.agreed_price || order.estimated_budget || 0) * (order.exchange_rate_to_bdt || order.effective_exchange_rate || (order.currency === 'EUR' ? 130 : 120))).toLocaleString()} BDT (Rate: ৳{order.exchange_rate_to_bdt || order.effective_exchange_rate || (order.currency === 'EUR' ? 130 : 120)})
                                </span>
                            )}
                            {order.estimated_budget && order.estimated_budget !== agreedPrice && (
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                    Requested: {order.currency} {order.estimated_budget.toLocaleString()}
                                </span>
                            )}
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Total Collected (Settled)
                            </span>
                            <span className="text-xl font-black text-emerald-500 mt-1 block">
                                {order.currency} {totalCollected.toLocaleString()}
                            </span>
                            {totalRefunded > 0 && (
                                <span className="text-[10px] text-rose-500 font-bold block mt-0.5">
                                    Returned: {order.currency} {totalRefunded.toLocaleString()}
                                </span>
                            )}
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Remaining Balance Due
                            </span>
                            <span className="text-xl font-black text-indigo-600 dark:text-cyan-400 mt-1 block">
                                {order.currency} {remainingBalance.toLocaleString()}
                            </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Target Deadline
                            </span>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1 block">
                                {order.target_deadline ? new Date(order.target_deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Flexible / TBD'}
                            </span>
                            {order.is_late && (
                                <span className="text-[10px] text-rose-500 font-bold block mt-0.5">
                                    Overdue by {order.days_overdue} days
                                </span>
                            )}
                        </div>
                    </div>

                    {/* PROJECT & PAYMENT SETTLEMENT PROGRESS BAR */}
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

                {/* SOURCE CODE & DELIVERABLES HUB */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-500/30 p-6 sm:p-8 shadow-md space-y-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center space-x-3.5">
                            <div className="h-11 w-11 rounded-2xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-400/30">
                                <FolderGit2 className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                                        Source Code & Deliverables Hub
                                    </h2>
                                    {isCompleted && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                                            <Lock className="h-3 w-3 mr-0.5" />
                                            <span>Finalized</span>
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-300">
                                    Manage production repository access, cloud archives, and live staging previews for the client.
                                </p>
                            </div>
                        </div>

                        {!isCompleted && (
                            <button
                                type="button"
                                onClick={() => {
                                    deliverablesHubForm.setData({
                                        github_repo_url: order.github_repo_url || '',
                                        drive_link: order.drive_link || '',
                                        live_demo_url: order.live_demo_url || '',
                                    });
                                    setIsDeliverablesModalOpen(true);
                                }}
                                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all self-start sm:self-auto shrink-0 cursor-pointer"
                            >
                                <Edit3 className="h-4 w-4 text-cyan-300" />
                                <span>Set / Update Deliverables</span>
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 relative z-10">
                        {/* GitHub Repository */}
                        {order.github_repo_url ? (
                            <a
                                href={order.github_repo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center space-x-3 min-w-0">
                                    <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 shrink-0">
                                        <Github className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-xs font-bold text-white block">GitHub Repository</span>
                                        <span className="text-[10px] text-slate-300 truncate block font-mono">
                                            {order.github_repo_url}
                                        </span>
                                    </div>
                                </div>
                                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors shrink-0 ml-2" />
                            </a>
                        ) : (
                            <button
                                type="button"
                                disabled={isCompleted}
                                onClick={() => {
                                    deliverablesHubForm.setData({
                                        github_repo_url: order.github_repo_url || '',
                                        drive_link: order.drive_link || '',
                                        live_demo_url: order.live_demo_url || '',
                                    });
                                    setIsDeliverablesModalOpen(true);
                                }}
                                className={`p-4 rounded-2xl border border-dashed border-white/20 bg-white/5 transition-all text-left flex items-center space-x-3 ${
                                    isCompleted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 hover:border-cyan-400/50 cursor-pointer'
                                }`}
                            >
                                <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400 shrink-0">
                                    <Github className="h-5 w-5" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-300 block">+ Set GitHub Repo</span>
                                    <span className="text-[10px] text-slate-400">No repository linked</span>
                                </div>
                            </button>
                        )}

                        {/* Google Drive Cloud */}
                        {order.drive_link ? (
                            <a
                                href={order.drive_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center space-x-3 min-w-0">
                                    <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0">
                                        <HardDrive className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-xs font-bold text-white block">Google Drive Cloud</span>
                                        <span className="text-[10px] text-slate-300 truncate block font-mono">
                                            {order.drive_link}
                                        </span>
                                    </div>
                                </div>
                                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors shrink-0 ml-2" />
                            </a>
                        ) : (
                            <button
                                type="button"
                                disabled={isCompleted}
                                onClick={() => {
                                    deliverablesHubForm.setData({
                                        github_repo_url: order.github_repo_url || '',
                                        drive_link: order.drive_link || '',
                                        live_demo_url: order.live_demo_url || '',
                                    });
                                    setIsDeliverablesModalOpen(true);
                                }}
                                className={`p-4 rounded-2xl border border-dashed border-white/20 bg-white/5 transition-all text-left flex items-center space-x-3 ${
                                    isCompleted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 hover:border-cyan-400/50 cursor-pointer'
                                }`}
                            >
                                <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400 shrink-0">
                                    <HardDrive className="h-5 w-5" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-300 block">+ Set Google Drive</span>
                                    <span className="text-[10px] text-slate-400">No cloud archive linked</span>
                                </div>
                            </button>
                        )}

                        {/* Live Staging Demo */}
                        {order.live_demo_url ? (
                            <a
                                href={order.live_demo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center space-x-3 min-w-0">
                                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
                                        <Globe className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-xs font-bold text-white block">Live Staging Preview</span>
                                        <span className="text-[10px] text-slate-300 truncate block font-mono">
                                            {order.live_demo_url}
                                        </span>
                                    </div>
                                </div>
                                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors shrink-0 ml-2" />
                            </a>
                        ) : (
                            <button
                                type="button"
                                disabled={isCompleted}
                                onClick={() => {
                                    deliverablesHubForm.setData({
                                        github_repo_url: order.github_repo_url || '',
                                        drive_link: order.drive_link || '',
                                        live_demo_url: order.live_demo_url || '',
                                    });
                                    setIsDeliverablesModalOpen(true);
                                }}
                                className={`p-4 rounded-2xl border border-dashed border-white/20 bg-white/5 transition-all text-left flex items-center space-x-3 ${
                                    isCompleted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 hover:border-cyan-400/50 cursor-pointer'
                                }`}
                            >
                                <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400 shrink-0">
                                    <Globe className="h-5 w-5" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-300 block">+ Set Live Demo URL</span>
                                    <span className="text-[10px] text-slate-400">No demo link deployed</span>
                                </div>
                            </button>
                        )}
                    </div>
                </div>

                {/* CLIENT REVIEW MODERATION CARD (IF SUBMITTED) */}
                {order.review && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                    <Star className="h-5 w-5 fill-current" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                        <span>Client Testimonial & Review</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            order.review.is_featured
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                                        }`}>
                                            {order.review.is_featured ? 'Enabled (Showing to Visitors)' : 'Disabled (Hidden from Visitors)'}
                                        </span>
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Submitted by {order.review.author_name} &bull; {order.review.rating} / 5 Stars
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleToggleReviewVisibility}
                                className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    order.review.is_featured
                                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                                }`}
                            >
                                {order.review.is_featured ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span>{order.review.is_featured ? 'Disable on Frontend' : 'Show on Frontend Showcase'}</span>
                            </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-2">
                            <div className="flex items-center space-x-1 text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < order.review!.rating ? 'fill-current' : 'text-slate-300'}`}
                                    />
                                ))}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {order.review.review_title}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                {order.review.review_text}
                            </p>
                        </div>
                    </div>
                )}

                {/* MILESTONE MANAGEMENT STUDIO */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center space-x-2.5">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Payment Milestones & Deliverables Breakdown
                                </h2>
                                {isMilestonesFullyAllocated ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        100% Contract Allocated
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20 font-mono">
                                        Remaining Allowance: {order.currency} {unallocatedMilestoneAmount.toLocaleString()}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Active Milestones Total: <strong className="text-slate-700 dark:text-slate-300 font-mono">{order.currency} {totalActiveMilestonesAmount.toLocaleString()}</strong> of <strong className="text-slate-700 dark:text-slate-300 font-mono">{order.currency} {agreedPrice.toLocaleString()}</strong> agreed contract price.
                            </p>
                        </div>

                        {!isCompleted ? (
                            <button
                                type="button"
                                onClick={openAddMilestoneModal}
                                disabled={isMilestonesFullyAllocated}
                                className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all self-start sm:self-auto ${
                                    isMilestonesFullyAllocated
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-80'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                                }`}
                                title={isMilestonesFullyAllocated ? 'Main agreed contract price is 100% allocated across active milestones' : 'Add New Milestone'}
                            >
                                <PlusCircle className="h-4 w-4" />
                                <span>{isMilestonesFullyAllocated ? 'Milestones Fully Allocated' : 'Add New Milestone'}</span>
                            </button>
                        ) : (
                            <span className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold border border-slate-200 dark:border-slate-700">
                                <Lock className="h-3.5 w-3.5" />
                                <span>Milestones Archived & Locked</span>
                            </span>
                        )}
                    </div>

                    {milestones.length === 0 ? (
                        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
                            <div className="h-12 w-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center">
                                <PlusCircle className="h-6 w-6" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                No milestones added yet
                            </h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                Create initial payment phases with designated due dates and payment channels.
                            </p>
                            <button
                                type="button"
                                onClick={openAddMilestoneModal}
                                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700"
                            >
                                Add First Milestone
                            </button>
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
                                                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                                                        <span>Sequence #{m.order}</span>
                                                        {m.due_date && (
                                                            <span className="flex items-center space-x-1">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>Due: {new Date(m.due_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                            </span>
                                                        )}
                                                        {m.is_late && (
                                                            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.2 rounded">
                                                                Overdue {m.days_overdue}d
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
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

                                        {/* REFUND RECORD DISPLAY */}
                                        {isRefunded && (
                                            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 space-y-1.5 text-xs">
                                                <div className="flex items-center space-x-2 font-bold text-rose-800 dark:text-rose-300">
                                                    <RotateCcw className="h-4 w-4 text-rose-500" />
                                                    <span>Payment Returned / Refunded: {order.currency} {(m.refund_amount || m.amount).toLocaleString()}</span>
                                                </div>
                                                {m.refund_trx_id && (
                                                    <p className="font-mono text-rose-700 dark:text-rose-400 text-[11px]">
                                                        Refund Transaction Reference: {m.refund_trx_id}
                                                    </p>
                                                )}
                                                {m.refund_reason && (
                                                    <p className="text-rose-700 dark:text-rose-400 text-[11px] italic">
                                                        Refund Reason: "{m.refund_reason}"
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* CLIENT PAYMENT SUBMISSION INFO (IF SUBMITTED) */}
                                        {m.client_trx_id && (
                                            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 space-y-2 text-xs">
                                                <div className="flex items-center justify-between font-bold text-blue-950 dark:text-blue-200">
                                                    <span>Client Payment Submission Reference:</span>
                                                    <span className="font-mono text-[11px]">{m.client_paid_at ? new Date(m.client_paid_at).toLocaleString() : ''}</span>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                                                    <div>
                                                        <span className="text-slate-400 block">Method Used:</span>
                                                        <span className="font-bold text-slate-800 dark:text-slate-200">{m.client_payment_method}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block">Trx Reference:</span>
                                                        <span className="font-mono font-bold text-indigo-600 dark:text-cyan-400">{m.client_trx_id}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block">Sender Info:</span>
                                                        <span className="font-medium text-slate-800 dark:text-slate-200">{m.client_sender_info || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block">Receipt:</span>
                                                        {m.client_payment_proof ? (
                                                            <a
                                                                href={m.client_payment_proof}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-indigo-600 dark:text-cyan-400 font-bold underline inline-flex items-center space-x-1"
                                                            >
                                                                <span>View Proof</span>
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        ) : (
                                                            <span className="text-slate-400">None uploaded</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {m.client_payment_notes && (
                                                    <p className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-1">
                                                        Note: "{m.client_payment_notes}"
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* FAST ACTIONS BAR */}
                                        {!isCompleted ? (
                                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                                {/* Status Switcher Buttons */}
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="text-xs text-slate-400 font-bold mr-1">Status:</span>
                                                    {m.payment_status !== 'collected' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuickMilestoneStatus(m, 'waiting-client-to-pay')}
                                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                                                m.payment_status === 'waiting-client-to-pay'
                                                                    ? 'bg-amber-500 text-white shadow-xs'
                                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                                            }`}
                                                        >
                                                            Awaiting Client
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickMilestoneStatus(m, 'paid-and-bank-processing')}
                                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                                            m.payment_status === 'paid-and-bank-processing'
                                                                ? 'bg-blue-600 text-white shadow-xs'
                                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        In Verification
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickMilestoneStatus(m, 'collected')}
                                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                                            m.payment_status === 'collected'
                                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        Mark Collected
                                                    </button>
                                                </div>

                                                {/* Edit & Delete & Refund Actions */}
                                                <div className="flex items-center space-x-2">
                                                    {!isRefunded && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openRefundModal(m)}
                                                            className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-bold text-xs flex items-center space-x-1"
                                                            title="Issue Payment Return / Refund"
                                                        >
                                                            <RotateCcw className="h-3.5 w-3.5" />
                                                            <span>Return Payment</span>
                                                        </button>
                                                    )}

                                                    {m.payment_status === 'waiting-client-to-pay' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditMilestoneModal(m)}
                                                            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600"
                                                            title="Edit Pending Milestone"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    {m.payment_status === 'waiting-client-to-pay' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteMilestone(m)}
                                                            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-500"
                                                            title="Delete Pending Milestone"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                                                <div className="flex items-center space-x-1.5">
                                                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                                                    <span>Milestone finalized & immutable</span>
                                                </div>
                                                <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                                    {m.payment_status === 'collected' ? 'Collected & Verified' : mBadge.label}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* MILESTONE CREATE & EDIT MODAL (FIXED DUE DATE VALUE) */}
            {isMilestoneModalOpen && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {editingMilestone ? 'Edit Payment Milestone' : 'Add New Milestone Deliverable'}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Set milestone financial target, deadline due date, and payment collection instructions.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMilestoneModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleMilestoneSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Milestone Title <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={milestoneForm.data.title}
                                        onChange={(e) => milestoneForm.setData('title', e.target.value)}
                                        placeholder="e.g. Milestone 1: UX/UI Design & System Architecture"
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Sequence Order #
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={milestoneForm.data.order}
                                        onChange={(e) => milestoneForm.setData('order', Number(e.target.value))}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                                        <span>Settlement Amount ({order.currency}) <span className="text-rose-500">*</span></span>
                                        <span className="text-[10px] font-bold font-mono text-indigo-600 dark:text-cyan-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800">
                                            Max Allowance: {order.currency} {maxAllowedMilestoneAmount.toLocaleString()}
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0.01"
                                        max={maxAllowedMilestoneAmount}
                                        step="any"
                                        value={milestoneForm.data.amount}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            if (!isNaN(val) && val > maxAllowedMilestoneAmount) {
                                                milestoneForm.setData('amount', maxAllowedMilestoneAmount);
                                            } else {
                                                milestoneForm.setData('amount', e.target.value);
                                            }
                                        }}
                                        placeholder="Amount"
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {milestoneForm.errors.amount && (
                                        <p className="text-xs text-rose-500 mt-1">{milestoneForm.errors.amount}</p>
                                    )}
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        Cannot exceed remaining contract allowance of <strong className="text-slate-800 dark:text-slate-200 font-mono">{order.currency} {maxAllowedMilestoneAmount.toLocaleString()}</strong>.
                                    </p>
                                </div>

                                {/* PROPER DUE DATE PICKER */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                                        <span>Target Due Date</span>
                                        {milestoneForm.data.due_date && (
                                            <span className="text-[10px] text-indigo-500 font-bold">
                                                {new Date(milestoneForm.data.due_date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="date"
                                        value={milestoneForm.data.due_date}
                                        onChange={(e) => milestoneForm.setData('due_date', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Milestone Description & Scope
                                </label>
                                <textarea
                                    rows={2}
                                    value={milestoneForm.data.description}
                                    onChange={(e) => milestoneForm.setData('description', e.target.value)}
                                    placeholder="Explain deliverables included in this milestone phase..."
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Payment Status
                                    </label>
                                    <select
                                        value={milestoneForm.data.payment_status}
                                        onChange={(e) => milestoneForm.setData('payment_status', e.target.value as any)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {(!editingMilestone || editingMilestone.payment_status !== 'collected') && (
                                            <option value="waiting-client-to-pay">Waiting for Client Payment</option>
                                        )}
                                        <option value="paid-and-bank-processing">Paid & Bank Processing</option>
                                        <option value="collected">Collected (Payment Received)</option>
                                        <option value="refunded">Payment Returned / Refunded</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Recommended Gateway / Method
                                    </label>
                                    <input
                                        type="text"
                                        value={milestoneForm.data.payment_method}
                                        onChange={(e) => milestoneForm.setData('payment_method', e.target.value)}
                                        placeholder="Payoneer / PayPal / Bank Transfer / bKash"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Account / Transfer Details (Displayed to Client)
                                </label>
                                <textarea
                                    rows={2}
                                    value={milestoneForm.data.payment_details}
                                    onChange={(e) => milestoneForm.setData('payment_details', e.target.value)}
                                    placeholder="Account Number / Email / Payment Link / IBAN..."
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsMilestoneModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={milestoneForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
                                >
                                    {editingMilestone ? 'Save Milestone' : 'Create Milestone'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* RETURN PAYMENT / REFUND MODAL */}
            {isRefundModalOpen && refundingMilestone && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                    <RotateCcw className="h-5 w-5 text-rose-500" />
                                    <span>Return / Refund Payment</span>
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {refundingMilestone.title} &bull; {order.currency} {refundingMilestone.amount.toLocaleString()}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsRefundModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleRefundSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Refund Amount ({order.currency}) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0.01"
                                    step="any"
                                    value={refundForm.data.refund_amount}
                                    onChange={(e) => refundForm.setData('refund_amount', e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-rose-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Refund Transaction ID / Bank Reference <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={refundForm.data.refund_trx_id}
                                    onChange={(e) => refundForm.setData('refund_trx_id', e.target.value)}
                                    placeholder="e.g. REF-981249-PAYONEER"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-rose-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Refund Reason & Policy Notes <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={refundForm.data.refund_reason}
                                    onChange={(e) => refundForm.setData('refund_reason', e.target.value)}
                                    required
                                    placeholder="State the reason for this payment return..."
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-rose-500"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsRefundModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={refundForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
                                >
                                    {refundForm.processing ? 'Processing...' : 'Confirm Payment Return'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ACCEPT ORDER MODAL */}
            {isAcceptModalOpen && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                    <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                                    <span>Accept Project Proposal</span>
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Set final agreed price and notify client via email.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAcceptModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAcceptSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Final Agreed Price ({acceptForm.data.currency}) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    step="any"
                                    value={acceptForm.data.agreed_price}
                                    onChange={(e) => acceptForm.setData('agreed_price', e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {acceptForm.data.currency !== 'BDT' && (
                                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                                            1 {acceptForm.data.currency} = Exchange Rate to BDT (৳) <span className="text-rose-500">*</span>
                                        </label>
                                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                                            Historical P&L Rate
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="any"
                                            value={acceptForm.data.exchange_rate_to_bdt}
                                            onChange={(e) => acceptForm.setData('exchange_rate_to_bdt', e.target.value)}
                                            required
                                            placeholder={acceptForm.data.currency === 'EUR' ? '130.00' : '120.00'}
                                            className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                                        Applied rate at time of order (e.g. 84.00 in 2022 vs 120.00 today).
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Target Completion Deadline
                                </label>
                                <input
                                    type="date"
                                    value={acceptForm.data.target_deadline}
                                    onChange={(e) => acceptForm.setData('target_deadline', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Engineering Notes / Terms for Client
                                </label>
                                <textarea
                                    rows={3}
                                    value={acceptForm.data.admin_notes}
                                    onChange={(e) => acceptForm.setData('admin_notes', e.target.value)}
                                    placeholder="Special payment conditions, sprint timelines, or codebase delivery guidelines..."
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsAcceptModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={acceptForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
                                >
                                    {acceptForm.processing ? 'Accepting...' : 'Confirm Acceptance'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DENY ORDER MODAL */}
            {isDenyModalOpen && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                    <X className="h-5 w-5 text-rose-500" />
                                    <span>Deny Project Request</span>
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Provide feedback reason why this project cannot be undertaken.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsDenyModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleDenySubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Reason for Denial <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows={4}
                                    value={denyForm.data.rejection_reason}
                                    onChange={(e) => denyForm.setData('rejection_reason', e.target.value)}
                                    required
                                    placeholder="Explain why requirements or timeline cannot be accommodated..."
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-rose-500"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsDenyModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={denyForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
                                >
                                    {denyForm.processing ? 'Denying...' : 'Confirm Denial'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADMIN DIRECT BUDGET UPDATE MODAL */}
            {isBudgetModalOpen && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                    <Coins className="h-5 w-5 text-indigo-500" />
                                    <span>Edit Contract Budget & Currency</span>
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Modify official financial pricing & historical exchange rate for Order #{order.order_number}.
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

                        <form onSubmit={handleBudgetSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Contract Currency
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {CURRENCY_OPTIONS.map((cur) => (
                                        <button
                                            key={cur.code}
                                            type="button"
                                            onClick={() => {
                                                budgetForm.setData('currency', cur.code);
                                                if (cur.code === 'BDT') {
                                                    budgetForm.setData('exchange_rate_to_bdt', 1);
                                                } else if (cur.code === 'EUR') {
                                                    budgetForm.setData('exchange_rate_to_bdt', 130);
                                                } else if (cur.code === 'USD') {
                                                    budgetForm.setData('exchange_rate_to_bdt', 120);
                                                }
                                            }}
                                            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border ${
                                                budgetForm.data.currency === cur.code
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
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
                                    Agreed Contract Price ({getCurrencySymbol(budgetForm.data.currency)}) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={budgetForm.data.agreed_price}
                                    onChange={(e) => budgetForm.setData('agreed_price', e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {budgetForm.data.currency !== 'BDT' && (
                                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                                            1 {budgetForm.data.currency} = Exchange Rate to BDT (৳) <span className="text-rose-500">*</span>
                                        </label>
                                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                                            Historical P&L Accounting
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="any"
                                            value={budgetForm.data.exchange_rate_to_bdt}
                                            onChange={(e) => budgetForm.setData('exchange_rate_to_bdt', e.target.value)}
                                            required
                                            placeholder={budgetForm.data.currency === 'EUR' ? '130.00' : '120.00'}
                                            className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                                        Sets the exact historical currency exchange rate at the time of this order (e.g. 84.00 in 2022 vs 120.00 today).
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Administrative Notes
                                </label>
                                <textarea
                                    rows={3}
                                    value={budgetForm.data.admin_notes}
                                    onChange={(e) => budgetForm.setData('admin_notes', e.target.value)}
                                    placeholder="Internal accounting or client adjustment notes..."
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
                                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
                                >
                                    {budgetForm.processing ? 'Saving...' : 'Update Budget & Rate'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SET / UPDATE DELIVERABLES MODAL */}
            {isDeliverablesModalOpen && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                    <FolderGit2 className="h-5 w-5 text-indigo-500" />
                                    <span>Set Source Code & Deliverable Links</span>
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Manage GitHub repository, Google Drive cloud archive, and Live Demo staging links.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsDeliverablesModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleDeliverablesHubSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1.5">
                                    <Github className="h-3.5 w-3.5 text-purple-500" />
                                    <span>GitHub Repository URL</span>
                                </label>
                                <input
                                    type="url"
                                    value={deliverablesHubForm.data.github_repo_url}
                                    onChange={(e) => deliverablesHubForm.setData('github_repo_url', e.target.value)}
                                    placeholder="https://github.com/organization/project-repo"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-indigo-500"
                                />
                                {deliverablesHubForm.errors.github_repo_url && (
                                    <p className="text-xs text-rose-500 mt-1">{deliverablesHubForm.errors.github_repo_url}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1.5">
                                    <HardDrive className="h-3.5 w-3.5 text-cyan-500" />
                                    <span>Google Drive Cloud Archive URL</span>
                                </label>
                                <input
                                    type="url"
                                    value={deliverablesHubForm.data.drive_link}
                                    onChange={(e) => deliverablesHubForm.setData('drive_link', e.target.value)}
                                    placeholder="https://drive.google.com/drive/folders/..."
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-indigo-500"
                                />
                                {deliverablesHubForm.errors.drive_link && (
                                    <p className="text-xs text-rose-500 mt-1">{deliverablesHubForm.errors.drive_link}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1.5">
                                    <Globe className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>Live Staging / Preview URL</span>
                                </label>
                                <input
                                    type="url"
                                    value={deliverablesHubForm.data.live_demo_url}
                                    onChange={(e) => deliverablesHubForm.setData('live_demo_url', e.target.value)}
                                    placeholder="https://preview.codeventure.tech/..."
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-indigo-500"
                                />
                                {deliverablesHubForm.errors.live_demo_url && (
                                    <p className="text-xs text-rose-500 mt-1">{deliverablesHubForm.errors.live_demo_url}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsDeliverablesModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={deliverablesHubForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center space-x-1.5"
                                >
                                    <Save className="h-3.5 w-3.5" />
                                    <span>{deliverablesHubForm.processing ? 'Saving...' : 'Save Deliverables'}</span>
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
        </AdminLayout>
    );
}
