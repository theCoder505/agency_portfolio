<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\Contact;
use App\Models\Portfolio;
use App\Models\SaasProduct;
use App\Models\SaasSubscription;
use App\Models\User;
use App\Models\VisitorLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display Admin Analytics Dashboard with Chart.js datasets & Date Filter.
     */
    public function index(Request $request): Response
    {
        $startDate = $request->query('from_date') 
            ? Carbon::parse($request->query('from_date'))->startOfDay()
            : Carbon::now()->subDays(29)->startOfDay();

        $endDate = $request->query('to_date')
            ? Carbon::parse($request->query('to_date'))->endOfDay()
            : Carbon::now()->endOfDay();

        // 1. KPI Summary Cards
        $totalProjects = Portfolio::count();
        $totalViews = Portfolio::sum('views_count');
        $totalBlogs = Blog::count();
        $totalBlogReads = Blog::sum('reads_count');
        $totalContacts = Contact::whereBetween('created_at', [$startDate, $endDate])->count();
        $unreadContacts = Contact::where('is_read', false)->count();
        $totalVisitorHits = VisitorLog::whereBetween('created_at', [$startDate, $endDate])->count();
        $uniqueVisitors = VisitorLog::whereBetween('created_at', [$startDate, $endDate])
            ->distinct('ip_address')
            ->count('ip_address');

        // SaaS & Custom Orders Metrics
        $totalSaasProducts = SaasProduct::count();
        $totalCustomers = User::count();
        $pendingSubscriptions = SaasSubscription::where('status', 'pending')->count();
        $activeSubscriptions = SaasSubscription::where('status', 'active')->count();
        $totalCustomOrders = \App\Models\CustomOrder::count();
        $pendingCustomOrders = \App\Models\CustomOrder::where('status', 'pending')->count();
        $inProgressCustomOrders = \App\Models\CustomOrder::whereIn('status', ['accepted', 'in_progress'])->count();

        // 2. Chart.js Data: Daily Traffic Line Chart
        $dailyLogs = VisitorLog::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as total_views'),
                DB::raw('count(distinct ip_address) as unique_visitors')
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Fill date gaps for smooth line chart
        $chartLabels = [];
        $chartViews = [];
        $chartVisitors = [];
        $current = $startDate->copy();
        
        $logsByDate = $dailyLogs->keyBy('date');
        while ($current->lte($endDate)) {
            $dateKey = $current->format('Y-m-d');
            $chartLabels[] = $current->format('M d');
            $chartViews[] = isset($logsByDate[$dateKey]) ? (int)$logsByDate[$dateKey]->total_views : 0;
            $chartVisitors[] = isset($logsByDate[$dateKey]) ? (int)$logsByDate[$dateKey]->unique_visitors : 0;
            $current->addDay();
        }

        // 3. Chart.js Data: Top Visited Projects (Which item visited how many times)
        $topPortfolios = Portfolio::with('category')
            ->orderBy('views_count', 'desc')
            ->take(8)
            ->get(['id', 'title', 'slug', 'views_count', 'item_type', 'category_id', 'thumbnail']);

        $projectChartLabels = $topPortfolios->pluck('title')->toArray();
        $projectChartViews = $topPortfolios->pluck('views_count')->toArray();

        // 4. Chart.js Data: Device Types Breakdown (Desktop, Mobile, Tablet)
        $deviceBreakdown = VisitorLog::select('device_type', DB::raw('count(*) as count'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('device_type')
            ->pluck('count', 'device_type')
            ->toArray();

        // 5. Chart.js Data: Browsers Breakdown
        $browserBreakdown = VisitorLog::select('browser', DB::raw('count(*) as count'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('browser')
            ->orderBy('count', 'desc')
            ->take(5)
            ->pluck('count', 'browser')
            ->toArray();

        // 6. Recent Visitor Logs Table preview
        $recentLogs = VisitorLog::with('portfolio')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // 7. Recent Inquiries
        $recentContacts = Contact::orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // 8. Recent Custom Orders
        $recentCustomOrders = \App\Models\CustomOrder::with('user')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('admin/dashboard', [
            'kpis' => [
                'total_projects' => $totalProjects,
                'total_views' => $totalViews,
                'total_blogs' => $totalBlogs,
                'total_blog_reads' => $totalBlogReads,
                'total_contacts' => $totalContacts,
                'unread_contacts' => $unreadContacts,
                'total_visitor_hits' => $totalVisitorHits,
                'unique_visitors' => $uniqueVisitors,
                'total_saas_products' => $totalSaasProducts,
                'total_customers' => $totalCustomers,
                'pending_subscriptions' => $pendingSubscriptions,
                'active_subscriptions' => $activeSubscriptions,
                'total_custom_orders' => $totalCustomOrders,
                'pending_custom_orders' => $pendingCustomOrders,
                'in_progress_custom_orders' => $inProgressCustomOrders,
            ],
            'filters' => [
                'from_date' => $startDate->format('Y-m-d'),
                'to_date' => $endDate->format('Y-m-d'),
            ],
            'trafficChart' => [
                'labels' => $chartLabels,
                'views' => $chartViews,
                'visitors' => $chartVisitors,
            ],
            'projectsChart' => [
                'labels' => $projectChartLabels,
                'views' => $projectChartViews,
            ],
            'deviceBreakdown' => $deviceBreakdown,
            'browserBreakdown' => $browserBreakdown,
            'topPortfolios' => $topPortfolios,
            'recentLogs' => $recentLogs,
            'recentContacts' => $recentContacts,
            'recentCustomOrders' => $recentCustomOrders,
        ]);
    }
}
