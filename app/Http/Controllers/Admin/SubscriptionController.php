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
        $subscriptions = SaasSubscription::with(['user', 'product', 'approver', 'invoices'])
            ->orderBy('created_at', 'desc')
            ->get();

        $pendingSubscriptionsCount = SaasSubscription::where('status', 'pending')->count();
        $pendingInvoicesCount = SubscriptionInvoice::where('status', 'pending')->count();
        $pendingRenewalsCount = SubscriptionInvoice::where('status', 'pending')->where('type', 'renewal')->count();
        $subscriptionsWithPendingInvoices = SaasSubscription::where('status', 'pending')
            ->orWhereHas('invoices', fn($q) => $q->where('status', 'pending'))
            ->count();

        $kpis = [
            'total' => SaasSubscription::count(),
            'pending' => $pendingSubscriptionsCount,
            'pending_invoices' => $pendingInvoicesCount,
            'pending_renewals' => $pendingRenewalsCount,
            'total_pending_actions' => $subscriptionsWithPendingInvoices,
            'active' => SaasSubscription::where('status', 'active')->count(),
            'expired' => SaasSubscription::where('status', 'expired')->count(),
            'rejected' => SaasSubscription::where('status', 'rejected')->count(),
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
            'package_tier' => 'nullable|string|in:basic,standard,premium',
            'billing_cycle' => 'required|in:monthly,half_yearly,yearly',
            'amount' => 'required|numeric|min:0',
            'currency' => 'nullable|string|in:BDT,USD,EUR',
            'exchange_rate_to_bdt' => 'nullable|numeric|min:0.01',
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
        $currency = $validated['currency'] ?? 'BDT';
        $validated['currency'] = $currency;
        $validated['package_tier'] = $validated['package_tier'] ?? 'standard';

        $rate = !empty($validated['exchange_rate_to_bdt']) 
            ? (float) $validated['exchange_rate_to_bdt'] 
            : (($currency === 'EUR') ? 130.0 : (($currency === 'USD') ? 120.0 : 1.0));
        $validated['exchange_rate_to_bdt'] = $rate;

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
                'exchange_rate_to_bdt' => $rate,
                'payment_method' => $subscription->payment_method,
                'sender_number' => $subscription->sender_number,
                'transaction_id' => $subscription->transaction_id ?? ('ADM-' . rand(1000, 9999)),
                'type' => 'initial',
                'status' => 'paid',
                'period_start' => $subscription->starts_at?->toDateString(),
                'period_end' => $subscription->expires_at?->toDateString(),
                'paid_at' => Carbon::now(),
                'notes' => 'Created manually by administrator for ' . ucfirst($subscription->package_tier) . ' tier',
            ]);
        }

        return redirect()->route('admin.subscriptions.index')
            ->with('success', 'Customer Subscription created successfully!');
    }

    /**
     * Find a subscription by numeric ID or order_number.
     */
    protected function findSubscription(string|int $id): SaasSubscription
    {
        return SaasSubscription::where(function ($query) use ($id) {
            $query->where('id', $id)->orWhere('order_number', $id);
        })->firstOrFail();
    }

    /**
     * Display the specified subscription with verification details (support ID or order_number).
     */
    public function show(string $id): Response
    {
        $subscription = SaasSubscription::with([
            'user',
            'product',
            'approver',
            'invoices' => fn($q) => $q->orderBy('created_at', 'desc'),
        ])
        ->where(function ($query) use ($id) {
            $query->where('id', $id)->orWhere('order_number', $id);
        })
        ->firstOrFail();

        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('admin/subscriptions/show', [
            'subscription' => $subscription,
            'currencySymbol' => $appSettings['currency_symbol'] ?? '৳',
        ]);
    }

    /**
     * Edit existing subscription dates, domain, subdomain, or credentials.
     */
    public function edit(string|int $id): Response
    {
        $subscription = SaasSubscription::with(['user', 'product'])
            ->where(function ($query) use ($id) {
                $query->where('id', $id)->orWhere('order_number', $id);
            })
            ->firstOrFail();

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
    public function update(Request $request, string|int $id): RedirectResponse
    {
        $subscription = $this->findSubscription($id);

        $validated = $request->validate([
            'package_tier' => 'nullable|string|in:basic,standard,premium',
            'billing_cycle' => 'required|in:monthly,half_yearly,yearly',
            'amount' => 'required|numeric|min:0',
            'currency' => 'nullable|string|in:BDT,USD,EUR',
            'exchange_rate_to_bdt' => 'nullable|numeric|min:0.01',
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

        if (!empty($validated['exchange_rate_to_bdt'])) {
            SubscriptionInvoice::where('subscription_id', $subscription->id)->update([
                'exchange_rate_to_bdt' => (float) $validated['exchange_rate_to_bdt'],
            ]);
        }

        return redirect()->route('admin.subscriptions.show', $subscription->order_number)
            ->with('success', 'Subscription details & exchange rate updated successfully!');
    }

    /**
     * Update exchange rate to BDT for a subscription and its invoices.
     */
    public function updateExchangeRate(Request $request, string|int $id): RedirectResponse
    {
        $subscription = $this->findSubscription($id);

        $validated = $request->validate([
            'exchange_rate_to_bdt' => 'required|numeric|min:0.01',
        ]);

        $rate = (float) $validated['exchange_rate_to_bdt'];

        $subscription->update([
            'exchange_rate_to_bdt' => $rate,
        ]);

        SubscriptionInvoice::where('subscription_id', $subscription->id)->update([
            'exchange_rate_to_bdt' => $rate,
        ]);

        return redirect()->route('admin.subscriptions.show', $subscription->order_number)
            ->with('success', "Exchange rate updated: 1 {$subscription->currency} = ৳" . number_format($rate, 2) . " BDT");
    }

    /**
     * Cross-check & Approve an order/subscription.
     */
    public function approve(Request $request, string|int $id): RedirectResponse
    {
        $subscription = $this->findSubscription($id);

        $validated = $request->validate([
            'starts_at' => 'required|date',
            'expires_at' => 'required|date|after_or_equal:starts_at',
            'domain' => 'nullable|string|max:100',
            'subdomain' => 'nullable|string|max:50',
            'exchange_rate_to_bdt' => 'nullable|numeric|min:0.01',
            'admin_notes' => 'nullable|string',
            'invoice_id' => 'nullable|exists:subscription_invoices,id',
        ]);

        $admin = Auth::guard('admin')->user();
        $startsAt = Carbon::parse($validated['starts_at']);
        $expiresAt = Carbon::parse($validated['expires_at']);
        $rate = !empty($validated['exchange_rate_to_bdt']) 
            ? (float) $validated['exchange_rate_to_bdt'] 
            : ($subscription->exchange_rate_to_bdt ?: (($subscription->currency === 'EUR') ? 130.0 : (($subscription->currency === 'USD') ? 120.0 : 1.0)));

        $subscription->update([
            'status' => 'active',
            'starts_at' => $startsAt,
            'expires_at' => $expiresAt,
            'domain' => $validated['domain'],
            'subdomain' => $validated['subdomain'],
            'exchange_rate_to_bdt' => $rate,
            'admin_notes' => $validated['admin_notes'],
            'approved_at' => Carbon::now(),
            'approved_by' => $admin?->id,
            'rejection_reason' => null,
            'last_renewed_at' => Carbon::now(),
        ]);

        // Find pending invoice to mark as paid
        $pendingInvoiceQuery = SubscriptionInvoice::where('subscription_id', $subscription->id)
            ->where('status', 'pending');

        if (!empty($validated['invoice_id'])) {
            $pendingInvoice = $pendingInvoiceQuery->where('id', $validated['invoice_id'])->first();
        } else {
            $pendingInvoice = $pendingInvoiceQuery->latest()->first();
        }

        if ($pendingInvoice) {
            $pendingInvoice->update([
                'status' => 'paid',
                'period_start' => $startsAt->toDateString(),
                'period_end' => $expiresAt->toDateString(),
                'exchange_rate_to_bdt' => $rate,
                'paid_at' => Carbon::now(),
            ]);
        }

        return redirect()->route('admin.subscriptions.show', $subscription->order_number)
            ->with('success', 'Subscription Order #' . $subscription->order_number . ' verified and activated successfully!');
    }

    /**
     * Approve a specific renewal or initial invoice for a subscription.
     */
    public function approveInvoice(Request $request, string|int $id, int $invoiceId): RedirectResponse
    {
        $subscription = $this->findSubscription($id);
        $invoice = SubscriptionInvoice::where('subscription_id', $subscription->id)
            ->findOrFail($invoiceId);

        $admin = Auth::guard('admin')->user();
        $rate = $invoice->exchange_rate_to_bdt ?: ($subscription->exchange_rate_to_bdt ?: (($subscription->currency === 'EUR') ? 130.0 : (($subscription->currency === 'USD') ? 120.0 : 1.0)));

        // Calculate continuous extension period
        if ($invoice->type === 'renewal') {
            $baseDate = ($subscription->status === 'active' && $subscription->expires_at && $subscription->expires_at->isFuture())
                ? $subscription->expires_at->copy()
                : Carbon::now();

            $newExpiresAt = SaasSubscription::calculateExpiryDate($baseDate, $invoice->billing_cycle ?: $subscription->billing_cycle);

            $subscription->update([
                'status' => 'active',
                'expires_at' => $newExpiresAt,
                'approved_at' => Carbon::now(),
                'approved_by' => $admin?->id,
                'rejection_reason' => null,
                'last_renewed_at' => Carbon::now(),
            ]);

            $invoice->update([
                'status' => 'paid',
                'period_start' => $baseDate->toDateString(),
                'period_end' => $newExpiresAt->toDateString(),
                'exchange_rate_to_bdt' => $rate,
                'paid_at' => Carbon::now(),
            ]);
        } else {
            $startsAt = $subscription->starts_at ?: Carbon::now();
            $expiresAt = $subscription->expires_at ?: SaasSubscription::calculateExpiryDate($startsAt, $invoice->billing_cycle ?: $subscription->billing_cycle);

            $subscription->update([
                'status' => 'active',
                'starts_at' => $startsAt,
                'expires_at' => $expiresAt,
                'approved_at' => Carbon::now(),
                'approved_by' => $admin?->id,
                'rejection_reason' => null,
            ]);

            $invoice->update([
                'status' => 'paid',
                'period_start' => $startsAt->toDateString(),
                'period_end' => $expiresAt->toDateString(),
                'exchange_rate_to_bdt' => $rate,
                'paid_at' => Carbon::now(),
            ]);
        }

        return redirect()->route('admin.subscriptions.show', $subscription->order_number)
            ->with('success', 'Invoice #' . $invoice->invoice_number . ' (TrxID: ' . ($invoice->transaction_id ?: 'N/A') . ') approved and subscription extended successfully!');
    }

    /**
     * Reject a specific invoice for a subscription.
     */
    public function rejectInvoice(Request $request, string|int $id, int $invoiceId): RedirectResponse
    {
        $subscription = $this->findSubscription($id);
        $invoice = SubscriptionInvoice::where('subscription_id', $subscription->id)
            ->findOrFail($invoiceId);

        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $invoice->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
        ]);

        return redirect()->route('admin.subscriptions.show', $subscription->order_number)
            ->with('warning', 'Invoice #' . $invoice->invoice_number . ' has been marked as rejected.');
    }

    /**
     * Reject an order/subscription with reason.
     */
    public function reject(Request $request, string|int $id): RedirectResponse
    {
        $subscription = $this->findSubscription($id);

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

        return redirect()->route('admin.subscriptions.show', $subscription->order_number)
            ->with('warning', 'Order #' . $subscription->order_number . ' has been marked as rejected.');
    }

    /**
     * Remove the specified subscription.
     */
    public function destroy(string|int $id): RedirectResponse
    {
        $subscription = $this->findSubscription($id);
        $subscription->delete();

        return redirect()->route('admin.subscriptions.index')
            ->with('success', 'Subscription deleted successfully!');
    }
}
