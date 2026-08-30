import React, { useState, useEffect, FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { SaasProduct, SaasSubscription, User } from '@/types';
import {
    CreditCard,
    Save,
    ArrowLeft,
    User as UserIcon,
    Package,
    Globe,
    Key,
    DollarSign,
    Calendar
} from 'lucide-react';

interface SubscriptionFormProps {
    subscription: SaasSubscription | null;
    users: User[];
    products: SaasProduct[];
    isEdit: boolean;
    currencySymbol: string;
}

export default function SubscriptionForm({
    subscription,
    users,
    products,
    isEdit,
    currencySymbol,
}: SubscriptionFormProps) {
    const todayStr = new Date().toISOString().split('T')[0];

    const { data, setData, post, put, processing, errors } = useForm({
        user_id: subscription?.user_id || (users[0]?.id || ''),
        saas_product_id: subscription?.saas_product_id || (products[0]?.id || ''),
        billing_cycle: subscription?.billing_cycle || 'monthly',
        amount: subscription?.amount || (products[0]?.monthly_price || 0),
        status: subscription?.status || 'active',
        payment_method: subscription?.payment_method || 'bkash',
        sender_number: subscription?.sender_number || '',
        transaction_id: subscription?.transaction_id || '',
        domain: subscription?.domain || '',
        subdomain: subscription?.subdomain || '',
        admin_notes: subscription?.admin_notes || '',
        starts_at: subscription?.starts_at ? subscription.starts_at.split('T')[0] : todayStr,
        expires_at: subscription?.expires_at ? subscription.expires_at.split('T')[0] : '',
    });

    // Auto calculate price and expiry date when product or cycle changes (if not editing or user adjusts)
    const handleProductOrCycleChange = (prodId: number, cycle: string) => {
        const prod = products.find(p => p.id === Number(prodId));
        if (prod) {
            let price = prod.monthly_price;
            if (cycle === 'half_yearly') price = prod.half_yearly_price;
            if (cycle === 'yearly') price = prod.yearly_price;
            setData(prev => ({ ...prev, saas_product_id: prodId, billing_cycle: cycle as any, amount: price }));
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEdit && subscription) {
            put(`/admin/subscriptions/${subscription.id}`);
        } else {
            post('/admin/subscriptions');
        }
    };

    return (
        <AdminLayout
            title={isEdit ? 'Edit Subscription' : 'Create Subscription Manually'}
            breadcrumbs={[
                { title: 'Subscriptions', href: '/admin/subscriptions' },
                { title: isEdit ? 'Edit' : 'Create Manual' },
            ]}
        >
            <div className="max-w-4xl space-y-6">
                <div className="flex items-center space-x-3">
                    <Link
                        href="/admin/subscriptions"
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                            {isEdit ? `Edit Order #${subscription?.order_number}` : 'Manually Create & Assign Subscription'}
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Assign SaaS cloud software directly to a customer account with custom terms and credentials.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer & Product Selection */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <UserIcon className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
                            <span>Customer & SaaS Product</span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Select Customer *
                                </label>
                                <select
                                    required
                                    disabled={isEdit}
                                    value={data.user_id}
                                    onChange={(e) => setData('user_id', parseInt(e.target.value))}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                                >
                                    <option value="">-- Choose Customer --</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} ({u.email})
                                        </option>
                                    ))}
                                </select>
                                {errors.user_id && <p className="text-red-500 text-[10px] mt-1">{errors.user_id}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Select SaaS Product *
                                </label>
                                <select
                                    required
                                    disabled={isEdit}
                                    value={data.saas_product_id}
                                    onChange={(e) => handleProductOrCycleChange(parseInt(e.target.value), data.billing_cycle)}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                                >
                                    <option value="">-- Choose SaaS Product --</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (from {currencySymbol}{p.monthly_price})
                                        </option>
                                    ))}
                                </select>
                                {errors.saas_product_id && <p className="text-red-500 text-[10px] mt-1">{errors.saas_product_id}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Billing Cycle *
                                </label>
                                <select
                                    value={data.billing_cycle}
                                    onChange={(e) => handleProductOrCycleChange(Number(data.saas_product_id), e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs capitalize"
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="half_yearly">Half-Yearly (6 Mo)</option>
                                    <option value="yearly">Yearly (12 Mo)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Amount ({currencySymbol}) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={data.amount}
                                    onChange={(e) => setData('amount', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Subscription Status *
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value as any)}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs capitalize font-bold"
                                >
                                    <option value="active">Active</option>
                                    <option value="pending">Pending Verification</option>
                                    <option value="expired">Expired</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Term Dates & Deployment Setup */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <Calendar className="h-4 w-4 text-emerald-500" />
                            <span>Service Duration & Domain Endpoints</span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Starts At Date
                                </label>
                                <input
                                    type="date"
                                    value={data.starts_at}
                                    onChange={(e) => setData('starts_at', e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Expires At / Deadline Date (Leave blank to auto-calculate)
                                </label>
                                <input
                                    type="date"
                                    value={data.expires_at}
                                    onChange={(e) => setData('expires_at', e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Provided Custom Domain (to User)
                                </label>
                                <input
                                    type="text"
                                    value={data.domain}
                                    onChange={(e) => setData('domain', e.target.value)}
                                    placeholder="e.g. clientdomain.com"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono"
                                />
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                    Configured custom domain provided to customer
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Provided Subdomain Prefix (to User)
                                </label>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        value={data.subdomain}
                                        onChange={(e) => setData('subdomain', e.target.value)}
                                        placeholder="e.g. clientbrand"
                                        className="w-full px-3.5 py-2 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono"
                                    />
                                    <span className="px-3 py-2 rounded-r-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500">
                                        .{products.find((p) => p.id === Number(data.saas_product_id))?.primary_domain || 'codeventure.app'}
                                    </span>
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                    Managed platform subdomain provided to customer
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Customer Credentials & Setup Notes
                            </label>
                            <textarea
                                rows={3}
                                value={data.admin_notes}
                                onChange={(e) => setData('admin_notes', e.target.value)}
                                placeholder="Credentials, login URL, and setup instructions..."
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono"
                            />
                        </div>
                    </div>

                    {/* Payment Reference Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <CreditCard className="h-4 w-4 text-pink-500" />
                            <span>Payment Method & Transaction Reference</span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Payment Method
                                </label>
                                <select
                                    value={data.payment_method}
                                    onChange={(e) => setData('payment_method', e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs uppercase"
                                >
                                    <option value="bkash">bKash</option>
                                    <option value="nagad">Nagad</option>
                                    <option value="rocket">Rocket</option>
                                    <option value="manual_bank">Bank Transfer</option>
                                    <option value="admin_created">Admin Created / Free</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Sender Phone Number
                                </label>
                                <input
                                    type="text"
                                    value={data.sender_number}
                                    onChange={(e) => setData('sender_number', e.target.value)}
                                    placeholder="017XXXXXXXX"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Transaction ID (TrxID)
                                </label>
                                <input
                                    type="text"
                                    value={data.transaction_id}
                                    onChange={(e) => setData('transaction_id', e.target.value.toUpperCase())}
                                    placeholder="TRX123456"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs uppercase font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-2">
                        <Link
                            href="/admin/subscriptions"
                            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 text-xs font-bold"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center space-x-2"
                        >
                            <Save className="h-4 w-4" />
                            <span>{isEdit ? 'Update Subscription' : 'Create & Save Subscription'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
