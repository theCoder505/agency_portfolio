<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Mail\MilestonePaymentSubmittedMail;
use App\Models\Admin;
use App\Models\AppSetting;
use App\Models\CustomOrder;
use App\Models\CustomOrderMilestone;
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
     * Display all custom orders belonging to the authenticated customer.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $status = $request->query('status', 'all');

        $query = CustomOrder::with(['milestones'])
            ->where('user_id', $user->id);

        if ($status !== 'all' && !empty($status)) {
            $query->where('status', $status);
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
            'currencySymbol' => $appSettings['currency_symbol'] ?? '$',
        ]);
    }

    /**
     * Display detailed project overview & milestone payments for a custom order.
     */
    public function show(int $id): Response
    {
        $user = Auth::user();
        $order = CustomOrder::with(['milestones' => function ($q) {
            $q->orderBy('order', 'asc')->orderBy('id', 'asc');
        }])
        ->where('user_id', $user->id)
        ->findOrFail($id);

        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('customer/custom-orders/show', [
            'order' => $order,
            'appSettings' => $appSettings,
            'currencySymbol' => $appSettings['currency_symbol'] ?? '$',
            'defaultPaymentSettings' => [
                'currency_symbol' => $appSettings['currency_symbol'] ?? '$',
                'currency_code' => $appSettings['currency_code'] ?? 'USD',
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
    public function submitMilestonePayment(Request $request, int $orderId, int $milestoneId): RedirectResponse
    {
        $user = Auth::user();
        $order = CustomOrder::where('user_id', $user->id)->findOrFail($orderId);
        $milestone = CustomOrderMilestone::where('custom_order_id', $order->id)->findOrFail($milestoneId);

        $validated = $request->validate([
            'client_payment_method' => 'required|string|max:50', // PayPal, Payoneer, Bank, bKash, Nagad, etc.
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

        // If order was accepted, mark in_progress
        if ($order->status === 'accepted') {
            $order->update(['status' => 'in_progress']);
        }

        // Notify Admin of submitted milestone payment
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
            \Log::error('Failed sending MilestonePaymentSubmittedMail: ' . $e->getMessage());
        }

        return redirect()->route('customer.custom-orders.show', $order->id)
            ->with('success', "Payment submitted for {$milestone->title}! Our financial department is verifying the transaction reference ({$milestone->client_trx_id}).");
    }

    /**
     * Customer cancels a pending request.
     */
    public function cancel(Request $request, int $id): RedirectResponse
    {
        $user = Auth::user();
        $order = CustomOrder::where('user_id', $user->id)->findOrFail($id);

        if ($order->status !== 'pending') {
            return back()->with('error', 'Only orders under pending review can be cancelled.');
        }

        $order->update(['status' => 'cancelled']);

        return redirect()->route('customer.custom-orders.index')
            ->with('info', "Custom order #{$order->order_number} has been cancelled.");
    }
}
