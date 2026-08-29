import React, { useState, FormEventHandler } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { CustomOrder, CustomOrderMilestone, AppSettings } from '@/types';
import {
    FolderGit2,
    PlusCircle,
    CheckCircle2,
    Clock,
    AlertCircle,
    Globe,
    Github,
    HardDrive,
    ExternalLink,
    Copy,
    Receipt,
    Shield,
    Trash2,
    Edit3,
    ArrowRight,
    Lock,
    Unlock,
    DollarSign,
    User,
    Mail,
    Phone,
    Building2,
    Calendar,
    Layers,
    FileText,
    Check,
    X,
    MessageSquare,
    AlertTriangle,
    Save,
    CreditCard,
    UploadCloud
} from 'lucide-react';
import { showToast, showConfirmDialog, showSuccessAlert } from '@/lib/swal';

interface CustomOrderAdminShowProps {
    order: CustomOrder;
    currencySymbol: string;
    appSettings: AppSettings;
}

export default function CustomOrderAdminShow({
    order,
    currencySymbol = '$',
    appSettings,
}: CustomOrderAdminShowProps) {
    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
    const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);
    const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState<CustomOrderMilestone | null>(null);
    const [isDeliverablesEditing, setIsDeliverablesEditing] = useState(false);
    const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);

    const agreedPrice = order.agreed_price || order.estimated_budget || 0;
    const totalCollected = order.total_collected_amount || 0;
    const totalProcessing = order.total_processing_amount || 0;
    const totalPending = order.total_pending_amount || 0;
    const milestones = order.milestones || [];
    const statusBadge = order.status_badge || { label: order.status, color: 'slate', description: '' };

    // Deliverables Form
    const deliverablesForm = useForm({
        title: order.title,
        category: order.category || '',
        estimated_budget: order.estimated_budget || 0,
        agreed_price: order.agreed_price || 0,
        target_deadline: order.target_deadline || '',
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

    // Accept Order Form
    const acceptForm = useForm({
        agreed_price: order.agreed_price || order.estimated_budget || 1000,
        target_deadline: order.target_deadline || '',
        admin_notes: order.admin_notes || '',
    });

    const handleAcceptSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        acceptForm.post(`/admin/custom-orders/${order.id}/accept`, {
            onSuccess: () => {
                setIsAcceptModalOpen(false);
                showSuccessAlert('Order Accepted', `Order #${order.order_number} has been accepted! Acceptance email notification dispatched to the client.`);
            },
        });
    };

    // Deny Order Form
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

    // Milestone Form (Create & Edit)
    const milestoneForm = useForm({
        title: '',
        description: '',
        amount: '' as string | number,
        due_date: '',
        order: (milestones.length + 1) as number,
        payment_status: 'waiting-client-to-pay' as 'waiting-client-to-pay' | 'paid-and-bank-processing' | 'collected',
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
        setEditingMilestone(null);
        milestoneForm.setData({
            title: `Milestone ${milestones.length + 1}: `,
            description: '',
            amount: milestones.length === 0 ? (agreedPrice * 0.5) : (agreedPrice * 0.25),
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
        setEditingMilestone(m);
        milestoneForm.setData({
            title: m.title,
            description: m.description || '',
            amount: m.amount,
            due_date: m.due_date || '',
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
        router.post(`/admin/custom-orders/${order.id}/milestones/${m.id}/status`, {
            payment_status: newStatus,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                showToast(`Milestone status updated to: ${newStatus}`, 'success');
            },
        });
    };

    const handleDeleteMilestone = (m: CustomOrderMilestone) => {
        showConfirmDialog(
            'Delete Milestone?',
            `Are you sure you want to delete milestone "${m.title}"?`,
            'Delete Milestone'
        ).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/custom-orders/${order.id}/milestones/${m.id}`, {
                    preserveScroll: true,
                });
            }
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
                {/* TOP COMMAND BAR */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-start space-x-4 min-w-0">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-md shrink-0">
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
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                    {order.title}
                                </h1>
                            </div>
                        </div>

                        {/* DECISION / JUDGE ACTIONS */}
                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                            {order.status === 'pending' && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setIsAcceptModalOpen(true)}
                                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Accept & Quote Project</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setIsDenyModalOpen(true)}
                                        className="px-4 py-2.5 rounded-xl bg-rose-600/10 border border-rose-600/30 text-rose-600 hover:bg-rose-600 hover:text-white font-bold text-xs transition-all flex items-center space-x-1.5"
                                    >
                                        <X className="h-4 w-4" />
                                        <span>Deny Proposal</span>
                                    </button>
                                </>
                            )}

                            {order.status !== 'pending' && (
                                <select
                                    value={order.status}
                                    onChange={(e) => {
                                        router.put(`/admin/custom-orders/${order.id}`, {
                                            ...deliverablesForm.data,
                                            status: e.target.value,
                                        }, { preserveScroll: true });
                                    }}
                                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="accepted">Accepted</option>
                                    <option value="in_progress">In Development</option>
                                    <option value="completed">Completed & Delivered</option>
                                    <option value="denied">Denied</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            )}

                            <button
                                type="button"
                                onClick={openAddMilestoneModal}
                                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5"
                            >
                                <PlusCircle className="h-4 w-4" />
                                <span>Add Milestone</span>
                            </button>
                        </div>
                    </div>

                    {/* FINANCIAL METRICS SUMMARY */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Agreed Total Price</span>
                            <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                                {order.currency} {agreedPrice.toLocaleString()}
                            </span>
                            {order.estimated_budget && (
                                <span className="text-[11px] text-slate-400 block mt-0.5">
                                    Client Budget: {order.currency} {order.estimated_budget.toLocaleString()}
                                </span>
                            )}
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Collected (In Account)</span>
                            <span className="text-xl font-black text-emerald-500 mt-1 block">
                                {order.currency} {totalCollected.toLocaleString()}
                            </span>
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-semibold">
                                {order.progress_percentage}% Settled
                            </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Under Bank Processing</span>
                            <span className="text-xl font-black text-blue-500 mt-1 block">
                                {order.currency} {totalProcessing.toLocaleString()}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                                TrxID submitted by client
                            </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Waiting for Client Pay</span>
                            <span className="text-xl font-black text-amber-500 mt-1 block">
                                {order.currency} {totalPending.toLocaleString()}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                                Pending payment release
                            </span>
                        </div>
                    </div>

                    {/* CLIENT INFO CARD */}
                    <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                {order.user?.name?.substring(0, 2).toUpperCase() || 'CU'}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                    {order.user?.name || 'Guest / Direct'}
                                    {order.user?.company_name && <span className="text-xs text-slate-400 font-normal"> ({order.user.company_name})</span>}
                                </h4>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    <span className="flex items-center space-x-1 font-mono">
                                        <Mail className="h-3 w-3" />
                                        <span>{order.user?.email}</span>
                                    </span>
                                    {order.user?.phone && (
                                        <span className="flex items-center space-x-1">
                                            <Phone className="h-3 w-3" />
                                            <span>{order.user.phone}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {order.target_deadline && (
                            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-300 flex items-center space-x-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                                <Calendar className="h-4 w-4" />
                                <span>Target Delivery: {new Date(order.target_deadline).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* DELIVERABLES & CODEBASE HUB EDITOR */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                                <Github className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Codebase & Deliverables Release Center
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Provide GitHub repository, Google Drive archive, and Live Preview links to deliver to the client.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsDeliverablesEditing(!isDeliverablesEditing)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center space-x-1.5"
                        >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>{isDeliverablesEditing ? 'Cancel Edit' : 'Edit Links'}</span>
                        </button>
                    </div>

                    {isDeliverablesEditing ? (
                        <form onSubmit={handleDeliverablesSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        GitHub Repository Link
                                    </label>
                                    <div className="relative">
                                        <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                                        <input
                                            type="url"
                                            value={deliverablesForm.data.github_repo_url}
                                            onChange={(e) => deliverablesForm.setData('github_repo_url', e.target.value)}
                                            placeholder="https://github.com/organization/repo"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Google Drive Deliverables Link
                                    </label>
                                    <div className="relative">
                                        <HardDrive className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
                                        <input
                                            type="url"
                                            value={deliverablesForm.data.drive_link}
                                            onChange={(e) => deliverablesForm.setData('drive_link', e.target.value)}
                                            placeholder="https://drive.google.com/drive/folders/..."
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Live Staging / Preview URL
                                    </label>
                                    <div className="relative">
                                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                                        <input
                                            type="url"
                                            value={deliverablesForm.data.live_demo_url}
                                            onChange={(e) => deliverablesForm.setData('live_demo_url', e.target.value)}
                                            placeholder="https://demo.clientproject.com"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Architect / Release Notes to Client
                                </label>
                                <textarea
                                    rows={3}
                                    value={deliverablesForm.data.admin_notes}
                                    onChange={(e) => deliverablesForm.setData('admin_notes', e.target.value)}
                                    placeholder="Enter instructions on how client can access codebase, setup environment, deploy..."
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="submit"
                                    disabled={deliverablesForm.processing}
                                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-sm hover:bg-indigo-700 flex items-center space-x-1.5"
                                >
                                    <Save className="h-3.5 w-3.5" />
                                    <span>{deliverablesForm.processing ? 'Saving...' : 'Save Deliverables'}</span>
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Github className="h-5 w-5 text-purple-500" />
                                    <div>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">GitHub Repository</span>
                                        <span className="text-[11px] text-slate-400 font-mono truncate max-w-[160px] block">
                                            {order.github_repo_url || 'Not set yet'}
                                        </span>
                                    </div>
                                </div>
                                {order.github_repo_url && (
                                    <a href={order.github_repo_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-indigo-500">
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                )}
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <HardDrive className="h-5 w-5 text-cyan-500" />
                                    <div>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Google Drive Cloud</span>
                                        <span className="text-[11px] text-slate-400 font-mono truncate max-w-[160px] block">
                                            {order.drive_link || 'Not set yet'}
                                        </span>
                                    </div>
                                </div>
                                {order.drive_link && (
                                    <a href={order.drive_link} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-cyan-500">
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                )}
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Globe className="h-5 w-5 text-emerald-500" />
                                    <div>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Live Demo Link</span>
                                        <span className="text-[11px] text-slate-400 font-mono truncate max-w-[160px] block">
                                            {order.live_demo_url || 'Not set yet'}
                                        </span>
                                    </div>
                                </div>
                                {order.live_demo_url && (
                                    <a href={order.live_demo_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-emerald-500">
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* MILESTONES MANAGEMENT STUDIO */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                <Layers className="h-5 w-5 text-indigo-500" />
                                <span>Milestones & Payment Management Studio</span>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Set settled amount per milestone, configure Payoneer/PayPal/Bank transfer sharing, and verify client payments.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openAddMilestoneModal}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span>Add New Milestone</span>
                        </button>
                    </div>

                    {milestones.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 space-y-3">
                            <Layers className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
                            <p className="text-sm font-semibold">No payment milestones defined yet.</p>
                            <button
                                type="button"
                                onClick={openAddMilestoneModal}
                                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 inline-flex items-center space-x-1.5"
                            >
                                <PlusCircle className="h-4 w-4" />
                                <span>Create First Milestone</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {milestones.map((m, index) => {
                                const mBadge = m.status_badge || { label: m.payment_status, color: 'slate', short_label: m.payment_status };

                                return (
                                    <div
                                        key={m.id}
                                        className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-4"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center space-x-3">
                                                <span className="h-8 w-8 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                                                    M{m.order || index + 1}
                                                </span>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {m.title}
                                                    </h4>
                                                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                                                        <span>Amount: <strong className="text-slate-700 dark:text-slate-200">{order.currency} {m.amount.toLocaleString()}</strong></span>
                                                        {m.due_date && <span>&bull; Due: {new Date(m.due_date).toLocaleDateString()}</span>}
                                                        {m.payment_method && <span>&bull; Channel: {m.payment_method}</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Switcher & Actions */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* Payment Status Dropdown */}
                                                <select
                                                    value={m.payment_status}
                                                    onChange={(e) => handleQuickMilestoneStatus(m, e.target.value)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                                                        m.payment_status === 'collected'
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                                            : m.payment_status === 'paid-and-bank-processing'
                                                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                                                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                                    }`}
                                                >
                                                    <option value="waiting-client-to-pay">Waiting Client Payment</option>
                                                    <option value="paid-and-bank-processing">Paid & Bank Processing</option>
                                                    <option value="collected">Collected (Received in Account)</option>
                                                </select>

                                                <button
                                                    type="button"
                                                    onClick={() => openEditMilestoneModal(m)}
                                                    className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-500"
                                                    title="Edit Milestone"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteMilestone(m)}
                                                    className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500"
                                                    title="Delete Milestone"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {m.description && (
                                            <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line">
                                                {m.description}
                                            </p>
                                        )}

                                        {/* PAYMENT SHARING DETAILS */}
                                        {m.payment_details && (
                                            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                                                <span className="font-bold text-slate-500 block mb-1">
                                                    Shared Payment Details (Shown to client):
                                                </span>
                                                <pre className="font-mono text-indigo-600 dark:text-cyan-400 whitespace-pre-line select-all">
                                                    {m.payment_details}
                                                </pre>
                                            </div>
                                        )}

                                        {/* CLIENT SUBMITTED PROOF VERIFICATION BOX */}
                                        {m.client_trx_id && (
                                            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-2">
                                                <div className="flex items-center justify-between font-bold text-blue-400">
                                                    <span className="flex items-center space-x-1.5">
                                                        <Clock className="h-4 w-4" />
                                                        <span>Client Submitted Transaction Proof:</span>
                                                    </span>
                                                    {m.payment_status !== 'collected' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuickMilestoneStatus(m, 'collected')}
                                                            className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors"
                                                        >
                                                            Mark Collected (Verified)
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-semibold text-slate-700 dark:text-slate-200">
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 block font-normal">TrxID:</span>
                                                        <span className="font-mono text-cyan-400">{m.client_trx_id}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 block font-normal">Method:</span>
                                                        <span>{m.client_payment_method}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 block font-normal">Sender Info:</span>
                                                        <span>{m.client_sender_info || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 block font-normal">Paid At:</span>
                                                        <span>{m.client_paid_at ? new Date(m.client_paid_at).toLocaleString() : 'N/A'}</span>
                                                    </div>
                                                </div>

                                                {m.client_payment_proof && (
                                                    <div className="pt-1">
                                                        <a
                                                            href={m.client_payment_proof}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300 underline font-semibold"
                                                        >
                                                            <FileText className="h-3.5 w-3.5" />
                                                            <span>View Uploaded Payment Receipt / Screenshot</span>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ORIGINAL REQUIREMENTS & ATTACHMENTS */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Client Specifications & Attached Documents
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

            {/* ACCEPT ORDER MODAL */}
            {isAcceptModalOpen && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Accept & Quote Project Proposal
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Set final agreed price, delivery timeline, and initial terms.
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
                                    Agreed Total Price ({order.currency}) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    step="any"
                                    value={acceptForm.data.agreed_price}
                                    onChange={(e) => acceptForm.setData('agreed_price', e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

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
                                    Architect Notes / Terms to Client
                                </label>
                                <textarea
                                    rows={3}
                                    value={acceptForm.data.admin_notes}
                                    onChange={(e) => acceptForm.setData('admin_notes', e.target.value)}
                                    placeholder="We have accepted your project! Payment will be handled in 3 milestones..."
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
                                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md disabled:opacity-50"
                                >
                                    {acceptForm.processing ? 'Accepting...' : 'Accept Proposal & Notify'}
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
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Deny Project Proposal
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Provide feedback reason that will be emailed to the client.
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
                                    Rejection Reason / Feedback <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows={4}
                                    value={denyForm.data.rejection_reason}
                                    onChange={(e) => denyForm.setData('rejection_reason', e.target.value)}
                                    placeholder="Explain why this request cannot be accepted (e.g. scope beyond current bandwidth, timeline unfeasible, etc.)..."
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-rose-500"
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
                                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md disabled:opacity-50"
                                >
                                    {denyForm.processing ? 'Denying...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD / EDIT MILESTONE MODAL */}
            {isMilestoneModalOpen && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8 animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {editingMilestone ? 'Edit Milestone Details' : 'Add New Payment Milestone'}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Configure amount, payment sharing links (Payoneer, PayPal, Bank), and deliverables.
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
                                        placeholder="e.g. Phase 1: UX/UI & Database Schema"
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Settled Amount ({order.currency}) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={milestoneForm.data.amount}
                                        onChange={(e) => milestoneForm.setData('amount', e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={milestoneForm.data.due_date}
                                        onChange={(e) => milestoneForm.setData('due_date', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        Payment Status
                                    </label>
                                    <select
                                        value={milestoneForm.data.payment_status}
                                        onChange={(e) => milestoneForm.setData('payment_status', e.target.value as any)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="waiting-client-to-pay">Waiting Client Payment</option>
                                        <option value="paid-and-bank-processing">Paid & Bank Processing</option>
                                        <option value="collected">Collected (Payment Received)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Milestone Scope & Description
                                </label>
                                <textarea
                                    rows={2}
                                    value={milestoneForm.data.description}
                                    onChange={(e) => milestoneForm.setData('description', e.target.value)}
                                    placeholder="Summary of deliverables included in this milestone payment..."
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Payment Method & Sharing Details */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                                <h4 className="text-xs font-bold uppercase text-indigo-600 dark:text-cyan-400 flex items-center space-x-1.5">
                                    <CreditCard className="h-4 w-4" />
                                    <span>Payment Method & Sharing Details</span>
                                </h4>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                        Payment Method Name
                                    </label>
                                    <input
                                        type="text"
                                        value={milestoneForm.data.payment_method}
                                        onChange={(e) => milestoneForm.setData('payment_method', e.target.value)}
                                        placeholder="Payoneer / PayPal / Bank Transfer / bKash / Nagad / Wise"
                                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                        Payment Sharing Details (Account number, Payoneer link, PayPal link, IBAN, SWIFT)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={milestoneForm.data.payment_details}
                                        onChange={(e) => milestoneForm.setData('payment_details', e.target.value)}
                                        placeholder="Payoneer Email: payments@codeventure.tech&#10;PayPal: https://paypal.me/...&#10;Bank: City Bank Ltd, A/C: 12345678, SWIFT: CIBLBDDH"
                                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Deliverables for this milestone */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                        Phase GitHub Repo (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        value={milestoneForm.data.github_repo_url}
                                        onChange={(e) => milestoneForm.setData('github_repo_url', e.target.value)}
                                        placeholder="https://github.com/..."
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                                        Phase Google Drive (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        value={milestoneForm.data.drive_link}
                                        onChange={(e) => milestoneForm.setData('drive_link', e.target.value)}
                                        placeholder="https://drive.google.com/..."
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                                    />
                                </div>
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
                                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
                                >
                                    {milestoneForm.processing ? 'Saving...' : (editingMilestone ? 'Update Milestone' : 'Create Milestone')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
