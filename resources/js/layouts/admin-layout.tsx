import React, { useEffect, useState } from 'react';
import { Link, usePage, router, Head } from '@inertiajs/react';
import { SharedData } from '@/types';
import {
    LayoutDashboard,
    Layers,
    BookOpen,
    FolderTree,
    MessageSquare,
    Activity,
    Settings,
    Users,
    Star,
    Shield,
    LogOut,
    ExternalLink,
    Menu,
    X,
    UserCheck,
    CreditCard,
    Package,
    FolderGit2,
    PanelLeftClose,
    PanelLeftOpen,
    ChevronLeft,
    TrendingUp
} from 'lucide-react';
import { ThemeToggle } from '@/components/surface/theme-toggle';
import { showToast, showSuccessAlert, showErrorAlert } from '@/lib/swal';

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    breadcrumbs?: { title: string; href?: string }[];
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
    children,
    title = 'Admin Panel',
    breadcrumbs = [],
}) => {
    const { auth, app_settings, flash, pending_subscriptions_count, pending_custom_orders_count } = usePage<SharedData>().props;
    const { url } = usePage();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('admin_sidebar_collapsed') === 'true';
        }
        return false;
    });

    const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('admin_sidebar_collapsed', String(next));
            }
            return next;
        });
    };

    const admin = auth?.admin;
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

    const navigation = [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { 
            label: 'Custom Orders', 
            href: '/admin/custom-orders', 
            icon: FolderGit2,
            badge: pending_custom_orders_count,
            badgeColor: 'bg-cyan-500 text-slate-950 font-bold'
        },
        { 
            label: 'Orders & Subscriptions', 
            href: '/admin/subscriptions', 
            icon: CreditCard,
            badge: pending_subscriptions_count,
            badgeColor: 'bg-amber-500 text-slate-950 font-bold'
        },
        { 
            label: 'Profit & Loss (P&L)', 
            href: '/admin/profite-and-loss', 
            icon: TrendingUp,
        },
        { label: 'SaaS Products', href: '/admin/saas-products', icon: Package },
        { label: 'Customers', href: '/admin/customers', icon: UserCheck },
        { label: 'Portfolios & Projects', href: '/admin/portfolios', icon: Layers },
        { label: 'Blogs & Articles', href: '/admin/blogs', icon: BookOpen },
        { label: 'Categories', href: '/admin/categories', icon: FolderTree },
        { label: 'Contact Inquiries', href: '/admin/contacts', icon: MessageSquare },
        { label: 'Visitor Analytics', href: '/admin/visitor-logs', icon: Activity },
        { label: 'Team Members', href: '/admin/team', icon: Users },
        { label: 'Reviews & Trustpilot', href: '/admin/reviews', icon: Star },
        { label: 'App Settings', href: '/admin/settings', icon: Settings },
        { label: 'Profile & Security (OTP)', href: '/admin/profile', icon: Shield },
    ];

    const isActive = (href: string) => {
        if (href === '/admin/dashboard') return url === '/admin' || url === '/admin/dashboard';
        return url.startsWith(href);
    };

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/admin/logout');
    };

    return (
        <div className="h-screen h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row overflow-hidden transition-colors duration-200">
            <Head>
                <title>{`${title} - Admin Panel | ${brandName}`}</title>
                {app_settings?.favicon ? (
                    <link rel="icon" href={app_settings.favicon} />
                ) : (
                    <link rel="icon" href="/favicon.ico" />
                )}
                {app_settings?.favicon && (
                    <link rel="shortcut icon" href={app_settings.favicon} />
                )}
            </Head>

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 z-30">
                <Link href="/admin/dashboard" className="flex items-center space-x-2.5 min-w-0">
                    {app_settings?.favicon ? (
                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 p-1.5 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs">
                            <img
                                src={app_settings.favicon}
                                alt={brandName}
                                className="h-full w-full object-contain"
                            />
                        </div>
                    ) : (
                        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {brandName.substring(0, 2).toUpperCase() || 'CV'}
                        </div>
                    )}
                    <span className="font-bold text-sm tracking-tight truncate text-slate-900 dark:text-white">
                        {brandName}
                    </span>
                </Link>
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Toggle Navigation Menu"
                    >
                        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Backdrop Overlay */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
                    aria-hidden="true"
                />
            )}

            {/* Admin Sidebar Navigation - Fixed 100vh with dynamic width */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 h-screen h-[100dvh] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 shadow-xl md:shadow-none transition-all duration-300 ease-in-out md:static md:translate-x-0 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } ${isSidebarCollapsed ? 'w-64 md:w-20' : 'w-64'}`}
            >
                {/* Brand Header (Fixed at top of sidebar) */}
                <div
                    className={`p-4 border-b border-slate-100 dark:border-slate-800 flex items-center flex-shrink-0 ${
                        isSidebarCollapsed ? 'md:justify-center justify-between' : 'justify-between'
                    }`}
                >
                    <Link
                        href="/admin/dashboard"
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
                        ) : (
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[2px] flex-shrink-0 shadow-sm group-hover:shadow-indigo-500/20 transition-all">
                                <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400 font-bold text-sm">
                                    {brandName.substring(0, 2).toUpperCase() || 'CV'}
                                </div>
                            </div>
                        )}
                        {!isSidebarCollapsed && (
                            <div className="min-w-0">
                                <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-white truncate">
                                    {brandName}
                                </h1>
                                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-cyan-400 block truncate">
                                    Admin Workspace
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Collapse chevron inside sidebar (desktop only, when expanded) */}
                    {!isSidebarCollapsed && (
                        <button
                            type="button"
                            onClick={toggleSidebarCollapse}
                            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Minimize Sidebar"
                            aria-label="Minimize Sidebar"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                    )}

                    {/* Mobile Close Button inside sidebar header */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Close Sidebar"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Nav Links (Scrolls inside the sidebar if needed) */}
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 space-y-1 custom-sidebar-scroll">
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const IconComp = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    title={isSidebarCollapsed ? item.label : undefined}
                                    className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                                        isSidebarCollapsed
                                            ? 'md:justify-center md:px-0 md:h-11 px-3.5 py-2.5 justify-between'
                                            : 'justify-between px-3.5 py-2.5'
                                    } ${
                                        active
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <div className={`flex items-center ${isSidebarCollapsed ? 'md:space-x-0 space-x-3' : 'space-x-3'}`}>
                                        <div className="relative flex items-center justify-center">
                                            <IconComp className={`h-4 w-4 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                                            {typeof item.badge === 'number' && item.badge > 0 && isSidebarCollapsed && (
                                                <span className="hidden md:flex absolute -top-1.5 -right-2 px-1 min-w-[15px] h-[15px] rounded-full text-[9px] font-black items-center justify-center bg-amber-500 text-slate-950 ring-2 ring-white dark:ring-slate-900">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                        {!isSidebarCollapsed && (
                                            <span className="truncate">{item.label}</span>
                                        )}
                                    </div>
                                    {(!isSidebarCollapsed || isSidebarOpen) && typeof item.badge === 'number' && item.badge > 0 && (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                            item.badgeColor || (active ? 'bg-white text-indigo-600' : 'bg-amber-500 text-slate-950')
                                        }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom User Profile & Live Link (Fixed at bottom of sidebar) */}
                <div
                    className={`border-t border-slate-100 dark:border-slate-800 space-y-3 flex-shrink-0 bg-white dark:bg-slate-900 ${
                        isSidebarCollapsed ? 'p-3 md:p-2' : 'p-4'
                    }`}
                >
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View Live Website"
                        className={`flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors ${
                            isSidebarCollapsed
                                ? 'md:justify-center md:px-0 md:h-10 px-3 py-2 justify-between'
                                : 'justify-between px-3 py-2'
                        }`}
                    >
                        <span className="flex items-center space-x-2">
                            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                            {!isSidebarCollapsed && <span>View Live Website</span>}
                        </span>
                        {!isSidebarCollapsed && <span className="text-[10px] text-slate-400">↗</span>}
                    </a>

                    <div
                        className={`flex items-center pt-1 ${
                            isSidebarCollapsed
                                ? 'md:flex-col md:space-y-2 md:justify-center justify-between'
                                : 'justify-between'
                        }`}
                    >
                        <Link
                            href="/admin/profile"
                            title={isSidebarCollapsed ? (admin?.name || 'Admin Profile') : undefined}
                            className={`flex items-center space-x-2.5 group min-w-0 ${
                                isSidebarCollapsed ? 'md:space-x-0 md:justify-center' : ''
                            }`}
                        >
                            {admin?.avatar ? (
                                <img
                                    src={admin.avatar}
                                    alt={admin.name}
                                    className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/20 flex-shrink-0"
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {admin?.name?.charAt(0) || 'A'}
                                </div>
                            )}
                            {!isSidebarCollapsed && (
                                <div className="text-left min-w-0 truncate">
                                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                                        {admin?.name || 'Admin'}
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate">Super Administrator</div>
                                </div>
                            )}
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex-shrink-0"
                            title="Sign Out"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Desktop Header */}
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

                        {/* Breadcrumbs */}
                        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                            <Link href="/admin/dashboard" className="hover:text-slate-900 dark:hover:text-white">
                                Admin
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

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                        <ThemeToggle />
                        <Link
                            href="/admin/portfolios/create"
                            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
                        >
                            <Layers className="h-3.5 w-3.5" />
                            <span>Add New Project</span>
                        </Link>
                    </div>
                </header>

                {/* Page Body Content - Scrolls independently */}
                <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};
