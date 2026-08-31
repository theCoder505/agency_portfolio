import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    Bell,
    Check,
    CheckCheck,
    FolderGit2,
    CreditCard,
    Receipt,
    MessageSquare,
    Star,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    ExternalLink,
    Clock
} from 'lucide-react';
import { SharedData, AppNotification } from '@/types';

interface NotificationsDropdownProps {
    isAdmin?: boolean;
    align?: 'left' | 'right';
    isHeroMode?: boolean;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
    isAdmin,
    align = 'right',
    isHeroMode = false,
}) => {
    const { auth, unread_notifications_count = 0, recent_notifications = [] } = usePage<SharedData>().props;
    const { url } = usePage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Determine admin vs customer mode based on props or current path
    const resolvedIsAdmin = isAdmin !== undefined ? isAdmin : (auth?.admin !== null || url.startsWith('/admin'));
    const allNotificationsUrl = resolvedIsAdmin ? '/admin/notifications' : '/customer/notifications';
    const markAllReadUrl = resolvedIsAdmin ? '/admin/notifications/mark-all-read' : '/customer/notifications/mark-all-read';
    const markSingleReadBaseUrl = resolvedIsAdmin ? '/admin/notifications' : '/customer/notifications';

    // Local state for optimistic update
    const [notifications, setNotifications] = useState<AppNotification[]>(recent_notifications);
    const [unreadCount, setUnreadCount] = useState<number>(unread_notifications_count);

    useEffect(() => {
        setNotifications(recent_notifications);
        setUnreadCount(unread_notifications_count);
    }, [recent_notifications, unread_notifications_count]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const getIcon = (type: string, icon?: string) => {
        const iconName = icon || type;
        switch (iconName) {
            case 'order':
                return <FolderGit2 className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />;
            case 'subscription':
                return <CreditCard className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />;
            case 'payment':
                return <Receipt className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />;
            case 'contact':
                return <MessageSquare className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
            case 'review':
                return <Star className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
            case 'check':
                return <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />;
            case 'alert':
                return <AlertCircle className="h-4 w-4 text-rose-500 dark:text-rose-400" />;
            default:
                return <Bell className="h-4 w-4 text-indigo-500 dark:text-cyan-400" />;
        }
    };

    const getIconBg = (type: string) => {
        switch (type) {
            case 'order':
                return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400';
            case 'subscription':
                return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400';
            case 'payment':
                return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
            case 'contact':
                return 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400';
            case 'review':
                return 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400';
            default:
                return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-cyan-400';
        }
    };

    const handleMarkAllAsRead = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

        fetch(markAllReadUrl, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
        }).then(() => {
            router.reload({ only: ['unread_notifications_count', 'recent_notifications'] });
        });
    };

    const handleNotificationClick = (notification: AppNotification, e: React.MouseEvent) => {
        e.preventDefault();
        setIsOpen(false);

        // Optimistically mark as read
        if (!notification.is_read) {
            setNotifications((prev) =>
                prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));

            fetch(`${markSingleReadBaseUrl}/${notification.id}/read`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });
        }

        // Navigate to the target link if not placeholder
        if (notification.link && notification.link !== '#' && notification.link !== '') {
            if (notification.link.startsWith('http://') || notification.link.startsWith('https://')) {
                window.location.href = notification.link;
            } else {
                router.visit(notification.link);
            }
        } else {
            router.visit(allNotificationsUrl);
        }
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            {/* Bell Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-xl transition-all duration-200 border ${
                    isHeroMode
                        ? 'border-slate-700/60 bg-slate-900/60 text-slate-200 hover:text-white hover:bg-slate-800/80 shadow-xs'
                        : 'border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white shadow-xs'
                }`}
                title="Notifications"
                aria-label="View notifications"
            >
                <Bell className={`h-4 w-4 transition-transform ${unreadCount > 0 ? 'animate-wiggle' : ''}`} />

                {/* Unread Counter Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-950 shadow-sm animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu Panel */}
            {isOpen && (
                <div
                    className={`absolute mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
                        align === 'right' ? 'right-0' : 'left-0'
                    }`}
                >
                    {/* Header */}
                    <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
                        <div className="flex items-center space-x-2">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-cyan-400" />
                                <span>Notifications</span>
                            </h3>
                            {unreadCount > 0 ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                    {unreadCount} new
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    All clear
                                </span>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllAsRead}
                                className="flex items-center space-x-1 text-[11px] font-bold text-indigo-600 dark:text-cyan-400 hover:underline transition-all"
                                title="Mark all notifications as read"
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                <span>Mark all read</span>
                            </button>
                        )}
                    </div>

                    {/* Notification Items List */}
                    <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="py-12 px-4 text-center">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-cyan-400">
                                    <Bell className="h-6 w-6 opacity-60" />
                                </div>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                                    No notifications yet
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[200px] mx-auto">
                                    You'll receive real-time updates when orders, invoices, reviews or messages arrive.
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={(e) => handleNotificationClick(notification, e)}
                                    role="button"
                                    tabIndex={0}
                                    className={`p-3.5 sm:p-4 text-left transition-all duration-150 flex items-start space-x-3 cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                                        !notification.is_read
                                            ? 'bg-indigo-50/40 dark:bg-indigo-950/20'
                                            : 'bg-white dark:bg-slate-900 opacity-90 hover:opacity-100'
                                    }`}
                                >
                                    {/* Categorized Icon */}
                                    <div
                                        className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${getIconBg(
                                            notification.type
                                        )}`}
                                    >
                                        {getIcon(notification.type, notification.icon)}
                                    </div>

                                    {/* Notice Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h4
                                                className={`text-xs font-bold truncate pr-2 ${
                                                    !notification.is_read
                                                        ? 'text-slate-900 dark:text-white font-extrabold'
                                                        : 'text-slate-700 dark:text-slate-300'
                                                }`}
                                            >
                                                {notification.title}
                                            </h4>
                                            {!notification.is_read && (
                                                <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-sm shrink-0" />
                                            )}
                                        </div>

                                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-1.5">
                                            {notification.message}
                                        </p>

                                        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                                            <span className="flex items-center space-x-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{notification.time_ago || 'Recent'}</span>
                                            </span>

                                            {notification.badge && (
                                                <span className="px-1.5 py-0.5 rounded-md font-semibold text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                                                    {notification.badge}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer View All Link */}
                    <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-center">
                        <Link
                            href={allNotificationsUrl}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center justify-center space-x-1.5 w-full py-2 px-3 rounded-xl text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                        >
                            <span>View All Notifications</span>
                            <ExternalLink className="h-3 w-3" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};
