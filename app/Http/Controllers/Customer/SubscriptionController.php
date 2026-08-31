<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\SaasSubscription;
use App\Models\SubscriptionInvoice;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    /**
     * Display a listing of customer subscriptions.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $subscriptions = SaasSubscription::with('product')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('customer/subscriptions/index', [
            'subscriptions' => $subscriptions,
            'paymentSettings' => [
                'currency_symbol' => $appSettings['currency_symbol'] ?? '৳',
                'currency_code' => $appSettings['currency_code'] ?? 'BDT',
                'bkash_number' => $appSettings['bkash_number'] ?? '01712-345678',
                'nagad_number' => $appSettings['nagad_number'] ?? '01812-345678',
            ],
        ]);
    }

    /**
     * Display a specific subscription with access details & credentials by order_number (or id fallback).
     */
    public function show(string $order_number): Response
    {
        $user = Auth::user();

        $subscription = SaasSubscription::with(['product', 'invoices' => function ($q) {
            $q->orderBy('created_at', 'desc');
        }])
            ->where('user_id', $user->id)
            ->where(function ($query) use ($order_number) {
                $query->where('order_number', $order_number)
                      ->orWhere('id', $order_number);
            })
            ->firstOrFail();

        $product = $subscription->product;
        $tier = $subscription->package_tier ?: 'standard';
        
        // Structured tier plans for renewal & upgrade/downgrade
        $tierPlans = [
            'monthly' => $product ? $product->getPriceForCycle('monthly', $tier) : $subscription->amount,
            'half_yearly' => $product ? $product->getPriceForCycle('half_yearly', $tier) : ($subscription->amount * 6),
            'yearly' => $product ? $product->getPriceForCycle('yearly', $tier) : ($subscription->amount * 10),
        ];

        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('customer/subscriptions/show', [
            'subscription' => $subscription,
            'tierPlans' => $tierPlans,
            'availablePackages' => $product?->packages ?? [],
            'paymentSettings' => [
                'currency_symbol' => $appSettings['currency_symbol'] ?? '৳',
                'currency_code' => $appSettings['currency_code'] ?? 'BDT',
                'bkash_number' => $appSettings['bkash_number'] ?? '01712-345678',
                'bkash_instructions' => $appSettings['bkash_instructions'] ?? 'Send money to our Personal/Merchant bKash number.',
                'nagad_number' => $appSettings['nagad_number'] ?? '01812-345678',
                'nagad_instructions' => $appSettings['nagad_instructions'] ?? 'Send money to our Personal Nagad number.',
            ],
        ]);
    }

    /**
     * Submit Renewal Payment for an existing subscription.
     */
    public function renew(Request $request, string $order_number): RedirectResponse
    {
        $user = Auth::user();

        $subscription = SaasSubscription::with('product')
            ->where('user_id', $user->id)
            ->where(function ($query) use ($order_number) {
                $query->where('order_number', $order_number)
                      ->orWhere('id', $order_number);
            })
            ->firstOrFail();

        $request->validate([
            'billing_cycle' => 'required|in:monthly,half_yearly,yearly',
            'payment_method' => 'required|in:bkash,nagad,rocket,manual_bank,upay,bank_transfer',
            'sender_number' => 'required|string|max:50',
            'transaction_id' => 'required|string|max:50',
            'notes' => 'nullable|string|max:500',
        ]);

        $tier = $subscription->package_tier ?: 'standard';
        $amount = $subscription->product 
            ? $subscription->product->getPriceForCycle($request->billing_cycle, $tier) 
            : $subscription->amount;

        $appSettings = AppSetting::getAllGrouped();
        $currency = $subscription->currency ?: ($appSettings['currency_code'] ?? 'BDT');

        // Calculate continuous renewal period starting from current expires_at if in future, or now
        $baseDate = ($subscription->status === 'active' && $subscription->expires_at && $subscription->expires_at->isFuture())
            ? $subscription->expires_at->copy()
            : Carbon::now();

        $newExpiresAt = SaasSubscription::calculateExpiryDate($baseDate, $request->billing_cycle);

        // Create renewal invoice
        $invoice = SubscriptionInvoice::create([
            'subscription_id' => $subscription->id,
            'user_id' => $user->id,
            'billing_cycle' => $request->billing_cycle,
            'amount' => $amount,
            'currency' => $currency,
            'payment_method' => $request->payment_method,
            'sender_number' => $request->sender_number,
            'transaction_id' => strtoupper(trim($request->transaction_id)),
            'type' => 'renewal',
            'status' => 'pending',
            'period_start' => $baseDate->toDateString(),
            'period_end' => $newExpiresAt->toDateString(),
            'notes' => $request->notes ?? ('Renewal payment for ' . ucfirst(str_replace('_', ' ', $request->billing_cycle)) . ' cycle (' . ucfirst($tier) . ' Tier)'),
        ]);

        \App\Services\NotificationService::sendBoth(
            $user,
            "Renewal Payment: SaaS Order #{$subscription->order_number}",
            "Client '{$user->name}' submitted renewal payment for {$subscription->product?->name} (" . ucfirst($tier) . " Tier) via " . strtoupper($request->payment_method) . " (TrxID: {$invoice->transaction_id}).",
            route('admin.subscriptions.show', $subscription->id),
            "Renewal Payment Submitted: #{$subscription->order_number}",
            "Your renewal payment (TrxID: {$invoice->transaction_id}) for {$subscription->product?->name} (" . ucfirst($tier) . " Tier) has been submitted for validation.",
            route('customer.subscriptions.show', $subscription->order_number),
            'subscription',
            'payment',
            'Renewal Submitted',
            ['subscription_id' => $subscription->id, 'order_number' => $subscription->order_number, 'invoice_id' => $invoice->id]
        );

        return redirect()->route('customer.subscriptions.show', $subscription->order_number)
            ->with('success', 'Your renewal invoice payment (TrxID: ' . $invoice->transaction_id . ') for the ' . ucfirst($tier) . ' Tier (' . ucfirst(str_replace('_', ' ', $request->billing_cycle)) . ') has been submitted for validation! The admin will verify and extend your service period.');
    }

    /**
     * Change package tier (Upgrade / Downgrade) instantly.
     */
    public function changePackage(Request $request, string $order_number): RedirectResponse
    {
        $user = Auth::user();

        $subscription = SaasSubscription::with('product')
            ->where('user_id', $user->id)
            ->where(function ($query) use ($order_number) {
                $query->where('order_number', $order_number)
                      ->orWhere('id', $order_number);
            })
            ->firstOrFail();

        $request->validate([
            'new_tier' => 'required|string|in:basic,standard,premium',
            'billing_cycle' => 'nullable|string|in:monthly,half_yearly,yearly',
        ]);

        $oldTier = $subscription->package_tier ?: 'standard';
        $newTier = strtolower($request->new_tier);
        $billingCycle = $request->billing_cycle ?: ($subscription->billing_cycle ?: 'monthly');

        $newAmount = $subscription->product
            ? $subscription->product->getPriceForCycle($billingCycle, $newTier)
            : $subscription->amount;

        // Apply instant package update
        $subscription->update([
            'package_tier' => $newTier,
            'billing_cycle' => $billingCycle,
            'amount' => $newAmount,
        ]);

        // Record a transaction audit invoice
        SubscriptionInvoice::create([
            'subscription_id' => $subscription->id,
            'user_id' => $user->id,
            'billing_cycle' => $billingCycle,
            'amount' => $newAmount,
            'currency' => $subscription->currency ?: 'BDT',
            'payment_method' => $subscription->payment_method ?: 'system',
            'sender_number' => $subscription->sender_number ?: 'N/A',
            'transaction_id' => 'TIER-' . strtoupper(Str::random(6)),
            'type' => 'package_change',
            'status' => 'paid',
            'period_start' => Carbon::now()->toDateString(),
            'period_end' => $subscription->expires_at?->toDateString(),
            'paid_at' => Carbon::now(),
            'notes' => 'Package tier instantly updated from ' . ucfirst($oldTier) . ' to ' . ucfirst($newTier) . ' Tier (' . ucfirst(str_replace('_', ' ', $billingCycle)) . ')',
        ]);

        \App\Services\NotificationService::sendBoth(
            $user,
            "Package Tier Changed: #{$subscription->order_number}",
            "Client '{$user->name}' updated subscription #{$subscription->order_number} to " . ucfirst($newTier) . " Tier.",
            route('admin.subscriptions.show', $subscription->id),
            "Package Tier Updated: #{$subscription->order_number}",
            "Your subscription has been updated to " . ucfirst($newTier) . " Tier with immediate effect.",
            route('customer.subscriptions.show', $subscription->order_number),
            'subscription',
            'check',
            ucfirst($newTier) . ' Tier',
            ['subscription_id' => $subscription->id, 'order_number' => $subscription->order_number]
        );

        return redirect()->route('customer.subscriptions.show', $subscription->order_number)
            ->with('success', 'Your subscription package has been successfully updated to ' . ucfirst($newTier) . ' Tier! The changes have taken effect immediately.');
    }
}
