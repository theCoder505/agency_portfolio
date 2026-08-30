<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\CustomOrderAcceptedMail;
use App\Mail\CustomOrderDeniedMail;
use App\Models\AppSetting;
use App\Models\CustomOrder;
use App\Models\CustomOrderMilestone;
use App\Models\Review;
use App\Models\User;
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
     * Display a listing of all custom orders.
     */
    public function index(Request $request): Response
    {
        $allOrders = CustomOrder::with(['user', 'milestones', 'review'])
            ->orderBy('created_at', 'desc')
            ->get();

        $collectedByCurrency = [
            'USD' => 0.0,
            'EUR' => 0.0,
            'BDT' => 0.0,
        ];

        foreach ($allOrders as $order) {
            $curr = strtoupper($order->currency ?: 'BDT');
            if (!isset($collectedByCurrency[$curr])) {
                $collectedByCurrency[$curr] = 0.0;
            }
            $collectedAmount = $order->milestones->where('payment_status', 'collected')->sum('amount');
            $collectedByCurrency[$curr] += (float) $collectedAmount;
        }

        $totalRevenueCollected = $allOrders->sum(function ($order) {
            return $order->milestones->where('payment_status', 'collected')->sum('amount');
        });

        $totalRefunded = $allOrders->sum(function ($order) {
            return $order->total_refunded_amount;
        });

        $overdueOrdersCount = $allOrders->filter(function ($order) {
            return $order->is_late && !in_array($order->status, ['completed', 'cancelled', 'denied']);
        })->count();

        $pendingBudgetRequestsCount = $allOrders->where('budget_update_status', 'pending')->count();

        $kpis = [
            'total' => $allOrders->count(),
            'pending' => $allOrders->where('status', 'pending')->count(),
            'in_progress' => $allOrders->whereIn('status', ['accepted', 'in_progress'])->count(),
            'completed' => $allOrders->where('status', 'completed')->count(),
            'denied' => $allOrders->where('status', 'denied')->count(),
            'overdue' => $overdueOrdersCount,
            'pending_budgets' => $pendingBudgetRequestsCount,
            'total_collected' => $totalRevenueCollected,
            'total_refunded' => $totalRefunded,
            'collected_by_currency' => $collectedByCurrency,
        ];

        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('admin/custom-orders/index', [
            'orders' => $allOrders,
            'kpis' => $kpis,
            'currencySymbol' => $appSettings['currency_symbol'] ?? '৳',
        ]);
    }

    /**
     * Show form to manually create a custom order for a customer.
     */
    public function create(): Response
    {
        $users = User::where('status', 'active')->orderBy('name')->get(['id', 'name', 'email', 'phone', 'whatsapp_number']);
        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('admin/custom-orders/form', [
            'order' => null,
            'users' => $users,
            'isEdit' => false,
            'currencySymbol' => $appSettings['currency_symbol'] ?? '৳',
        ]);
    }

    /**
     * Store a manually created custom order.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'estimated_budget' => 'nullable|numeric|min:0',
            'agreed_price' => 'nullable|numeric|min:0',
            'currency' => 'required|string|in:BDT,USD,EUR',
            'client_whatsapp' => 'nullable|string|max:40',
            'client_email' => 'nullable|email|max:255',
            'target_deadline' => 'nullable|date',
            'requirements' => 'required|string',
            'reference_links' => 'nullable|string',
            'status' => 'required|in:pending,accepted,in_progress,completed,denied,cancelled',
            'admin_notes' => 'nullable|string',
            'github_repo_url' => 'nullable|url|max:255',
            'drive_link' => 'nullable|url|max:500',
            'live_demo_url' => 'nullable|url|max:255',
        ]);

        $user = User::find($validated['user_id']);
        if (empty($validated['client_whatsapp']) && $user) {
            $validated['client_whatsapp'] = $user->whatsapp_number ?: $user->phone;
        }
        if (empty($validated['client_email']) && $user) {
            $validated['client_email'] = $user->email;
        }

        if ($validated['status'] === 'accepted' || $validated['status'] === 'in_progress') {
            $validated['accepted_at'] = Carbon::now();
        } elseif ($validated['status'] === 'completed') {
            $validated['completed_at'] = Carbon::now();
        }

        $order = CustomOrder::create($validated);

        return redirect($order->admin_show_url)
            ->with('success', 'Custom order created successfully! You can now define payment milestones and deliverable links.');
    }

    /**
     * Display the specified custom order with full details & milestone management studio.
     */
    public function show(string|int $ref, ?string $title = null): Response
    {
        $order = CustomOrder::with([
            'user',
            'review',
            'milestones' => function ($q) {
                $q->orderBy('order', 'asc')->orderBy('id', 'asc');
            },
        ])->where(function ($q) use ($ref) {
            $q->where('order_number', $ref);
            if (is_numeric($ref)) {
                $q->orWhere('id', (int) $ref);
            }
        })->firstOrFail();

        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('admin/custom-orders/show', [
            'order' => $order,
            'currencySymbol' => $appSettings['currency_symbol'] ?? '৳',
            'appSettings' => $appSettings,
        ]);
    }

    /**
     * Update project metadata and overall deliverable links.
     */
    public function update(Request $request, string|int $ref): RedirectResponse
    {
        $order = CustomOrder::findByRefOrFail($ref);

        if ($order->status === 'completed') {
            return back()->with('error', 'This project is Completed & Delivered. The contract, deliverables, and specifications are finalized and locked.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'estimated_budget' => 'nullable|numeric|min:0',
            'agreed_price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|in:BDT,USD,EUR',
            'client_whatsapp' => 'nullable|string|max:40',
            'client_email' => 'nullable|email|max:255',
            'target_deadline' => 'nullable|date',
            'status' => 'required|in:pending,accepted,in_progress,completed,denied,cancelled',
            'admin_notes' => 'nullable|string',
            'requirements' => 'required|string',
            'reference_links' => 'nullable|string',
            'github_repo_url' => 'nullable|url|max:255',
            'drive_link' => 'nullable|url|max:500',
            'live_demo_url' => 'nullable|url|max:255',
        ]);

        if ($validated['status'] === 'completed' && (!$order->is_fully_paid || $order->remaining_balance > 0)) {
            return back()->withErrors([
                'status' => "Cannot mark order as completed: The project must be 100% settled first (Remaining Balance Due: {$order->currency} " . number_format($order->remaining_balance, 2) . ")."
            ])->with('error', "Cannot mark order as completed: The project must be 100% settled first (Remaining Balance Due: {$order->currency} " . number_format($order->remaining_balance, 2) . ").");
        }

        if ($validated['status'] === 'completed' && !$order->completed_at) {
            $validated['completed_at'] = Carbon::now();
        }

        $order->update($validated);

        return redirect($order->admin_show_url)
            ->with('success', 'Custom project details updated successfully!');
    }

    /**
     * Admin updates repository and deliverable links.
     */
    public function updateDeliverables(Request $request, string|int $ref): RedirectResponse
    {
        $order = CustomOrder::findByRefOrFail($ref);

        if ($order->status === 'completed') {
            return back()->with('error', 'This project is Completed & Delivered. Deliverable links are finalized and locked.');
        }

        $validated = $request->validate([
            'github_repo_url' => 'nullable|url|max:255',
            'drive_link' => 'nullable|url|max:500',
            'live_demo_url' => 'nullable|url|max:255',
        ]);

        $order->update($validated);

        return redirect($order->admin_show_url)
            ->with('success', 'Source code & deliverable links updated successfully!');
    }

    /**
     * Mark order as completed (requires 100% settlement).
     */
    public function complete(Request $request, string|int $ref): RedirectResponse
    {
        $order = CustomOrder::with('milestones')->where(function ($q) use ($ref) {
            $q->where('order_number', $ref);
            if (is_numeric($ref)) {
                $q->orWhere('id', (int) $ref);
            }
        })->firstOrFail();

        if (!$order->is_fully_paid || $order->remaining_balance > 0) {
            return back()->with('error', "Cannot mark order as completed: The project must be 100% settled first (Remaining Balance Due: {$order->currency} " . number_format($order->remaining_balance, 2) . ").");
        }

        $order->update([
            'status' => 'completed',
            'completed_at' => $order->completed_at ?: Carbon::now(),
        ]);

        return redirect($order->admin_show_url)
            ->with('success', "Order #{$order->order_number} marked as Completed & Delivered.");
    }

    /**
     * Admin approves client's proposed budget revision.
     */
    public function approveBudgetRequest(Request $request, string|int $ref): RedirectResponse
    {
        $order = CustomOrder::findByRefOrFail($ref);

        if ($order->status === 'completed') {
            return back()->with('error', 'Completed projects are locked and cannot process budget revisions.');
        }

        if (!$order->proposed_budget) {
            return back()->with('error', 'No pending budget revision found on this project.');
        }

        $oldBudget = $order->estimated_budget;
        $newBudget = $order->proposed_budget;
        $newCurrency = $order->proposed_currency ?: $order->currency;

        $note = "\n\n[Admin Verified Budget Update " . Carbon::now()->format('M d, Y H:i') . "]: Approved client request to update budget to {$newCurrency} " . number_format($newBudget, 2);

        $order->update([
            'estimated_budget' => $newBudget,
            'agreed_price' => $order->agreed_price ?: $newBudget,
            'currency' => $newCurrency,
            'budget_update_status' => 'approved',
            'requirements' => $order->requirements . $note,
        ]);

        return redirect($order->admin_show_url)
            ->with('success', "Client proposed budget of {$newCurrency} " . number_format($newBudget, 2) . " has been verified and approved!");
    }

    /**
     * Admin declines client's proposed budget revision.
     */
    public function declineBudgetRequest(Request $request, string|int $ref): RedirectResponse
    {
        $order = CustomOrder::findByRefOrFail($ref);

        if ($order->status === 'completed') {
            return back()->with('error', 'Completed projects are locked and cannot process budget revisions.');
        }

        $request->validate([
            'decline_reason' => 'nullable|string|max:500',
        ]);

        $reason = $request->decline_reason ?: 'Proposed budget does not meet technical scope requirements.';

        $note = "\n\n[Admin Declined Budget Update " . Carbon::now()->format('M d, Y H:i') . "]: Client proposal of {$order->proposed_currency} " . number_format($order->proposed_budget, 2) . " declined. Reason: {$reason}";

        $order->update([
            'budget_update_status' => 'rejected',
            'requirements' => $order->requirements . $note,
        ]);

        return redirect($order->admin_show_url)
            ->with('warning', 'Client budget request was declined.');
    }

    /**
     * Issue or record a payment return (refund) for a milestone.
     */
    public function refundMilestone(Request $request, string|int $ref, int $milestoneId): RedirectResponse
    {
        $order = CustomOrder::findByRefOrFail($ref);
        $milestone = CustomOrderMilestone::where('custom_order_id', $order->id)->findOrFail($milestoneId);

        if ($order->status === 'completed') {
            return back()->with('error', 'This project is Completed & Delivered. Payments cannot be refunded after final completion.');
        }

        $validated = $request->validate([
            'refund_amount' => 'required|numeric|min:0.01',
            'refund_trx_id' => 'required|string|max:100',
            'refund_reason' => 'required|string|max:1000',
            'refunded_at' => 'nullable|date',
        ]);

        $updateData = [
            'payment_status' => 'refunded',
            'refund_amount' => $validated['refund_amount'],
            'refund_trx_id' => strtoupper(trim($validated['refund_trx_id'])),
            'refund_reason' => $validated['refund_reason'],
            'refunded_at' => !empty($validated['refunded_at']) ? Carbon::parse($validated['refunded_at']) : Carbon::now(),
        ];

        try {
            $milestone->update($updateData);
        } catch (\Illuminate\Database\QueryException $e) {
            if (str_contains($e->getMessage(), '1265') || str_contains($e->getMessage(), 'Data truncated')) {
                \Illuminate\Support\Facades\DB::statement("ALTER TABLE `custom_order_milestones` MODIFY COLUMN `payment_status` VARCHAR(50) NOT NULL DEFAULT 'waiting-client-to-pay'");
                $milestone->update($updateData);
            } else {
                throw $e;
            }
        }

        return redirect($order->admin_show_url)
            ->with('success', "Milestone '{$milestone->title}' has been marked as Payment Returned / Refunded ({$order->currency} {$validated['refund_amount']}).");
    }

    /**
     * Admin toggle review visibility on the public frontend.
     */
    public function toggleReviewFeatured(Request $request, string|int $ref, int $reviewId): RedirectResponse
    {
        $order = CustomOrder::findByRefOrFail($ref);
        $review = Review::where('custom_order_id', $order->id)->findOrFail($reviewId);

        $review->update([
            'is_featured' => !$review->is_featured,
        ]);

        $state = $review->is_featured ? 'Enabled (Visible to Visitors)' : 'Disabled (Hidden from Visitors)';

        return redirect($order->admin_show_url)
            ->with('success', "Review visibility updated: {$state}.");
    }

    /**
     * Admin updates agreed price, estimated budget, and currency.
     */
    public function updateBudget(Request $request, string|int $ref): RedirectResponse
    {
        $order = CustomOrder::findByRefOrFail($ref);

        if ($order->status === 'completed') {
            return back()->with('error', 'This project is Completed & Delivered. Pricing terms are finalized and locked.');
        }

        $validated = $request->validate([
            'agreed_price' => 'nullable|numeric|min:0',
            'estimated_budget' => 'nullable|numeric|min:0',
            'currency' => 'required|string|in:BDT,USD,EUR',
            'admin_notes' => 'nullable|string',
        ]);

        $order->update($validated);

        return redirect($order->admin_show_url)
            ->with('success', 'Project budget & currency updated successfully!');
    }

    /**
     * Accept a pending custom order proposal and notify client.
     */
    public function accept(Request $request, string|int $ref): RedirectResponse
    {
        $order = CustomOrder::with('user')->where(function ($q) use ($ref) {
            $q->where('order_number', $ref);
            if (is_numeric($ref)) {
                $q->orWhere('id', (int) $ref);
            }
        })->firstOrFail();

        $validated = $request->validate([
            'agreed_price' => 'required|numeric|min:1',
            'currency' => 'nullable|string|in:BDT,USD,EUR',
            'target_deadline' => 'nullable|date',
            'admin_notes' => 'nullable|string',
            'initial_milestones' => 'nullable|array',
            'initial_milestones.*.title' => 'required|string|max:255',
            'initial_milestones.*.amount' => 'required|numeric|min:0',
            'initial_milestones.*.due_date' => 'nullable|date',
            'initial_milestones.*.payment_method' => 'nullable|string',
            'initial_milestones.*.payment_details' => 'nullable|string',
        ]);

        $updateData = [
            'status' => 'accepted',
            'agreed_price' => $validated['agreed_price'],
            'target_deadline' => $validated['target_deadline'] ?? $order->target_deadline,
            'admin_notes' => $validated['admin_notes'] ?? $order->admin_notes,
            'accepted_at' => Carbon::now(),
            'rejection_reason' => null,
        ];

        if (!empty($validated['currency'])) {
            $updateData['currency'] = $validated['currency'];
        }

        if (!empty($validated['initial_milestones'])) {
            $milestonesTotal = array_sum(array_column($validated['initial_milestones'], 'amount'));
            if ($milestonesTotal > $validated['agreed_price']) {
                return back()->withErrors([
                    'initial_milestones' => "Total milestone amounts cannot exceed the agreed price ({$order->currency} {$validated['agreed_price']})."
                ])->with('error', "Total milestone amounts cannot exceed the agreed price ({$order->currency} {$validated['agreed_price']})!");
            }
        }

        $order->update($updateData);

        if (!empty($validated['initial_milestones'])) {
            foreach ($validated['initial_milestones'] as $index => $m) {
                CustomOrderMilestone::create([
                    'custom_order_id' => $order->id,
                    'order' => $index + 1,
                    'title' => $m['title'],
                    'amount' => $m['amount'],
                    'due_date' => $m['due_date'] ?? null,
                    'payment_status' => 'waiting-client-to-pay',
                    'payment_method' => $m['payment_method'] ?? 'PayPal / Payoneer / Bank',
                    'payment_details' => $m['payment_details'] ?? null,
                ]);
            }
        }

        try {
            if ($order->user && !empty($order->user->email)) {
                Mail::to($order->user->email)->send(new CustomOrderAcceptedMail($order));
            }
        } catch (\Throwable $e) {
            Log::error('Failed sending CustomOrderAcceptedMail: ' . $e->getMessage());
        }

        return redirect($order->admin_show_url)
            ->with('success', "Order #{$order->order_number} has been Accepted! Acceptance notification email sent to client.");
    }

    /**
     * Deny a custom order proposal with feedback reason and notify client.
     */
    public function deny(Request $request, string|int $ref): RedirectResponse
    {
        $order = CustomOrder::with('user')->where(function ($q) use ($ref) {
            $q->where('order_number', $ref);
            if (is_numeric($ref)) {
                $q->orWhere('id', (int) $ref);
            }
        })->firstOrFail();

        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $reason = $request->rejection_reason;

        $order->update([
            'status' => 'denied',
            'rejection_reason' => $reason,
        ]);

        try {
            if ($order->user && !empty($order->user->email)) {
                Mail::to($order->user->email)->send(new CustomOrderDeniedMail($order, $reason));
            }
        } catch (\Throwable $e) {
            Log::error('Failed sending CustomOrderDeniedMail: ' . $e->getMessage());
        }

        return redirect($order->admin_show_url)
            ->with('warning', "Order #{$order->order_number} marked as Denied. Reason sent to client.");
    }

    /**
     * Delete a custom order.
     */
    public function destroy(string|int $ref): RedirectResponse
    {
        $order = CustomOrder::findByRefOrFail($ref);
        $orderNumber = $order->order_number;
        $order->delete();

        return redirect()->route('admin.custom-orders.index')
            ->with('success', "Custom order #{$orderNumber} deleted successfully.");
    }

    /**
     * Display printable PDF Project Deal & Payment Settlement Report.
     */
    public function showReport(string|int $ref, ?string $title = null): Response
    {
        $order = CustomOrder::with([
            'user',
            'review',
            'milestones' => function ($q) {
                $q->orderBy('order', 'asc')->orderBy('id', 'asc');
            }
        ])->where(function ($q) use ($ref) {
            $q->where('order_number', $ref);
            if (is_numeric($ref)) {
                $q->orWhere('id', (int) $ref);
            }
        })->firstOrFail();

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
