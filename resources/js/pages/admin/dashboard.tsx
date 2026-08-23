import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { Contact, Portfolio, VisitorLog } from '@/types';
import { DateRangeFilter } from '@/components/admin/date-range-filter';
import { ReplyEmailModal } from '@/components/admin/reply-email-modal';
import {
    Layers,
    Eye,
    MessageSquare,
    Users,
    Activity,
    Globe,
    Calendar,
    ArrowUpRight,
    TrendingUp,
    Smartphone,
    Monitor,
    Send,
    ExternalLink,
    ChevronRight,
    BookOpen
} from 'lucide-react';

// Chart.js imports
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface DashboardProps {
    kpis: {
        total_projects: number;
        total_views: number;
        total_blogs?: number;
        total_blog_reads?: number;
        total_contacts: number;
        unread_contacts: number;
        total_visitor_hits: number;
        unique_visitors: number;
    };
    filters: {
        from_date: string;
        to_date: string;
    };
    trafficChart: {
        labels: string[];
        views: number[];
        visitors: number[];
    };
    projectsChart: {
        labels: string[];
        views: number[];
    };
    deviceBreakdown: Record<string, number>;
    browserBreakdown: Record<string, number>;
    topPortfolios: Portfolio[];
    recentLogs: VisitorLog[];
    recentContacts: Contact[];
}

