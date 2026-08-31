import React, { useEffect, useState } from 'react';
import { Link, usePage, router, Head } from '@inertiajs/react';
import { SharedData } from '@/types';
import {
    Home,
    Layers,
    Receipt,
    User,
    LogOut,
    ExternalLink,
    Sparkles,
    ShoppingBag,
    FolderGit2,
    PanelLeftClose,
    PanelLeftOpen,
    ChevronLeft,
    Bell,
    Grid,
    X,
} from 'lucide-react';
import { ThemeToggle } from '@/components/surface/theme-toggle';
import { NotificationsDropdown } from '@/components/notifications-dropdown';
import { showToast, showSuccessAlert, showErrorAlert } from '@/lib/swal';

interface CustomerLayoutProps {
    children: React.ReactNode;
    title?: string;
    breadcrumbs?: { title: string; href?: string }[];
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({
    children,
    title = 'Customer Portal',
    breadcrumbs = [],
}) => {
    const { 
        auth, 
        app_settings, 
        flash, 
        customer_active_subscriptions_count, 
        customer_custom_orders_count,
        unread_notifications_count = 0
    } = usePage<SharedData>().props;
    const { url } = usePage();

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('customer_sidebar_collapsed') === 'true';
        }
        return false;
    });

    const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

    const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('customer_sidebar_collapsed', String(next));
            }
            return next;
        });
    };

    const user = auth?.user;
    const brandName = app_settings?.brand_name || 'CodeVenture Tech';

    useEffect(() => {
        if (flash?.success) {
            showSuccessAlert('Success', flash.success);
        } else if (flash?.error) {
            showErrorAlert('Error', flash.error);
        } else if (flash?.warning) {
            showToast(flash.warning, 'warning');
        } else if (flash?.info) {
            showToast(flash.info, 'info');
        }
    }, [flash]);

    // Close quick menu when navigating
    useEffect(() => {
        setIsQuickMenuOpen(false);
    }, [url]);

    const navigation = [
        { label: 'My Workspace', shortLabel: 'Home', href: '/customer/dashboard', icon: Home },
        { 
            label: 'Custom Projects', 
            shortLabel: 'Projects',
            href: '/customer/custom-orders', 
            icon: FolderGit2, 
            badge: customer_custom_orders_count 
        },
        { 
            label: 'My Subscriptions', 
            shortLabel: 'Plans',
            href: '/customer/subscriptions', 
            icon: Layers, 
            badge: customer_active_subscriptions_count 
        },
        { label: 'Payment Invoices', shortLabel: 'Invoices', href: '/customer/invoices', icon: Receipt },
        { label: 'Account Profile', shortLabel: 'Profile', href: '/customer/profile', icon: User },
    ];

    const isActive = (href: string) => {
        if (href === '/customer/dashboard') return url === '/customer/dashboard' || url === '/customer';
        return url.startsWith(href);
    };

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/logout');
    };

    return (
        <div className="h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row overflow-hidden transition-colors duration-200">
            <Head>
                <title>{`${title} - Customer Portal | ${brandName}`}</title>
                {app_settings?.favicon && <link rel="icon" href={app_settings.favicon} />}
            </Head>

            {/* Desktop Fixed Sidebar with dynamic width */}
            <aside
                className={`hidden md:flex inset-y-0 left-0 z-50 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col flex-shrink-0 shadow-none transition-all duration-300 ease-in-out static ${
                    isSidebarCollapsed ? 'w-20' : 'w-64'
                }`}
            >
                {/* Brand Header */}
                <div
                    className={`p-4 border-b border-slate-100 dark:border-slate-800 flex items-center flex-shrink-0 ${
                        isSidebarCollapsed ? 'justify-center' : 'justify-between'
                    }`}
                >
                    <Link
                        href="/customer/dashboard"
                        className="flex items-center space-x-3 group min-w-0"
                        title={brandName}
                    >
                        {app_settings?.favicon ? (
                            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 p-2 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs group-hover:border-indigo-500/50 transition-colors">
                                <img
                                    src={app_settings.favicon}
                                    alt={brandName}
                                    className="h-full w-full object-contain transition-transform group-hover:scale-105"
                                />
                            </div>
                        ) : (app_settings?.logo_dark && app_settings?.logo) ? (
                            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs group-hover:border-indigo-500/50 transition-colors">
                                <img
                                    src={app_settings.logo}
                                    alt={brandName}
                                    className="h-full w-full object-contain transition-transform group-hover:scale-105 dark:hidden"
                                />
                                <img
                                    src={app_settings.logo_dark}
                                    alt={brandName}
                                    className="h-full w-full object-contain transition-transform group-hover:scale-105 hidden dark:block"
                                />
                            </div>
                        ) : (app_settings?.logo_dark || app_settings?.logo) ? (
                            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs group-hover:border-indigo-500/50 transition-colors">
                                <img
                                    src={app_settings?.logo_dark || app_settings?.logo}
                                    alt={brandName}
                                    className="h-full w-full object-contain transition-transform group-hover:scale-105"
                                />
                            </div>
                        ) : (
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[2px] shadow-sm group-hover:shadow-indigo-500/20 transition-all">
                                <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-300">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                            </div>
                        )}
                        {!isSidebarCollapsed && (
                            <div className="min-w-0">
                                <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-white truncate">
                                    {brandName}
                                </h1>
                                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-cyan-400 block truncate">
                                    Customer Workspace
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Collapse Chevron inside sidebar (desktop only, when expanded) */}
                    {!isSidebarCollapsed && (
                        <button
                            type="button"
                            onClick={toggleSidebarCollapse}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Minimize Sidebar"
                            aria-label="Minimize Sidebar"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Nav Links */}
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 space-y-1">
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const IconComp = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={isSidebarCollapsed ? item.label : undefined}
                                    className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                                        isSidebarCollapsed
                                            ? 'justify-center px-0 h-11'
                                            : 'justify-between px-3.5 py-2.5'
                                    } ${
                                        active
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <div className={`flex items-center ${isSidebarCollapsed ? 'space-x-0' : 'space-x-3'}`}>
                                        <div className="relative flex items-center justify-center">
                                            <IconComp className={`h-4 w-4 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                                            {typeof item.badge === 'number' && item.badge > 0 && isSidebarCollapsed && (
                                                <span className="flex absolute -top-1.5 -right-2 px-1 min-w-[15px] h-[15px] rounded-full text-[9px] font-black items-center justify-center bg-indigo-600 text-white ring-2 ring-white dark:ring-slate-900">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                        {!isSidebarCollapsed && (
                                            <span className="truncate">{item.label}</span>
                                        )}
                                    </div>
                                    {!isSidebarCollapsed && typeof item.badge === 'number' && item.badge > 0 && (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            active ? 'bg-white text-indigo-600' : 'bg-indigo-500/10 text-indigo-600 dark:text-cyan-400'
                                        }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Deploy New SaaS Plan Link */}
                    <div
                        className={`mt-4 border-t border-slate-100 dark:border-slate-800 ${
                            isSidebarCollapsed ? 'pt-3 flex justify-center' : 'pt-4'
                        }`}
                    >
                        <Link
                            href="/saas-products"
                            title="Browse SaaS Catalog"
                            className={`flex items-center rounded-xl text-xs font-bold text-indigo-600 dark:text-cyan-400 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 transition-all border border-indigo-200/60 dark:border-indigo-800/50 ${
                                isSidebarCollapsed
                                    ? 'justify-center px-0 h-10 w-11'
                                    : 'space-x-3 px-3.5 py-2.5'
                            }`}
                        >
                            <ShoppingBag className="h-4 w-4 flex-shrink-0" />
                            {!isSidebarCollapsed && <span>Browse SaaS Catalog</span>}
                        </Link>
                    </div>
                </div>

                {/* Bottom User Profile & Live Link */}
                <div
                    className={`border-t border-slate-100 dark:border-slate-800 space-y-3 flex-shrink-0 bg-white dark:bg-slate-900 ${
                        isSidebarCollapsed ? 'p-2' : 'p-4'
                    }`}
                >
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Visit Public Site"
                        className={`flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors ${
                            isSidebarCollapsed
                                ? 'justify-center px-0 h-10'
                                : 'justify-between px-3 py-2'
                        }`}
                    >
                        <span className="flex items-center space-x-2">
                            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                            {!isSidebarCollapsed && <span>Visit Public Site</span>}
                        </span>
                        {!isSidebarCollapsed && <span className="text-[10px] text-slate-400">↗</span>}
                    </a>

                    <div
                        className={`flex items-center pt-1 ${
                            isSidebarCollapsed
                                ? 'flex-col space-y-2 justify-center'
                                : 'justify-between'
                        }`}
                    >
                        <Link
                            href="/customer/profile"
                            title={isSidebarCollapsed ? (user?.name || 'Customer Profile') : undefined}
                            className={`flex items-center space-x-2.5 group min-w-0 ${
                                isSidebarCollapsed ? 'space-x-0 justify-center' : ''
                            }`}
                        >
                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            {!isSidebarCollapsed && (
                                <div className="text-left min-w-0 truncate">
                                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                                        {user?.name || 'Customer'}
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
                                </div>
                            )}
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0"
                            title="Sign Out"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Desktop Header (Hidden completely on mobile for edge-to-edge app experience) */}
                <header className="hidden md:flex items-center justify-between px-6 lg:px-8 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex-shrink-0 z-10">
                    {/* Left: Sidebar Toggle + Breadcrumbs */}
                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={toggleSidebarCollapse}
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800 transition-colors"
                            title={isSidebarCollapsed ? 'Maximize Sidebar' : 'Minimize Sidebar'}
                            aria-label={isSidebarCollapsed ? 'Maximize Sidebar' : 'Minimize Sidebar'}
                        >
                            {isSidebarCollapsed ? (
                                <PanelLeftOpen className="h-4 w-4" />
                            ) : (
                                <PanelLeftClose className="h-4 w-4" />
                            )}
                        </button>

                        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                            <Link href="/customer/dashboard" className="hover:text-slate-900 dark:hover:text-white">
                                Portal
                            </Link>
                            {breadcrumbs.map((b, i) => (
                                <React.Fragment key={i}>
                                    <span>/</span>
                                    {b.href ? (
                                        <Link href={b.href} className="hover:text-slate-900 dark:hover:text-white font-semibold">
                                            {b.title}
                                        </Link>
                                    ) : (
                                        <span className="text-slate-900 dark:text-white font-bold">{b.title}</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <NotificationsDropdown isAdmin={false} />
                        <ThemeToggle />
                        <Link
                            href="/saas-products"
                            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
                        >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            <span>Subscribe New SaaS</span>
                        </Link>
                    </div>
                </header>

                {/* Page Body Content */}
                <main className="flex-1 min-h-0 overflow-y-auto p-4 pt-4 pb-28 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>

            {/* Quick Actions / Top Menu Bottom Sheet (Mobile) */}
            {isQuickMenuOpen && (
                <div
                    onClick={() => setIsQuickMenuOpen(false)}
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 md:hidden transition-opacity"
                    aria-hidden="true"
                />
            )}

            <div
                className={`fixed inset-x-0 bottom-0 z-50 md:hidden bg-white dark:bg-slate-900 rounded-t-[32px] border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-out p-5 pb-8 max-h-[85vh] overflow-y-auto ${
                    isQuickMenuOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'
                }`}
            >
                {/* Pull Indicator */}
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4" />

                {/* User Info & Close Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <div className="flex items-center space-x-3 min-w-0">
                        {app_settings?.favicon ? (
                            <div className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1.5 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                                <img
                                    src={app_settings.favicon}
                                    alt={brandName}
                                    className="h-full w-full object-contain"
                                />
                            </div>
                        ) : (
                            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        )}
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {user?.name || brandName}
                            </h3>
                            <p className="text-xs text-slate-400 truncate">{user?.email || 'Customer Portal'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsQuickMenuOpen(false)}
                        className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Grid of Top Menu Quick Actions & Controls */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Notifications */}
                    <Link
                        href="/customer/notifications"
                        onClick={() => setIsQuickMenuOpen(false)}
                        className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                    >
                        <div className="relative p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400">
                            <Bell className="h-5 w-5" />
                            {unread_notifications_count > 0 && (
                                <span className="absolute -top-1 -right-1 px-1 min-w-[15px] h-[15px] rounded-full text-[9px] font-black items-center justify-center bg-rose-500 text-white flex">
                                    {unread_notifications_count}
                                </span>
                            )}
                        </div>
                        <div className="text-left min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-white">Notifications</div>
                            <div className="text-[10px] text-slate-400">
                                {unread_notifications_count > 0 ? `${unread_notifications_count} new` : 'No unread'}
                            </div>
                        </div>
                    </Link>

                    {/* Dark/Light Theme Toggle */}
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex items-center space-x-2.5">
                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 dark:text-cyan-400">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <div className="text-xs font-bold text-slate-900 dark:text-white">Theme</div>
                                <div className="text-[10px] text-slate-400">Mode</div>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>

                    {/* SaaS Store Link */}
                    <Link
                        href="/saas-products"
                        onClick={() => setIsQuickMenuOpen(false)}
                        className="flex items-center space-x-3 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-indigo-200/70 dark:border-indigo-800/60 transition-colors col-span-2"
                    >
                        <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                        <div className="text-left min-w-0 flex-1">
                            <div className="text-xs font-bold text-indigo-950 dark:text-cyan-300">Browse SaaS Catalog</div>
                            <div className="text-[10px] text-indigo-600 dark:text-cyan-400">Explore & subscribe ready-made cloud solutions</div>
                        </div>
                        <span className="text-xs text-indigo-600 dark:text-cyan-400 font-bold">↗</span>
                    </Link>

                    {/* Account Profile */}
                    <Link
                        href="/customer/profile"
                        onClick={() => setIsQuickMenuOpen(false)}
                        className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                    >
                        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                            <User className="h-5 w-5" />
                        </div>
                        <div className="text-left min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-white">Profile</div>
                            <div className="text-[10px] text-slate-400">Security & details</div>
                        </div>
                    </Link>

                    {/* Visit Public Site */}
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                    >
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <ExternalLink className="h-5 w-5" />
                        </div>
                        <div className="text-left min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-white">Public Site</div>
                            <div className="text-[10px] text-slate-400">Visit homepage ↗</div>
                        </div>
                    </a>
                </div>

                {/* Sign Out Button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/70 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 font-bold text-xs transition-all"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out from Portal</span>
                </button>
            </div>

            {/* Mobile App Floating Bottom Navigation Bar (Faithful replica of reference design in both themes) */}
            <div className="fixed bottom-0 left-0 w-full inset-x-3 sm:inset-x-6 max-w-md mx-auto z-40 md:hidden">
                <nav
                    aria-label="Customer Mobile Bottom Navigation"
                    className="relative shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
                >
                    {/* Top tinted band matching the reference image */}
                    <div className="absolute bottom-0 inset-x-0 h-16.5 border-b pointer-events-none bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800" />

                    <div className="relative grid grid-cols-5 items-end justify-items-center h-16 pt-1 px-1 pb-1">
                        {/* 1. Workspace / Home */}
                        {(() => {
                            const active = isActive('/customer/dashboard');
                            return (
                                <Link
                                    href="/customer/dashboard"
                                    className="flex flex-col items-center justify-end h-full w-full relative active:scale-95 transition-transform"
                                >
                                    {active ? (
                                        <div className="flex flex-col items-center justify-center relative -top-3 z-10">
                                            <div className="w-[48px] h-[48px] rounded-full bg-white dark:bg-slate-800 shadow-[0_6px_20px_rgba(99,102,241,0.3)] dark:shadow-[0_6px_20px_rgba(6,182,212,0.3)] border border-slate-200/70 dark:border-slate-700 ring-4 ring-slate-100/95 dark:ring-slate-950 flex items-center justify-center text-indigo-600 dark:text-cyan-400 transition-all duration-300">
                                                <Home className="h-5 w-5 fill-indigo-600/20 dark:fill-cyan-400/20" />
                                            </div>
                                            <span className="text-[10px] font-bold text-indigo-600 dark:text-cyan-400 mt-0.5">
                                                Home
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pb-1 text-slate-600 dark:text-slate-400">
                                            <div className="h-6 flex items-center justify-center">
                                                <Home className="h-5 w-5 stroke-[1.65]" />
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mt-1">
                                                Home
                                            </span>
                                        </div>
                                    )}
                                </Link>
                            );
                        })()}

                        {/* 2. Custom Projects */}
                        {(() => {
                            const active = isActive('/customer/custom-orders');
                            return (
                                <Link
                                    href="/customer/custom-orders"
                                    className="flex flex-col items-center justify-end h-full w-full relative active:scale-95 transition-transform"
                                >
                                    {active ? (
                                        <div className="flex flex-col items-center justify-center relative -top-3 z-10">
                                            <div className="w-[48px] h-[48px] rounded-full bg-white dark:bg-slate-800 shadow-[0_6px_20px_rgba(99,102,241,0.3)] dark:shadow-[0_6px_20px_rgba(6,182,212,0.3)] border border-slate-200/70 dark:border-slate-700 ring-4 ring-slate-100/95 dark:ring-slate-950 flex items-center justify-center text-indigo-600 dark:text-cyan-400 transition-all duration-300 relative">
                                                <FolderGit2 className="h-5 w-5 fill-indigo-600/20 dark:fill-cyan-400/20" />
                                                {typeof customer_custom_orders_count === 'number' && customer_custom_orders_count > 0 && (
                                                    <span className="absolute -top-1 -right-1 px-1 min-w-[15px] h-[15px] rounded-full text-[9px] font-black items-center justify-center bg-rose-500 text-white flex">
                                                        {customer_custom_orders_count}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-bold text-indigo-600 dark:text-cyan-400 mt-0.5">
                                                Projects
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pb-1 text-slate-600 dark:text-slate-400">
                                            <div className="h-6 flex items-center justify-center relative">
                                                <FolderGit2 className="h-5 w-5 stroke-[1.65]" />
                                                {typeof customer_custom_orders_count === 'number' && customer_custom_orders_count > 0 && (
                                                    <span className="absolute -top-1.5 -right-2 px-1 min-w-[14px] h-[14px] rounded-full text-[8px] font-black items-center justify-center bg-rose-500 text-white flex">
                                                        {customer_custom_orders_count}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mt-1">
                                                Projects
                                            </span>
                                        </div>
                                    )}
                                </Link>
                            );
                        })()}

                        {/* 3. Subscriptions / Plans */}
                        {(() => {
                            const active = isActive('/customer/subscriptions');
                            return (
                                <Link
                                    href="/customer/subscriptions"
                                    className="flex flex-col items-center justify-end h-full w-full relative active:scale-95 transition-transform"
                                >
                                    {active ? (
                                        <div className="flex flex-col items-center justify-center relative -top-3 z-10">
                                            <div className="w-[48px] h-[48px] rounded-full bg-white dark:bg-slate-800 shadow-[0_6px_20px_rgba(99,102,241,0.3)] dark:shadow-[0_6px_20px_rgba(6,182,212,0.3)] border border-slate-200/70 dark:border-slate-700 ring-4 ring-slate-100/95 dark:ring-slate-950 flex items-center justify-center text-indigo-600 dark:text-cyan-400 transition-all duration-300 relative">
                                                <Layers className="h-5 w-5 fill-indigo-600/20 dark:fill-cyan-400/20" />
                                                {typeof customer_active_subscriptions_count === 'number' && customer_active_subscriptions_count > 0 && (
                                                    <span className="absolute -top-1 -right-1 px-1 min-w-[15px] h-[15px] rounded-full text-[9px] font-black items-center justify-center bg-rose-500 text-white flex">
                                                        {customer_active_subscriptions_count}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-bold text-indigo-600 dark:text-cyan-400 mt-0.5">
                                                Plans
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pb-1 text-slate-600 dark:text-slate-400">
                                            <div className="h-6 flex items-center justify-center relative">
                                                <Layers className="h-5 w-5 stroke-[1.65]" />
                                                {typeof customer_active_subscriptions_count === 'number' && customer_active_subscriptions_count > 0 && (
                                                    <span className="absolute -top-1.5 -right-2 px-1 min-w-[14px] h-[14px] rounded-full text-[8px] font-black items-center justify-center bg-rose-500 text-white flex">
                                                        {customer_active_subscriptions_count}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mt-1">
                                                Plans
                                            </span>
                                        </div>
                                    )}
                                </Link>
                            );
                        })()}

                        {/* 4. Invoices */}
                        {(() => {
                            const active = isActive('/customer/invoices');
                            return (
                                <Link
                                    href="/customer/invoices"
                                    className="flex flex-col items-center justify-end h-full w-full relative active:scale-95 transition-transform"
                                >
                                    {active ? (
                                        <div className="flex flex-col items-center justify-center relative -top-3 z-10">
                                            <div className="w-[48px] h-[48px] rounded-full bg-white dark:bg-slate-800 shadow-[0_6px_20px_rgba(99,102,241,0.3)] dark:shadow-[0_6px_20px_rgba(6,182,212,0.3)] border border-slate-200/70 dark:border-slate-700 ring-4 ring-slate-100/95 dark:ring-slate-950 flex items-center justify-center text-indigo-600 dark:text-cyan-400 transition-all duration-300">
                                                <Receipt className="h-5 w-5 fill-indigo-600/20 dark:fill-cyan-400/20" />
                                            </div>
                                            <span className="text-[10px] font-bold text-indigo-600 dark:text-cyan-400 mt-0.5">
                                                Invoices
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pb-1 text-slate-600 dark:text-slate-400">
                                            <div className="h-6 flex items-center justify-center">
                                                <Receipt className="h-5 w-5 stroke-[1.65]" />
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mt-1">
                                                Invoices
                                            </span>
                                        </div>
                                    )}
                                </Link>
                            );
                        })()}

                        {/* 5. Menu / App Hub (Opens top menu controls sheet) */}
                        {(() => {
                            const active = isQuickMenuOpen || isActive('/customer/profile');
                            return (
                                <button
                                    type="button"
                                    onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
                                    className="flex flex-col items-center justify-end h-full w-full relative active:scale-95 transition-transform"
                                    aria-label="Open App Hub"
                                >
                                    {active ? (
                                        <div className="flex flex-col items-center justify-center relative -top-3 z-10">
                                            <div className="w-[48px] h-[48px] rounded-full bg-white dark:bg-slate-800 shadow-[0_6px_20px_rgba(99,102,241,0.3)] dark:shadow-[0_6px_20px_rgba(6,182,212,0.3)] border border-slate-200/70 dark:border-slate-700 ring-4 ring-slate-100/95 dark:ring-slate-950 flex items-center justify-center text-indigo-600 dark:text-cyan-400 transition-all duration-300 relative">
                                                <Grid className="h-5 w-5 fill-indigo-600/20 dark:fill-cyan-400/20" />
                                                {unread_notifications_count > 0 && (
                                                    <span className="absolute -top-1 -right-1 px-1 min-w-[15px] h-[15px] rounded-full text-[9px] font-black items-center justify-center bg-rose-500 text-white flex">
                                                        {unread_notifications_count}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-bold text-indigo-600 dark:text-cyan-400 mt-0.5">
                                                Menu
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pb-1 text-slate-600 dark:text-slate-400">
                                            <div className="h-6 flex items-center justify-center relative">
                                                <Grid className="h-5 w-5 stroke-[1.65]" />
                                                {unread_notifications_count > 0 && (
                                                    <span className="absolute -top-1.5 -right-2 px-1 min-w-[14px] h-[14px] rounded-full text-[8px] font-black items-center justify-center bg-rose-500 text-white flex">
                                                        {unread_notifications_count}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mt-1">
                                                Menu
                                            </span>
                                        </div>
                                    )}
                                </button>
                            );
                        })()}
                    </div>

                    {/* Bottom iOS style indicator pill */}
                    <div className="pb-1.5 pt-0.5">
                        <div className="w-24 h-1 bg-slate-300/80 dark:bg-slate-700/80 rounded-full mx-auto" />
                    </div>
                </nav>
            </div>
        </div>
    );
};
