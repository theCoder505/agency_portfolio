import React, { useEffect, useState } from 'react';
import { Link, usePage, router, Head } from '@inertiajs/react';
import { SharedData } from '@/types';
import {
    LayoutDashboard,
    Layers,
    Receipt,
    User,
    LogOut,
    ExternalLink,
    Menu,
    X,
    Sparkles,
    ShieldCheck,
    Globe,
    ShoppingBag,
    Headphones,
    CheckCircle2,
    FolderGit2,
    PlusCircle
} from 'lucide-react';
import { ThemeToggle } from '@/components/surface/theme-toggle';
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
    const { auth, app_settings, flash, customer_active_subscriptions_count, customer_custom_orders_count } = usePage<SharedData>().props;
    const { url } = usePage();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    const navigation = [
        { label: 'My Workspace', href: '/customer/dashboard', icon: LayoutDashboard },
        { 
            label: 'Custom Projects', 
            href: '/customer/custom-orders', 
            icon: FolderGit2, 
            badge: customer_custom_orders_count 
        },
        { label: 'My Subscriptions', href: '/customer/subscriptions', icon: Layers, badge: customer_active_subscriptions_count },
        { label: 'Payment Invoices', href: '/customer/invoices', icon: Receipt },
        { label: 'Account Profile', href: '/customer/profile', icon: User },
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
        <div className="h-screen h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row overflow-hidden transition-colors duration-200">
            <Head>
                <title>{`${title} - Customer Portal | ${brandName}`}</title>
                {app_settings?.favicon && <link rel="icon" href={app_settings.favicon} />}
            </Head>

            {/* Mobile Top Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 z-30">
                <Link href="/customer/dashboard" className="flex items-center space-x-2.5 min-w-0">
                    {app_settings?.favicon ? (
                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 p-1.5 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                            <img
                                src={app_settings.favicon}
                                alt={brandName}
                                className="h-full w-full object-contain"
                            />
                        </div>
                    ) : app_settings?.logo ? (
                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 p-1 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                            <img
                                src={app_settings.logo}
                                alt={brandName}
                                className="h-full w-full object-contain"
                            />
                        </div>
                    ) : (
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                            <Sparkles className="h-4 w-4" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <span className="font-bold text-sm tracking-tight truncate text-slate-900 dark:text-white block">
                            {brandName}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-cyan-400 block -mt-0.5">
                            Customer Portal
                        </span>
                    </div>
                </Link>
                <div className="flex items-center space-x-2">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
                />
            )}

            {/* Fixed Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 h-screen h-[100dvh] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 shadow-xl md:shadow-none transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
                    <Link href="/customer/dashboard" className="flex items-center space-x-3 group min-w-0">
                        {app_settings?.favicon ? (
                            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 p-2 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs group-hover:border-indigo-500/50 transition-colors">
                                <img
                                    src={app_settings.favicon}
                                    alt={brandName}
                                    className="h-full w-full object-contain transition-transform group-hover:scale-105"
                                />
                            </div>
                        ) : app_settings?.logo ? (
                            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs group-hover:border-indigo-500/50 transition-colors">
                                <img
                                    src={app_settings.logo}
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
                        <div className="min-w-0">
                            <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-white truncate">
                                {brandName}
                            </h1>
                            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-cyan-400 block truncate">
                                Customer Workspace
                            </span>
                        </div>
                    </Link>

                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Nav Links */}
                <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const IconComp = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                        active
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <IconComp className={`h-4 w-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                                        <span>{item.label}</span>
                                    </div>
                                    {typeof item.badge === 'number' && item.badge > 0 && (
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
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                        <Link
                            href="/saas-products"
                            className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-cyan-400 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 transition-all border border-indigo-200/60 dark:border-indigo-800/50"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            <span>Browse SaaS Catalog</span>
                        </Link>
                    </div>
                </div>

                {/* Bottom User Profile & Live Link */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3 flex-shrink-0 bg-white dark:bg-slate-900">
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors"
                    >
                        <span className="flex items-center space-x-2">
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Visit Public Site</span>
                        </span>
                        <span className="text-[10px] text-slate-400">↗</span>
                    </a>

                    <div className="flex items-center justify-between pt-1">
                        <Link href="/customer/profile" className="flex items-center space-x-2.5 group min-w-0">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="text-left min-w-0 truncate">
                                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                                    {user?.name || 'Customer'}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
                            </div>
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
                {/* Desktop Header */}
                <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex-shrink-0 z-10">
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

                    <div className="flex items-center space-x-3">
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
                <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};