export default function Dashboard({
    kpis,
    filters,
    trafficChart,
    projectsChart,
    deviceBreakdown,
    browserBreakdown,
    topPortfolios,
    recentLogs,
    recentContacts,
}: DashboardProps) {
    const [replyingContact, setReplyingContact] = useState<Contact | null>(null);

    const handleDateFilterApply = (from: string, to: string) => {
        router.get(
            '/admin/dashboard',
            { from_date: from, to_date: to },
            { preserveState: true, preserveScroll: true }
        );
    };

    // Chart.js Configuration: Traffic Line Chart
    const lineChartData = {
        labels: trafficChart.labels,
        datasets: [
            {
                label: 'Total Page Views',
                data: trafficChart.views,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
            },
            {
                label: 'Unique Visitors',
                data: trafficChart.visitors,
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
            },
        ],
    };

    // Chart.js Configuration: Top Projects Bar Chart (Which item visited how many times)
    const barChartData = {
        labels: projectsChart.labels,
        datasets: [
            {
                label: 'Tracked Project Visits',
                data: projectsChart.views,
                backgroundColor: [
                    '#6366f1',
                    '#8b5cf6',
                    '#ec4899',
                    '#06b6d4',
                    '#10b981',
                    '#f59e0b',
                    '#3b82f6',
                    '#14b8a6',
                ],
                borderRadius: 8,
            },
        ],
    };

    // Chart.js Configuration: Device Breakdown
    const deviceLabels = Object.keys(deviceBreakdown);
    const deviceValues = Object.values(deviceBreakdown);
    const doughnutDeviceData = {
        labels: deviceLabels.length ? deviceLabels : ['Desktop', 'Mobile'],
        datasets: [
            {
                data: deviceValues.length ? deviceValues : [70, 30],
                backgroundColor: ['#6366f1', '#06b6d4', '#ec4899', '#f59e0b'],
                borderWidth: 0,
            },
        ],
    };

    return (
        <AdminLayout
            title="Analytics Dashboard"
            breadcrumbs={[{ title: 'Dashboard' }]}
        >
            <div className="space-y-8">
                {/* Header & Date Range Filter */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Platform Traffic & Intelligence
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Live telemetry overview, item visit rankings, and visitor logs.
                        </p>
                    </div>

                    <DateRangeFilter
                        fromDate={filters.from_date}
                        toDate={filters.to_date}
                        onApply={handleDateFilterApply}
                        onClear={() => handleDateFilterApply('', '')}
                    />
                </div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase text-slate-500">Total Projects</span>
                            <Layers className="h-4 w-4 text-indigo-500" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                            {kpis.total_projects}
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase text-slate-500">Project Visits</span>
                            <Eye className="h-4 w-4 text-cyan-400" />
                        </div>
                        <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                            {kpis.total_views.toLocaleString()}
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase text-slate-500">Blog Articles</span>
                            <BookOpen className="h-4 w-4 text-purple-500" />
                        </div>
                        <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                            {kpis.total_blogs ?? 0}
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase text-slate-500">Total Blog Reads</span>
                            <Eye className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                            {(kpis.total_blog_reads ?? 0).toLocaleString()}
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase text-slate-500">Inquiries</span>
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                            {kpis.total_contacts}
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase text-slate-500">Unread</span>
                            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                        </div>
                        <div className="text-2xl font-black text-red-500">
                            {kpis.unread_contacts}
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase text-slate-500">Total Page Hits</span>
                            <Activity className="h-4 w-4 text-teal-500" />
                        </div>
                        <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
                            {kpis.total_visitor_hits.toLocaleString()}
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase text-slate-500">Unique IPs</span>
                            <Users className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                            {kpis.unique_visitors.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Main Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Traffic Line Chart */}
                    <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Visitor Traffic Trend (Daily)
                                </h3>
                                <p className="text-xs text-slate-500">Total hits vs Unique visitor IPs</p>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400 text-xs font-bold">
                                Real-Time Logged
                            </span>
                        </div>

                        <div className="h-72 w-full">
                            <Line
                                data={lineChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'top' as const } },
                                    scales: { y: { beginAtZero: true, grid: { color: 'rgba(150, 150, 150, 0.1)' } } },
                                }}
                            />
                        </div>
                    </div>

                    {/* Device Doughnut Breakdown */}
                    <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Device Distribution
                        </h3>
                        <div className="h-56 w-full flex items-center justify-center">
                            <Doughnut
                                data={doughnutDeviceData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom' as const } },
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Top Visited Items Bar Chart (Which item visited how many times) */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Project Analytics (Which item visited how many times)
                            </h3>
                            <p className="text-xs text-slate-500">Live visit counts tracked across all portfolio products</p>
                        </div>
                        <Link
                            href="/admin/portfolios"
                            className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline flex items-center space-x-1"
                        >
                            <span>Manage All Projects</span>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="h-64 w-full">
                        <Bar
                            data={barChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: { y: { beginAtZero: true, grid: { color: 'rgba(150, 150, 150, 0.1)' } } },
                            }}
                        />
                    </div>
                </div>

                {/* Lower Dual Tables: Recent Inquiries & Recent Visitor Logs */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Recent Inquiries with Quick Reply Action */}
                    <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                <MessageSquare className="h-4 w-4 text-purple-500" />
                                <span>Recent Inquiries</span>
                            </h3>
                            <Link href="/admin/contacts" className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline">
                                View All ({kpis.total_contacts})
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {recentContacts.length === 0 ? (
                                <p className="text-xs text-slate-500 py-4">No recent inquiries.</p>
                            ) : (
                                recentContacts.map((contact) => (
                                    <div key={contact.id} className="py-3.5 flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs font-bold text-slate-900 dark:text-white">{contact.name}</span>
                                                {!contact.is_read && (
                                                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] font-bold">New</span>
                                                )}
                                                {contact.replied_at && (
                                                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">Replied</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-1">{contact.subject}</p>
                                        </div>

                                        <button
                                            onClick={() => setReplyingContact(contact)}
                                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1 transition-all"
                                        >
                                            <Send className="h-3 w-3" />
                                            <span>Reply</span>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Visitor Logs */}
                    <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                <Activity className="h-4 w-4 text-cyan-400" />
                                <span>Recent Visitor Hits</span>
                            </h3>
                            <Link href="/admin/visitor-logs" className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline">
                                Full Logs
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {recentLogs.map((log) => (
                                <div key={log.id} className="py-2.5 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{log.ip_address}</span>
                                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500">{log.device_type} • {log.browser}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 font-mono line-clamp-1">{log.url}</p>
                                    </div>
                                    <span className="text-[10px] text-slate-500 shrink-0">
                                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Email Reply Modal */}
            <ReplyEmailModal
                contact={replyingContact}
                isOpen={Boolean(replyingContact)}
                onClose={() => setReplyingContact(null)}
            />
        </AdminLayout>
    );
}
