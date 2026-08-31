import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { CustomerLayout } from '@/layouts/customer-layout';
import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    FolderGit2,
    CreditCard,
    Receipt,
    MessageSquare,
    Star,
    AlertCircle,
    CheckCircle2,
    ExternalLink,
    Clock,
    Sparkles
} from 'lucide-react';
import { PaginatedData, AppNotification } from '@/types';
import { showToast } from '@/lib/swal';

interface CustomerNotificationsPageProps {
    notifications: PaginatedData<AppNotification>;
    unreadCount: number;
    typeCounts: Record<string, number>;
    filters: {
        status: string;
        type: string;
    };
}

export default function CustomerNotificationsIndex({
    notifications,
    unreadCount,
    typeCounts,
    filters,
}: CustomerNotificationsPageProps) {
    const currentStatus = filters.status || 'all';
    const currentType = filters.type || 'all';

    const getIcon = (type: string, icon?: string) => {
        const iconName = icon || type;
        switch (iconName) {
            case 'order':
                return <FolderGit2 className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />;
            case 'subscription':
                return <CreditCard className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />;
            case 'payment':
                return <Receipt className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />;
            case 'contact':
                return <MessageSquare className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
            case 'review':
                return <Star className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
            case 'check':
                return <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />;
            case 'alert':
                return <AlertCircle className="h-5 w-5 text-rose-500 dark:text-rose-400" />;
            default:
                return <Bell className="h-5 w-5 text-indigo-500 dark:text-cyan-400" />;
        }
    };

    const getIconBg = (type: string) => {
        switch (type) {
            case 'order':
                return 'bg-cyan-500/10 border-cyan-500/25 text-cyan-600 dark:text-cyan-400';
            case 'subscription':
                return 'bg-indigo-500/10 border-indigo-500/25 text-indigo-600 dark:text-indigo-400';
            case 'payment':
                return 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400';
            case 'contact':
                return 'bg-blue-500/10 border-blue-500/25 text-blue-600 dark:text-blue-400';
            case 'review':
                return 'bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400';
            default:
                return 'bg-indigo-500/10 border-indigo-500/25 text-indigo-600 dark:text-cyan-400';
        }
    };

    const handleFilterChange = (newStatus?: string, newType?: string) => {
        router.get(
            '/customer/notifications',
            {
                status: newStatus !== undefined ? newStatus : currentStatus,
                type: newType !== undefined ? newType : currentType,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleMarkAllAsRead = () => {
        router.post(
            '/customer/notifications/mark-all-read',
            {},
            {
                onSuccess: () => showToast('All notifications marked as read', 'success'),
            }
        );
    };

    const handleMarkSingleAsRead = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        router.post(
            `/customer/notifications/${id}/read`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => showToast('Notification marked as read', 'success'),
            }
        );
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        router.delete(`/customer/notifications/${id}`, {
            preserveScroll: true,
            onSuccess: () => showToast('Notification removed', 'info'),
        });
    };

    const tabs = [
        { label: 'All Notices', key: 'all', type: 'all', count: typeCounts?.all || 0 },
        { label: 'Custom Projects', key: 'order', type: 'order', count: typeCounts?.order || 0 },
        { label: 'SaaS Subscriptions', key: 'subscription', type: 'subscription', count: typeCounts?.subscription || 0 },
        { label: 'Invoices & Payments', key: 'payment', type: 'payment', count: typeCounts?.payment || 0 },
    ];

    return (
        <CustomerLayout
            title="My Notifications"
            breadcrumbs={[{ title: 'Notifications' }]}
        >
            <Head title="My Notifications - Customer Portal" />

            <div className="space-y-6 max-w-5xl mx-auto">
                {/* Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center space-x-3 mb-1">
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
                                <Sparkles className="h-6 w-6 text-indigo-600 dark:text-cyan-400" />
                                <span>My Notifications</span>
                            </h1>
                            {unreadCount > 0 && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white shadow-xs">
                                    {unreadCount} Unread
                                </span>
                            )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            Stay up-to-date with your custom project milestones, SaaS activations, and payment invoices.
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={handleMarkAllAsRead}
                            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-cyan-400 border border-indigo-200/60 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all self-start sm:self-center"
                        >
                            <CheckCheck className="h-4 w-4" />
                            <span>Mark All Read</span>
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Status Toggle */}
                    <div className="flex items-center space-x-1 p-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl w-fit">
                        <button
                            type="button"
                            onClick={() => handleFilterChange('all', currentType)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                currentStatus === 'all'
                                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            onClick={() => handleFilterChange('unread', currentType)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                                currentStatus === 'unread'
                                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <span>Unread</span>
                            {unreadCount > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-black">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleFilterChange('read', currentType)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                currentStatus === 'read'
                                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            Read
                        </button>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center space-x-2 overflow-x-auto pb-1 custom-scrollbar">
                        {tabs.map((tab) => {
                            const active = currentType === tab.type;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => handleFilterChange(currentStatus, tab.type)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center space-x-2 transition-all border ${
                                        active
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span
                                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                            active
                                                ? 'bg-white/20 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                        }`}
                                    >
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {notifications.data.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-xs">
                            <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-cyan-400">
                                <Bell className="h-8 w-8 opacity-70" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                                No notifications yet
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                                You'll receive real-time notifications here as soon as your custom projects are updated, milestones are assigned, or invoices are verified.
                            </p>
                            {(currentStatus !== 'all' || currentType !== 'all') && (
                                <button
                                    type="button"
                                    onClick={() => handleFilterChange('all', 'all')}
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                                >
                                    View All Notices
                                </button>
                            )}
                        </div>
                    ) : (
                        notifications.data.map((item) => (
                            <div
                                key={item.id}
                                className={`group p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                    !item.is_read
                                        ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/70 dark:border-indigo-800/50 shadow-xs'
                                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                            >
                                <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                                    <div
                                        className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs ${getIconBg(
                                            item.type
                                        )}`}
                                    >
                                        {getIcon(item.type, item.icon)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
                                            <h3
                                                className={`text-sm font-bold truncate ${
                                                    !item.is_read
                                                        ? 'text-slate-900 dark:text-white font-black'
                                                        : 'text-slate-800 dark:text-slate-200'
                                                }`}
                                            >
                                                {item.title}
                                            </h3>

                                            {item.badge && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-cyan-400 border border-indigo-200/60 dark:border-indigo-800/60">
                                                    {item.badge}
                                                </span>
                                            )}

                                            {!item.is_read && (
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                                    Unread
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                                            {item.message}
                                        </p>

                                        <div className="flex items-center space-x-3 text-[11px] text-slate-400 dark:text-slate-500">
                                            <span className="flex items-center space-x-1 font-medium">
                                                <Clock className="h-3 w-3" />
                                                <span>{item.created_at_formatted || item.time_ago}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                                    {item.link && item.link !== '#' && (
                                        <Link
                                            href={item.link}
                                            onClick={() => {
                                                if (!item.is_read) {
                                                    fetch(`/customer/notifications/${item.id}/read`, {
                                                        method: 'POST',
                                                        headers: {
                                                            'X-Requested-With': 'XMLHttpRequest',
                                                            'X-CSRF-TOKEN':
                                                                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                                                        },
                                                    });
                                                }
                                            }}
                                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all"
                                        >
                                            <span>Open Details</span>
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </Link>
                                    )}

                                    {!item.is_read && (
                                        <button
                                            type="button"
                                            onClick={(e) => handleMarkSingleAsRead(item.id, e)}
                                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            title="Mark as read"
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={(e) => handleDelete(item.id, e)}
                                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                        title="Remove notice"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {notifications.links && notifications.links.length > 3 && (
                    <div className="flex items-center justify-center space-x-1 py-4">
                        {notifications.links.map((link, idx) => {
                            if (!link.url) {
                                return (
                                    <span
                                        key={idx}
                                        className="px-3 py-1.5 rounded-lg text-xs text-slate-400 dark:text-slate-600 border border-slate-200/60 dark:border-slate-800 cursor-not-allowed"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            }

                            return (
                                <Link
                                    key={idx}
                                    href={link.url}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        link.active
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
