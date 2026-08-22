import React, { useEffect } from 'react';
import { Link, usePage, router, Head } from '@inertiajs/react';
import { SharedData } from '@/types';
import {
    LayoutDashboard,
    Layers,
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
    Sun,
    Moon,
    Code,
    Sparkles,
    UserCheck
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
    const { auth, app_settings, flash } = usePage<SharedData>().props;
    const { url } = usePage();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

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
        { label: 'Portfolios & Products', href: '/admin/portfolios', icon: Layers },
        { label: 'Categories', href: '/admin/categories', icon: FolderTree },
        { label: 'Contact Inquiries', href: '/admin/contacts', icon: MessageSquare },
        { label: 'Visitor Logs & Analytics', href: '/admin/visitor-logs', icon: Activity },
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200">
            <Head title={`${title} - Admin Panel`} />

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <Link href="/admin/dashboard" className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                        CV
                    </div>
                    <span className="font-bold text-sm tracking-tight">{brandName}</span>
                </Link>
                <div className="flex items-center space-x-2">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-800"
                    >
                        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Admin Sidebar Navigation */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 md:translate-x-0 md:static flex flex-col justify-between ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand Header */}
                <div>
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <Link href="/admin/dashboard" className="flex items-center space-x-3 group">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[2px]">
                                <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400 font-bold text-sm">
                                    CV
                                </div>
                            </div>
                            <div>
                                <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                                    {brandName}
                                </h1>
                                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-cyan-400">
                                    Admin Workspace
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Nav Links */}
                    <nav className="p-3 space-y-1">
                        {navigation.map((item) => {
                            const IconComp = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                        active
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <IconComp className={`h-4 w-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom User Profile & Live Link */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                    >
                        <span className="flex items-center space-x-2">
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>View Live Website</span>
                        </span>
                        <span className="text-[10px] text-slate-400">↗</span>
                    </a>

                    <div className="flex items-center justify-between pt-1">
                        <Link href="/admin/profile" className="flex items-center space-x-2.5 group">
                            {admin?.avatar ? (
                                <img
                                    src={admin.avatar}
                                    alt={admin.name}
                                    className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/20"
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                    {admin?.name?.charAt(0) || 'A'}
                                </div>
                            )}
                            <div className="text-left">
                                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                    {admin?.name || 'Admin'}
                                </div>
                                <div className="text-[10px] text-slate-400">Super Administrator</div>
                            </div>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Sign Out"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Desktop Header */}
                <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
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

                {/* Page Body Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};
