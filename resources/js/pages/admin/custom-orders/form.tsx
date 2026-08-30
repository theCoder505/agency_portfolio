import React, { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { CustomOrder, User } from '@/types';
import { CURRENCY_OPTIONS, getCurrencySymbol } from '@/lib/formatters';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import {
    FolderGit2,
    ArrowLeft,
    Save,
    UserCheck,
    DollarSign,
    Calendar,
    Github,
    HardDrive,
    Globe,
    Mail,
    Phone
} from 'lucide-react';
import { showToast } from '@/lib/swal';

interface CustomOrderFormProps {
    order?: CustomOrder | null;
    users: User[];
    isEdit: boolean;
    currencySymbol: string;
}

export default function CustomOrderAdminForm({
    order,
    users = [],
    isEdit = false,
    currencySymbol = '৳',
}: CustomOrderFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        user_id: order?.user_id || (users[0]?.id || ''),
        client_whatsapp: order?.client_whatsapp || order?.user?.whatsapp_number || order?.user?.phone || '',
        client_email: order?.client_email || order?.user?.email || '',
        title: order?.title || '',
        category: order?.category || 'Custom Web Application',
        estimated_budget: order?.estimated_budget || '',
        agreed_price: order?.agreed_price || '',
        currency: order?.currency || 'BDT',
        target_deadline: order?.target_deadline ? String(order.target_deadline).substring(0, 10) : '',
        requirements: order?.requirements || '',
        reference_links: order?.reference_links || '',
        status: order?.status || 'pending',
        admin_notes: order?.admin_notes || '',
        github_repo_url: order?.github_repo_url || '',
        drive_link: order?.drive_link || '',
        live_demo_url: order?.live_demo_url || '',
    });

    const categories = [
        'Custom Web Application',
        'SaaS Platform / Multi-tenant App',
        'Mobile Application (React Native / Flutter)',
        'Enterprise ERP / CRM System',
        'E-Commerce & Multi-Vendor Marketplace',
        'API Backend & Cloud Infrastructure',
        'AI / Machine Learning Integration',
        'Full-Stack MVP Development',
        'Other Bespoke Software',
    ];

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEdit && order) {
            put(`/admin/custom-orders/${order.id}`, {
                onSuccess: () => showToast('Order updated successfully', 'success'),
            });
        } else {
            post('/admin/custom-orders', {
                onSuccess: () => showToast('Custom order created successfully', 'success'),
            });
        }
    };

    return (
        <AdminLayout
            title={isEdit ? `Edit Custom Order #${order?.order_number}` : 'Create Custom Order'}
            breadcrumbs={[
                { title: 'Custom Orders', href: '/admin/custom-orders' },
                { title: isEdit ? 'Edit' : 'Create' },
            ]}
        >
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/admin/custom-orders"
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                                {isEdit ? `Edit Order #${order?.order_number}` : 'Create New Custom Order'}
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Create an order record for a direct or offline client.
                            </p>
                        </div>
                    </div>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
                    {/* User Selection & Direct Contacts */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Customer Account <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.user_id}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    setData('user_id', selectedId);
                                    const selectedUser = users.find((u) => String(u.id) === String(selectedId));
                                    if (selectedUser) {
                                        if (!data.client_whatsapp) {
                                            setData('client_whatsapp', selectedUser.whatsapp_number || selectedUser.phone || '');
                                        }
                                        if (!data.client_email) {
                                            setData('client_email', selectedUser.email || '');
                                        }
                                    }
                                }}
                                required
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select a registered client...</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.email}) {u.whatsapp_number ? `• WA: ${u.whatsapp_number}` : (u.phone ? `• ${u.phone}` : '')}
                                    </option>
                                ))}
                            </select>
                            {errors.user_id && <p className="text-rose-500 text-xs mt-1">{errors.user_id}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1.5">
                                    <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>Client WhatsApp Number (For Direct Chat)</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={data.client_whatsapp}
                                        onChange={(e) => setData('client_whatsapp', e.target.value)}
                                        placeholder="e.g. +880 1700-000000 or +1 555-0192"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Client Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="email"
                                        value={data.client_email}
                                        onChange={(e) => setData('client_email', e.target.value)}
                                        placeholder="client@company.com"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Title & Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Project Title <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="e.g. Real Estate Management SaaS"
                                required
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Category
                            </label>
                            <select
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                            >
                                {categories.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Financials & Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Agreed Price ({data.currency}) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                value={data.agreed_price}
                                onChange={(e) => setData('agreed_price', e.target.value)}
                                placeholder="e.g. 3000"
                                required
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.agreed_price && <p className="text-rose-500 text-xs mt-1">{errors.agreed_price}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Estimated / Client Budget
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                value={data.estimated_budget}
                                onChange={(e) => setData('estimated_budget', e.target.value)}
                                placeholder="e.g. 2500"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Target Completion Deadline
                            </label>
                            <input
                                type="date"
                                value={data.target_deadline}
                                onChange={(e) => setData('target_deadline', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Status & Currency */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Order Status
                            </label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="pending">Pending Review</option>
                                <option value="accepted">Accepted</option>
                                <option value="in_progress">In Development</option>
                                <option value="completed" disabled={!isEdit || !order?.is_fully_paid}>
                                    Completed & Delivered {!isEdit || !order?.is_fully_paid ? '(Requires 100% Settlement)' : ''}
                                </option>
                                <option value="denied">Denied</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                                <span>Currency</span>
                                <span className="text-[10px] text-indigo-500 font-bold">Default: BDT</span>
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {CURRENCY_OPTIONS.map((cur) => (
                                    <button
                                        key={cur.code}
                                        type="button"
                                        onClick={() => setData('currency', cur.code)}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border ${
                                            data.currency === cur.code
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
                    </div>

                    {/* Requirements */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Requirements & Scope of Work <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            value={data.requirements}
                            onChange={(e) => setData('requirements', e.target.value)}
                            placeholder="Detailed functional requirements..."
                            required
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.requirements && <p className="text-rose-500 text-xs mt-1">{errors.requirements}</p>}
                    </div>

                    {/* Deliverables URLs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                GitHub Repository URL
                            </label>
                            <input
                                type="url"
                                value={data.github_repo_url}
                                onChange={(e) => setData('github_repo_url', e.target.value)}
                                placeholder="https://github.com/..."
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Google Drive URL
                            </label>
                            <input
                                type="url"
                                value={data.drive_link}
                                onChange={(e) => setData('drive_link', e.target.value)}
                                placeholder="https://drive.google.com/..."
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Live Preview Demo URL
                            </label>
                            <input
                                type="url"
                                value={data.live_demo_url}
                                onChange={(e) => setData('live_demo_url', e.target.value)}
                                placeholder="https://demo.app.com"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Link
                            href="/admin/custom-orders"
                            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            <span>{processing ? 'Saving...' : (isEdit ? 'Update Order' : 'Create Custom Order')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
