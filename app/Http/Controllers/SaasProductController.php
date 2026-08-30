<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use App\Models\SaasProduct;
use App\Models\SaasSubscription;
use App\Models\SubscriptionInvoice;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class SaasProductController extends Controller
{
    /**
     * Display the SaaS Products / Pricing Catalog.
     */
    public function index(Request $request): Response
    {
        $products = SaasProduct::where('is_active', true)
            ->orderBy('is_featured', 'desc')
            ->orderBy('order')
            ->get();

        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('surface/saas-products', [
            'products' => $products,
            'paymentSettings' => [
                'currency_symbol' => $appSettings['currency_symbol'] ?? '৳',
                'currency_code' => $appSettings['currency_code'] ?? 'BDT',
                'bkash_number' => $appSettings['bkash_number'] ?? '01712-345678',
                'bkash_instructions' => $appSettings['bkash_instructions'] ?? '',
                'bkash_enabled' => ($appSettings['bkash_enabled'] ?? '1') == '1',
                'nagad_number' => $appSettings['nagad_number'] ?? '01812-345678',
                'nagad_instructions' => $appSettings['nagad_instructions'] ?? '',
                'nagad_enabled' => ($appSettings['nagad_enabled'] ?? '1') == '1',
            ],
        ]);
    }

    /**
     * Display full product details with Basic, Standard, and Premium packages.
     */
    public function show(Request $request, string $slug): Response
    {
        $product = SaasProduct::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $relatedProducts = SaasProduct::where('is_active', true)
            ->where('id', '!=', $product->id)
            ->orderBy('is_featured', 'desc')
            ->orderBy('order')
            ->take(3)
            ->get();

        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('surface/saas-products/show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
            'paymentSettings' => [
                'currency_symbol' => $appSettings['currency_symbol'] ?? '৳',
                'currency_code' => $appSettings['currency_code'] ?? 'BDT',
                'bkash_number' => $appSettings['bkash_number'] ?? '01712-345678',
                'bkash_instructions' => $appSettings['bkash_instructions'] ?? '',
                'bkash_enabled' => ($appSettings['bkash_enabled'] ?? '1') == '1',
                'nagad_number' => $appSettings['nagad_number'] ?? '01812-345678',
                'nagad_instructions' => $appSettings['nagad_instructions'] ?? '',
                'nagad_enabled' => ($appSettings['nagad_enabled'] ?? '1') == '1',
            ],
        ]);
    }

    /**
     * Show Checkout Page for a specific SaaS Product & Package Tier.
     */
    public function checkout(Request $request, string $slug): Response|RedirectResponse
    {
        $product = SaasProduct::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $cycle = $request->query('billing_cycle', 'monthly');
        if (!in_array($cycle, ['monthly', 'half_yearly', 'yearly'])) {
            $cycle = 'monthly';
        }

        $tier = $request->query('tier', 'standard');
        if (!in_array($tier, ['basic', 'standard', 'premium'])) {
            $tier = 'standard';
        }

        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('surface/checkout', [
            'product' => $product,
            'selectedCycle' => $cycle,
            'selectedTier' => $tier,
            'paymentSettings' => [
                'currency_symbol' => $appSettings['currency_symbol'] ?? '৳',
                'currency_code' => $appSettings['currency_code'] ?? 'BDT',
                'bkash_number' => $appSettings['bkash_number'] ?? '01712-345678',
                'bkash_instructions' => $appSettings['bkash_instructions'] ?? 'Send Money to the personal bKash number and copy the TrxID.',
                'bkash_enabled' => ($appSettings['bkash_enabled'] ?? '1') == '1',
                'nagad_number' => $appSettings['nagad_number'] ?? '01812-345678',
                'nagad_instructions' => $appSettings['nagad_instructions'] ?? 'Send Money to the personal Nagad number and copy the TrxID.',
                'nagad_enabled' => ($appSettings['nagad_enabled'] ?? '1') == '1',
            ],
        ]);
    }

    /**
     * Process Checkout & Order Creation with bKash/Nagad TrxID.
     */
    public function processCheckout(Request $request): RedirectResponse
    {
        $request->validate([
            'saas_product_id' => 'required|exists:saas_products,id',
            'package_tier' => 'required|in:basic,standard,premium',
            'billing_cycle' => 'required|in:monthly,half_yearly,yearly',
            'payment_method' => 'required|in:bkash,nagad,rocket,manual_bank',
            'sender_number' => 'required|string|max:30',
            'transaction_id' => 'required|string|max:50',
            'desired_domain' => 'nullable|string|max:100',
            'desired_subdomain' => 'nullable|string|max:50',
            'payment_notes' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();
        $whatsapp = $request->whatsapp_number ?: ($request->client_whatsapp ?: null);

        // If user is guest, handle registration or authentication
        if (!$user) {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255',
                'phone' => 'required|string|max:30',
                'whatsapp_number' => 'nullable|string|max:40',
                'password' => ['required', Password::defaults()],
                'company_name' => 'nullable|string|max:255',
            ]);

            // Check if user already exists
            $existingUser = User::where('email', $request->email)->first();
            if ($existingUser) {
                // Check if password matches
                if (Hash::check($request->password, $existingUser->password)) {
                    if ($whatsapp && empty($existingUser->whatsapp_number)) {
                        $existingUser->update(['whatsapp_number' => $whatsapp]);
                    }
                    Auth::login($existingUser);
                    $user = $existingUser;
                } else {
                    return back()->withErrors([
                        'email' => 'An account with this email already exists. Please log in or use a different email.',
                    ])->withInput();
                }
            } else {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'whatsapp_number' => $whatsapp ?: $request->phone,
                    'company_name' => $request->company_name,
                    'password' => Hash::make($request->password),
                    'status' => 'active',
                ]);
                Auth::login($user);
            }
        } elseif ($whatsapp && empty($user->whatsapp_number)) {
            $user->update(['whatsapp_number' => $whatsapp]);
        }

        $product = SaasProduct::findOrFail($request->saas_product_id);
        $amount = $product->getPriceForCycle($request->billing_cycle, $request->package_tier);
        $appSettings = AppSetting::getAllGrouped();
        $currency = $product->currency ?: ($appSettings['currency_code'] ?? 'BDT');

        // Create the pending subscription
        $subscription = SaasSubscription::create([
            'user_id' => $user->id,
            'saas_product_id' => $product->id,
            'package_tier' => $request->package_tier,
            'billing_cycle' => $request->billing_cycle,
            'amount' => $amount,
            'currency' => $currency,
            'status' => 'pending',
            'payment_method' => $request->payment_method,
            'sender_number' => $request->sender_number,
            'client_whatsapp' => $whatsapp ?: ($user->whatsapp_number ?: $user->phone),
            'client_email' => $user->email,
            'transaction_id' => strtoupper(trim($request->transaction_id)),
            'payment_notes' => $request->payment_notes,
            'domain' => $request->desired_domain,
            'subdomain' => $request->desired_subdomain,
        ]);

        // Create the initial invoice record
        SubscriptionInvoice::create([
            'subscription_id' => $subscription->id,
            'user_id' => $user->id,
            'billing_cycle' => $request->billing_cycle,
            'amount' => $amount,
            'currency' => $currency,
            'payment_method' => $request->payment_method,
            'sender_number' => $request->sender_number,
            'transaction_id' => strtoupper(trim($request->transaction_id)),
            'type' => 'initial',
            'status' => 'pending',
            'notes' => 'Initial ' . ucfirst($request->package_tier) . ' tier order via ' . strtoupper($request->payment_method),
        ]);

        return redirect()->route('customer.dashboard')->with('success', 'Your order (' . $subscription->order_number . ') for ' . $product->name . ' (' . ucfirst($request->package_tier) . ' Tier) has been placed successfully! Our team will verify your transaction (' . $subscription->transaction_id . ') and activate your service shortly.');
    }
}
