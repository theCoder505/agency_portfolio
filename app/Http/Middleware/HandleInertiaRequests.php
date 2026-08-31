<?php

namespace App\Http\Middleware;

use App\Models\AppSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $appSettings = AppSetting::getAllGrouped();

        $pendingSubscriptionsCount = 0;
        $pendingCustomOrdersCount = 0;
        $customerActiveSubscriptionsCount = 0;
        $customerCustomOrdersCount = 0;

        try {
            if ($request->user('admin')) {
                $pendingSubscriptionsCount = \App\Models\SaasSubscription::where('status', 'pending')
                    ->orWhereHas('invoices', fn($q) => $q->where('status', 'pending'))
                    ->count();
                $pendingCustomOrdersCount = \App\Models\CustomOrder::where('status', 'pending')->count();
            }
            if ($request->user()) {
                $customerActiveSubscriptionsCount = \App\Models\SaasSubscription::where('user_id', $request->user()->id)
                    ->where('status', 'active')
                    ->count();
                $customerCustomOrdersCount = \App\Models\CustomOrder::where('user_id', $request->user()->id)
                    ->whereIn('status', ['pending', 'accepted', 'in_progress'])
                    ->count();
            }
        } catch (\Throwable $e) {
            // tables not migrated yet
        }

        return array_merge(parent::share($request), [
            'name' => $appSettings['brand_name'] ?? config('app.name', 'CodeVenture Tech'),
            'app_settings' => $appSettings,
            'auth' => [
                'user' => $request->user(),
                'admin' => $request->user('admin'),
            ],
            'pending_subscriptions_count' => $pendingSubscriptionsCount,
            'pending_custom_orders_count' => $pendingCustomOrdersCount,
            'customer_active_subscriptions_count' => $customerActiveSubscriptionsCount,
            'customer_custom_orders_count' => $customerCustomOrdersCount,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
                'warning' => session('warning'),
                'info' => session('info'),
            ],
        ]);
    }
}
