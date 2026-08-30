<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Mail\MilestonePaymentSubmittedMail;
use App\Models\Admin;
use App\Models\AppSetting;
use App\Models\CustomOrder;
use App\Models\CustomOrderMilestone;
use App\Models\Review;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class CustomOrderController extends Controller
{
    /**
     * Display all custom orders belonging to the authenticated customer.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $status = $request->query('status', 'all');

        $query = CustomOrder::with(['milestones'])
            ->where('user_id', $user->id);

        if ($status !== 'all' && !empty($status)) {
            if ($status === 'in_progress' || $status === 'accepted') {
                $query->whereIn('status', ['accepted', 'in_progress']);
            } else {
                $query->where('status', $status);
            }
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

        $allOrders = CustomOrder::where('user_id', $user->id)->get();

        $kpis = [
            'total' => $allOrders->count(),
            'pending' => $allOrders->where('status', 'pending')->count(),
            'in_progress' => $allOrders->whereIn('status', ['accepted', 'in_progress'])->count(),
            'completed' => $allOrders->where('status', 'completed')->count(),
        ];

        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('customer/custom-orders/index', [
            'orders' => $orders,
            'kpis' => $kpis,
            'activeStatus' => $status,
            'currencySymbol' => $appSettings['currency_symbol'] ?? '৳',
        ]);
    }

    /**
     * Display detailed project overview & milestone payments for a custom order.
     */
    public function show(string|int $ref, ?string $title = null): Response
    {
        $user = Auth::user();
        $order = CustomOrder::with([
            'user',
            'review',
            'milestones' => function ($q) {
                $q->orderBy('order', 'asc')->orderBy('id', 'asc');
            }
        ])
        ->where('user_id', $user->id)
        ->where(function ($q) use ($ref) {
            $q->where('order_number', $ref);
            if (is_numeric($ref)) {
                $q->orWhere('id', (int) $ref);
            }
        })
        ->firstOrFail();

        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('customer/custom-orders/show', [
            'order' => $order,
            'appSettings' => $appSettings,
            'currencySymbol' => $appSettings['currency_symbol'] ?? '৳',
            'defaultPaymentSettings' => [
                'currency_symbol' => $appSettings['currency_symbol'] ?? '৳',
                'currency_code' => $appSettings['currency_code'] ?? 'BDT',
                'bkash_number' => $appSettings['bkash_number'] ?? '',
                'bkash_instructions' => $appSettings['bkash_instructions'] ?? '',
                'nagad_number' => $appSettings['nagad_number'] ?? '',
                'nagad_instructions' => $appSettings['nagad_instructions'] ?? '',
            ],
        ]);
    }

    /**
     * Customer submits payment proof and transaction reference for a milestone.
     */
    public function submitMilestonePayment(Request $request, string|int $ref, int $milestoneId): RedirectResponse
    {
        $user = Auth::user();
        $order = CustomOrder::findByRefOrFail($ref, $user->id);
        $milestone = CustomOrderMilestone::where('custom_order_id', $order->id)->findOrFail($milestoneId);

        if ($order->status === 'completed') {
            return back()->with('error', 'This project is Completed & Delivered. Milestone payments are finalized and locked.');
        }

        $validated = $request->validate([
            'client_payment_method' => 'required|string|max:50',
            'client_trx_id' => 'required|string|max:100',
            'client_sender_info' => 'nullable|string|max:255',
            'client_payment_proof' => 'nullable|file|max:10240|mimes:pdf,png,jpg,jpeg,webp',
            'client_payment_notes' => 'nullable|string|max:1000',
        ]);

        $proofPath = $milestone->client_payment_proof;
        if ($request->hasFile('client_payment_proof')) {
            $uploadedPath = $request->file('client_payment_proof')->store('custom_orders/payments', 'public');
            $proofPath = '/storage/' . $uploadedPath;
        }

        $milestone->update([
            'payment_status' => 'paid-and-bank-processing',
            'client_payment_method' => $validated['client_payment_method'],
            'client_trx_id' => strtoupper(trim($validated['client_trx_id'])),
            'client_sender_info' => $validated['client_sender_info'] ?? null,
            'client_payment_proof' => $proofPath,
            'client_payment_notes' => $validated['client_payment_notes'] ?? null,
            'client_paid_at' => Carbon::now(),
        ]);

        if ($order->status === 'accepted') {
            $order->update(['status' => 'in_progress']);
        }

        // Notify Admin
        try {
            $admins = Admin::all();
            $appSettings = AppSetting::getAllGrouped();
            $adminEmail = $appSettings['contact_email'] ?? config('mail.from.address');

            if ($admins->isNotEmpty()) {
                foreach ($admins as $admin) {
                    if (!empty($admin->email)) {
                        Mail::to($admin->email)->send(new MilestonePaymentSubmittedMail($order, $milestone));
                    }
                }
            } elseif (!empty($adminEmail)) {
                Mail::to($adminEmail)->send(new MilestonePaymentSubmittedMail($order, $milestone));
            }
        } catch (\Throwable $e) {
            Log::error('Failed sending MilestonePaymentSubmittedMail: ' . $e->getMessage());
        }

        return redirect($order->customer_show_url)
            ->with('success', "Payment submitted for {$milestone->title}! Our financial department is verifying the transaction reference ({$milestone->client_trx_id}).");
    }

    /**
     * Customer marks the order as completed (allowed when payment is fully paid or in active delivery).
     */
    public function complete(Request $request, string|int $ref): RedirectResponse
    {
        $user = Auth::user();
        $order = CustomOrder::with('milestones')->where('user_id', $user->id)
            ->where(function ($q) use ($ref) {
                $q->where('order_number', $ref);
                if (is_numeric($ref)) {
                    $q->orWhere('id', (int) $ref);
                }
            })->firstOrFail();

        if ($order->status === 'completed') {
            return back()->with('info', 'Project is already marked as completed.');
        }

        if (in_array($order->status, ['cancelled', 'denied'])) {
            return back()->with('error', 'Cannot mark a cancelled or denied project as completed.');
        }

        if (!$order->is_fully_paid || $order->remaining_balance > 0) {
            return back()->with('error', "Cannot complete project: All milestone payments must be 100% collected and settled first (Remaining Balance: {$order->currency} " . number_format($order->remaining_balance, 2) . ").");
        }

        $order->update([
            'status' => 'completed',
            'completed_at' => $order->completed_at ?: Carbon::now(),
        ]);

        return redirect($order->customer_show_url)
            ->with('success', "Congratulations! Order #{$order->order_number} has been marked as Completed & Delivered. You can now leave a client review.");
    }

    /**
     * Customer submits or updates a review for their custom order.
     */
    public function storeReview(Request $request, string|int $ref): RedirectResponse
    {
        $user = Auth::user();
        $order = CustomOrder::findByRefOrFail($ref, $user->id);

        if ($order->status !== 'completed') {
            return back()->with('error', 'Reviews can only be submitted once the project is marked as Completed & Delivered.');
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review_title' => 'required|string|max:255',
            'review_text' => 'required|string|max:2000',
            'author_role' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
        ]);

        $review = Review::updateOrCreate(
            ['custom_order_id' => $order->id],
            [
                'user_id' => $user->id,
                'author_name' => $user->name,
                'author_avatar' => $user->avatar,
                'author_role' => $validated['author_role'] ?? 'Verified Client',
                'company' => $validated['company'] ?? ($order->title . ' Client'),
                'rating' => $validated['rating'],
                'review_title' => $validated['review_title'],
                'review_text' => $validated['review_text'],
                'source' => 'direct',
                'review_date' => Carbon::now()->toDateString(),
                'verified_purchase' => true,
                'is_featured' => true, // Visible on frontend showcase
            ]
        );

        return redirect($order->customer_show_url)
            ->with('success', 'Thank you for your feedback! Your review has been recorded.');
    }

    /**
     * Customer requests a revised budget / currency update (Requires Admin verification before applying).
     */
    public function updateBudget(Request $request, string|int $ref): RedirectResponse
    {
        $user = Auth::user();
        $order = CustomOrder::findByRefOrFail($ref, $user->id);

        if ($order->status === 'completed') {
            return back()->with('error', 'This project is Completed & Delivered. Budget proposals cannot be submitted.');
        }

        $validated = $request->validate([
            'estimated_budget' => 'required|numeric|min:1',
            'currency' => 'nullable|string|in:BDT,USD,EUR',
            'notes' => 'nullable|string|max:500',
        ]);

        $order->update([
            'proposed_budget' => $validated['estimated_budget'],
            'proposed_currency' => $validated['currency'] ?? $order->currency,
            'proposed_budget_notes' => $validated['notes'] ?? null,
            'proposed_budget_at' => Carbon::now(),
            'budget_update_status' => 'pending',
        ]);

        return redirect($order->customer_show_url)
            ->with('success', "Your budget revision request of " . ($validated['currency'] ?? $order->currency) . " " . number_format($validated['estimated_budget'], 2) . " has been submitted for Admin verification. It will be updated once verified by our team.");
    }

    /**
     * Customer cancels a pending request.
     */
    public function cancel(Request $request, string|int $ref): RedirectResponse
    {
        $user = Auth::user();
        $order = CustomOrder::findByRefOrFail($ref, $user->id);

        if ($order->status !== 'pending') {
            return back()->with('error', 'Only orders under pending review can be cancelled.');
        }

        $order->update(['status' => 'cancelled']);

        return redirect()->route('customer.custom-orders.index')
            ->with('info', "Custom order #{$order->order_number} has been cancelled.");
    }

    /**
     * Display printable PDF Project Deal & Payment Settlement Report.
     */
    public function showReport(string|int $ref, ?string $title = null): Response
    {
        $user = Auth::user();
        $order = CustomOrder::with([
            'user',
            'review',
            'milestones' => function ($q) {
                $q->orderBy('order', 'asc')->orderBy('id', 'asc');
            }
        ])
        ->where('user_id', $user->id)
        ->where(function ($q) use ($ref) {
            $q->where('order_number', $ref);
            if (is_numeric($ref)) {
                $q->orWhere('id', (int) $ref);
            }
        })
        ->firstOrFail();

        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('customer/custom-orders/report', [
            'order' => $order,
            'brandSettings' => [
                'brand_name' => $appSettings['brand_name'] ?? 'CodeVenture Tech',
                'logo' => $appSettings['logo'] ?? null,
                'contact_email' => $appSettings['contact_email'] ?? 'hello@codeventure.tech',
                'contact_phone' => $appSettings['contact_phone'] ?? '+880 1700-000000',
                'address_line1' => $appSettings['address_line1'] ?? 'Dhaka, Bangladesh',
                'address_line2' => $appSettings['address_line2'] ?? 'Engineering Division',
                'currency_symbol' => $appSettings['currency_symbol'] ?? '৳',
            ],
        ]);
    }
}
