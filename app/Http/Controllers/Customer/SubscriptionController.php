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
        $status = $request->query('status', 'all');

        $query = SaasSubscription::with('product')
            ->where('user_id', $user->id);

        if ($status !== 'all' && !empty($status)) {
            $query->where('status', $status);
        }

        $subscriptions = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('customer/subscriptions/index', [
            'subscriptions' => $subscriptions,
            'filters' => [
                'status' => $status,
            ],
            'paymentSettings' => [
                'currency_symbol' => $appSettings['currency_symbol'] ?? '৳',
                'currency_code' => $appSettings['currency_code'] ?? 'BDT',
                'bkash_number' => $appSettings['bkash_number'] ?? '01712-345678',
                'nagad_number' => $appSettings['nagad_number'] ?? '01812-345678',
            ],
        ]);
    }

    /**
     * Display a specific subscription with access details & credentials.
     */
    public function show(int $id): Response
    {
        $user = Auth::user();

        $subscription = SaasSubscription::with(['product', 'invoices' => function ($q) {
            $q->orderBy('created_at', 'desc');
        }])
            ->where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('customer/subscriptions/show', [
            'subscription' => $subscription,
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

    /**
     * Submit Renewal Payment for an existing subscription.
     */
    public function renew(Request $request, int $id): RedirectResponse
    {
        $user = Auth::user();

        $subscription = SaasSubscription::with('product')
            ->where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $request->validate([
            'billing_cycle' => 'required|in:monthly,half_yearly,yearly',
            'payment_method' => 'required|in:bkash,nagad,rocket,manual_bank',
            'sender_number' => 'required|string|max:30',
            'transaction_id' => 'required|string|max:50',
            'notes' => 'nullable|string|max:500',
        ]);

        $amount = $subscription->product->getPriceForCycle($request->billing_cycle);
        $appSettings = AppSetting::getAllGrouped();
        $currency = $appSettings['currency_code'] ?? 'BDT';

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
            'notes' => $request->notes ?? ('Renewal payment for ' . ucfirst(str_replace('_', ' ', $request->billing_cycle)) . ' cycle'),
        ]);

        return redirect()->route('customer.subscriptions.show', $subscription->id)
            ->with('success', 'Your renewal invoice payment (TrxID: ' . $invoice->transaction_id . ') has been submitted for validation! The admin will verify and extend your service period.');
    }
}
