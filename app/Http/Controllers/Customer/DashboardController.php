<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\SaasSubscription;
use App\Models\SubscriptionInvoice;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Customer Portal Dashboard Overview.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        // Check if any subscriptions have expired past their date and update status if needed
        SaasSubscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', Carbon::now())
            ->update(['status' => 'expired']);

        $subscriptions = SaasSubscription::with('product')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $activeSubscriptions = $subscriptions->filter(fn($s) => $s->status === 'active');
        $pendingSubscriptions = $subscriptions->filter(fn($s) => $s->status === 'pending');
        $expiredSubscriptions = $subscriptions->filter(fn($s) => $s->status === 'expired' || $s->is_expired_now);

        $recentInvoices = SubscriptionInvoice::with('subscription.product')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $customOrders = \App\Models\CustomOrder::with('milestones')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $appSettings = AppSetting::getAllGrouped();

        $kpis = [
            'total_active' => $activeSubscriptions->count(),
            'total_pending' => $pendingSubscriptions->count(),
            'total_expired' => $expiredSubscriptions->count(),
            'total_invoices' => SubscriptionInvoice::where('user_id', $user->id)->count(),
            'total_custom_orders' => \App\Models\CustomOrder::where('user_id', $user->id)->count(),
            'active_custom_orders' => \App\Models\CustomOrder::where('user_id', $user->id)->whereIn('status', ['pending', 'accepted', 'in_progress'])->count(),
        ];

        return Inertia::render('customer/dashboard', [
            'kpis' => $kpis,
            'activeSubscriptions' => $activeSubscriptions->values(),
            'pendingSubscriptions' => $pendingSubscriptions->values(),
            'expiredSubscriptions' => $expiredSubscriptions->values(),
            'allSubscriptions' => $subscriptions,
            'recentInvoices' => $recentInvoices,
            'customOrders' => $customOrders,
            'paymentSettings' => [
                'currency_symbol' => $appSettings['currency_symbol'] ?? '৳',
                'currency_code' => $appSettings['currency_code'] ?? 'BDT',
                'bkash_number' => $appSettings['bkash_number'] ?? '01712-345678',
                'bkash_instructions' => $appSettings['bkash_instructions'] ?? '',
                'nagad_number' => $appSettings['nagad_number'] ?? '01812-345678',
                'nagad_instructions' => $appSettings['nagad_instructions'] ?? '',
            ],
        ]);
    }
}
