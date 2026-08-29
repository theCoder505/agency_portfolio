<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\CustomOrderAcceptedMail;
use App\Mail\CustomOrderDeniedMail;
use App\Models\AppSetting;
use App\Models\CustomOrder;
use App\Models\CustomOrderMilestone;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        $search = $request->query('search', '');
        $status = $request->query('status', 'all');

        $query = CustomOrder::with(['user', 'milestones']);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        if ($status !== 'all' && !empty($status)) {
            $query->where('status', $status);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        $allOrders = CustomOrder::with('milestones')->get();

        $totalRevenueCollected = $allOrders->sum(function ($order) {
            return $order->milestones->where('payment_status', 'collected')->sum('amount');
        });

        $kpis = [
            'total' => $allOrders->count(),
            'pending' => $allOrders->where('status', 'pending')->count(),
            'in_progress' => $allOrders->whereIn('status', ['accepted', 'in_progress'])->count(),
            'completed' => $allOrders->where('status', 'completed')->count(),
            'denied' => $allOrders->where('status', 'denied')->count(),
            'total_collected' => $totalRevenueCollected,
        ];

        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('admin/custom-orders/index', [
            'orders' => $orders,
            'kpis' => $kpis,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'currencySymbol' => $appSettings['currency_symbol'] ?? '$',
        ]);
    }

    /**
     * Show form to manually create a custom order for a customer.
     */
    public function create(): Response
    {
        $users = User::where('status', 'active')->orderBy('name')->get(['id', 'name', 'email', 'phone']);
        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('admin/custom-orders/form', [
            'order' => null,
            'users' => $users,
            'isEdit' => false,
            'currencySymbol' => $appSettings['currency_symbol'] ?? '$',
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
            'currency' => 'required|string|max:10',
            'target_deadline' => 'nullable|date',
            'requirements' => 'required|string',
            'reference_links' => 'nullable|string',
            'status' => 'required|in:pending,accepted,in_progress,completed,denied,cancelled',
            'admin_notes' => 'nullable|string',
            'github_repo_url' => 'nullable|url|max:255',
            'drive_link' => 'nullable|url|max:500',
            'live_demo_url' => 'nullable|url|max:255',
        ]);

        if ($validated['status'] === 'accepted' || $validated['status'] === 'in_progress') {
            $validated['accepted_at'] = Carbon::now();
        } elseif ($validated['status'] === 'completed') {
            $validated['completed_at'] = Carbon::now();
        }

        $order = CustomOrder::create($validated);

        return redirect()->route('admin.custom-orders.show', $order->id)
            ->with('success', 'Custom order created successfully! You can now define payment milestones and deliverable links.');
    }

    /**
     * Display the specified custom order with full details & milestone management studio.
     */
    public function show(int $id): Response
    {
        $order = CustomOrder::with([
            'user',
            'milestones' => function ($q) {
                $q->orderBy('order', 'asc')->orderBy('id', 'asc');
            },
        ])->findOrFail($id);

        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('admin/custom-orders/show', [
            'order' => $order,
            'currencySymbol' => $appSettings['currency_symbol'] ?? '$',
            'appSettings' => $appSettings,
        ]);
    }

    /**
     * Update project metadata and overall deliverable links.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $order = CustomOrder::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'estimated_budget' => 'nullable|numeric|min:0',
            'agreed_price' => 'nullable|numeric|min:0',
            'target_deadline' => 'nullable|date',
            'status' => 'required|in:pending,accepted,in_progress,completed,denied,cancelled',
            'admin_notes' => 'nullable|string',
            'requirements' => 'required|string',
            'reference_links' => 'nullable|string',
            'github_repo_url' => 'nullable|url|max:255',
            'drive_link' => 'nullable|url|max:500',
            'live_demo_url' => 'nullable|url|max:255',
        ]);

        if ($validated['status'] === 'completed' && !$order->completed_at) {
            $validated['completed_at'] = Carbon::now();
        }

        $order->update($validated);

        return redirect()->route('admin.custom-orders.show', $order->id)
            ->with('success', 'Custom project details updated successfully!');
    }

    /**
     * Accept a pending custom order proposal and notify client.
     */
    public function accept(Request $request, int $id): RedirectResponse
    {
        $order = CustomOrder::with('user')->findOrFail($id);

        $validated = $request->validate([
            'agreed_price' => 'required|numeric|min:1',
            'target_deadline' => 'nullable|date',
            'admin_notes' => 'nullable|string',
            // Optional quick milestone creation
            'initial_milestones' => 'nullable|array',
            'initial_milestones.*.title' => 'required|string|max:255',
            'initial_milestones.*.amount' => 'required|numeric|min:0',
            'initial_milestones.*.due_date' => 'nullable|date',
            'initial_milestones.*.payment_method' => 'nullable|string',
            'initial_milestones.*.payment_details' => 'nullable|string',
        ]);

        $order->update([
            'status' => 'accepted',
            'agreed_price' => $validated['agreed_price'],
            'target_deadline' => $validated['target_deadline'] ?? $order->target_deadline,
            'admin_notes' => $validated['admin_notes'] ?? $order->admin_notes,
            'accepted_at' => Carbon::now(),
            'rejection_reason' => null,
        ]);

        // Create initial milestones if provided
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

        // Send Acceptance email to customer
        try {
            if ($order->user && !empty($order->user->email)) {
                Mail::to($order->user->email)->send(new CustomOrderAcceptedMail($order));
            }
        } catch (\Throwable $e) {
            \Log::error('Failed sending CustomOrderAcceptedMail: ' . $e->getMessage());
        }

        return redirect()->route('admin.custom-orders.show', $order->id)
            ->with('success', "Order #{$order->order_number} has been Accepted! Acceptance notification email sent to client.");
    }

    /**
     * Deny a custom order proposal with feedback reason and notify client.
     */
    public function deny(Request $request, int $id): RedirectResponse
    {
        $order = CustomOrder::with('user')->findOrFail($id);

        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $reason = $request->rejection_reason;

        $order->update([
            'status' => 'denied',
            'rejection_reason' => $reason,
        ]);

        // Send denial email
        try {
            if ($order->user && !empty($order->user->email)) {
                Mail::to($order->user->email)->send(new CustomOrderDeniedMail($order, $reason));
            }
        } catch (\Throwable $e) {
            \Log::error('Failed sending CustomOrderDeniedMail: ' . $e->getMessage());
        }

        return redirect()->route('admin.custom-orders.show', $order->id)
            ->with('warning', "Order #{$order->order_number} marked as Denied. Reason sent to client.");
    }

    /**
     * Delete a custom order.
     */
    public function destroy(int $id): RedirectResponse
    {
        $order = CustomOrder::findOrFail($id);
        $orderNumber = $order->order_number;
        $order->delete();

        return redirect()->route('admin.custom-orders.index')
            ->with('success', "Custom order #{$orderNumber} deleted successfully.");
    }
}
