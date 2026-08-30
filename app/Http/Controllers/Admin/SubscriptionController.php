<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\AppSetting;
use App\Models\SaasProduct;
use App\Models\SaasSubscription;
use App\Models\SubscriptionInvoice;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    /**
     * Display a listing of customer subscriptions & orders.
     */
    public function index(Request $request): Response
    {
        $subscriptions = SaasSubscription::with(['user', 'product', 'approver'])
            ->orderBy('created_at', 'desc')
            ->get();

        $kpis = [
            'total' => SaasSubscription::count(),
            'pending' => SaasSubscription::where('status', 'pending')->count(),
            'active' => SaasSubscription::where('status', 'active')->count(),
            'expired' => SaasSubscription::where('status', 'expired')->count(),
            'total_revenue' => SubscriptionInvoice::where('status', 'paid')->sum('amount'),
        ];

        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('admin/subscriptions/index', [
            'subscriptions' => $subscriptions,
            'kpis' => $kpis,
            'currencySymbol' => $appSettings['currency_symbol'] ?? '৳',
        ]);
    }

    /**
     * Show the form for creating a new subscription manually.
     */
    public function create(): Response
    {
        $users = User::where('status', 'active')->orderBy('name')->get(['id', 'name', 'email', 'phone']);
        $products = SaasProduct::where('is_active', true)->orderBy('name')->get();
        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('admin/subscriptions/form', [
            'subscription' => null,
            'users' => $users,
            'products' => $products,
            'isEdit' => false,
            'currencySymbol' => $appSettings['currency_symbol'] ?? '৳',
        ]);
    }

    /**
     * Store a manually created subscription.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'saas_product_id' => 'required|exists:saas_products,id',
            'billing_cycle' => 'required|in:monthly,half_yearly,yearly',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:pending,active,expired,rejected,cancelled',
            'payment_method' => 'required|string|max:50',
            'sender_number' => 'nullable|string|max:30',
            'transaction_id' => 'nullable|string|max:50',
            'domain' => 'nullable|string|max:100',
            'subdomain' => 'nullable|string|max:50',
            'admin_notes' => 'nullable|string',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
        ]);

        $admin = Auth::guard('admin')->user();
        $appSettings = AppSetting::getAllGrouped();
        $validated['currency'] = $appSettings['currency_code'] ?? 'BDT';

        if ($validated['status'] === 'active') {
            $startsAt = !empty($validated['starts_at']) ? Carbon::parse($validated['starts_at']) : Carbon::now();
            $validated['starts_at'] = $startsAt;

            if (empty($validated['expires_at'])) {
                $validated['expires_at'] = SaasSubscription::calculateExpiryDate($startsAt, $validated['billing_cycle']);
            }
            $validated['approved_at'] = Carbon::now();
            $validated['approved_by'] = $admin?->id;
        }

        $subscription = SaasSubscription::create($validated);

        // Create paid invoice if active
        if ($subscription->status === 'active') {
            SubscriptionInvoice::create([
                'subscription_id' => $subscription->id,
                'user_id' => $subscription->user_id,
                'billing_cycle' => $subscription->billing_cycle,
                'amount' => $subscription->amount,
                'currency' => $subscription->currency,
                'payment_method' => $subscription->payment_method,
                'sender_number' => $subscription->sender_number,
                'transaction_id' => $subscription->transaction_id ?? ('ADM-' . rand(1000, 9999)),
                'type' => 'initial',
                'status' => 'paid',
                'period_start' => $subscription->starts_at?->toDateString(),
                'period_end' => $subscription->expires_at?->toDateString(),
                'paid_at' => Carbon::now(),
                'notes' => 'Created manually by administrator',
            ]);
        }

        return redirect()->route('admin.subscriptions.index')
            ->with('success', 'Customer Subscription created successfully!');
    }

    /**
     * Display the specified subscription with verification details.
     */
    public function show(int $id): Response
    {
        $subscription = SaasSubscription::with([
            'user',
            'product',
            'approver',
            'invoices' => fn($q) => $q->orderBy('created_at', 'desc'),
        ])->findOrFail($id);

        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('admin/subscriptions/show', [
            'subscription' => $subscription,
            'currencySymbol' => $appSettings['currency_symbol'] ?? '৳',
        ]);
    }

    /**
     * Edit existing subscription dates, domain, subdomain, or credentials.
     */
    public function edit(int $id): Response
    {
        $subscription = SaasSubscription::with(['user', 'product'])->findOrFail($id);
        $users = User::where('status', 'active')->orderBy('name')->get(['id', 'name', 'email', 'phone']);
        $products = SaasProduct::where('is_active', true)->orderBy('name')->get();
        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('admin/subscriptions/form', [
            'subscription' => $subscription,
            'users' => $users,
            'products' => $products,
            'isEdit' => true,
            'currencySymbol' => $appSettings['currency_symbol'] ?? '৳',
        ]);
    }

    /**
     * Update existing subscription.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $subscription = SaasSubscription::findOrFail($id);

        $validated = $request->validate([
            'billing_cycle' => 'required|in:monthly,half_yearly,yearly',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:pending,active,expired,rejected,cancelled',
            'domain' => 'nullable|string|max:100',
            'subdomain' => 'nullable|string|max:50',
            'admin_notes' => 'nullable|string',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date',
            'transaction_id' => 'nullable|string|max:50',
            'sender_number' => 'nullable|string|max:30',
        ]);

        $subscription->update($validated);

        return redirect()->route('admin.subscriptions.show', $subscription->id)
            ->with('success', 'Subscription details updated successfully!');
    }

    /**
     * Cross-check & Approve an order/subscription.
     */
    public function approve(Request $request, int $id): RedirectResponse
    {
        $subscription = SaasSubscription::findOrFail($id);

        $validated = $request->validate([
            'starts_at' => 'required|date',
            'expires_at' => 'required|date|after_or_equal:starts_at',
            'domain' => 'nullable|string|max:100',
            'subdomain' => 'nullable|string|max:50',
            'admin_notes' => 'nullable|string',
        ]);

        $admin = Auth::guard('admin')->user();
        $startsAt = Carbon::parse($validated['starts_at']);
        $expiresAt = Carbon::parse($validated['expires_at']);

        $subscription->update([
            'status' => 'active',
            'starts_at' => $startsAt,
            'expires_at' => $expiresAt,
            'domain' => $validated['domain'],
            'subdomain' => $validated['subdomain'],
            'admin_notes' => $validated['admin_notes'],
            'approved_at' => Carbon::now(),
            'approved_by' => $admin?->id,
            'rejection_reason' => null,
        ]);

        // Mark pending invoice as paid
        $pendingInvoice = SubscriptionInvoice::where('subscription_id', $subscription->id)
            ->where('status', 'pending')
            ->latest()
            ->first();

        if ($pendingInvoice) {
            $pendingInvoice->update([
                'status' => 'paid',
                'period_start' => $startsAt->toDateString(),
                'period_end' => $expiresAt->toDateString(),
                'paid_at' => Carbon::now(),
            ]);
        }

        return redirect()->route('admin.subscriptions.show', $subscription->id)
            ->with('success', 'Subscription Order #' . $subscription->order_number . ' verified and activated successfully!');
    }

    /**
     * Reject an order/subscription with reason.
     */
    public function reject(Request $request, int $id): RedirectResponse
    {
        $subscription = SaasSubscription::findOrFail($id);

        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $subscription->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
        ]);

        SubscriptionInvoice::where('subscription_id', $subscription->id)
            ->where('status', 'pending')
            ->update([
                'status' => 'rejected',
                'rejection_reason' => $request->rejection_reason,
            ]);

        return redirect()->route('admin.subscriptions.show', $subscription->id)
            ->with('warning', 'Order #' . $subscription->order_number . ' has been marked as rejected.');
    }

    /**
     * Remove the specified subscription.
     */
    public function destroy(int $id): RedirectResponse
    {
        $subscription = SaasSubscription::findOrFail($id);
        $subscription->delete();

        return redirect()->route('admin.subscriptions.index')
            ->with('success', 'Subscription deleted successfully!');
    }
}
