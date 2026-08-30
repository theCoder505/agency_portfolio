<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\MilestoneCollectedMail;
use App\Models\CustomOrder;
use App\Models\CustomOrderMilestone;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class CustomOrderMilestoneController extends Controller
{
    /**
     * Store a new milestone for a custom order.
     */
    public function store(Request $request, int $orderId): RedirectResponse
    {
        $order = CustomOrder::findOrFail($orderId);

        if ($order->status === 'completed') {
            return back()->with('error', 'Cannot add new milestones to a completed project.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0.01',
            'due_date' => 'nullable|date',
            'order' => 'nullable|integer|min:1',
            'payment_status' => 'required|in:waiting-client-to-pay,paid-and-bank-processing,collected,refunded',
            'payment_method' => 'nullable|string|max:100',
            'payment_details' => 'nullable|string',
            'payment_instructions' => 'nullable|string',
            'github_repo_url' => 'nullable|url|max:255',
            'drive_link' => 'nullable|url|max:500',
            'live_demo_url' => 'nullable|url|max:255',
            'deliverable_notes' => 'nullable|string',
            'is_deliverable_unlocked' => 'nullable|boolean',
        ]);

        $agreedPrice = (float) ($order->agreed_price ?: $order->estimated_budget ?: 0);
        $activeMilestonesTotal = (float) $order->milestones()->where('payment_status', '!=', 'refunded')->sum('amount');
        $unallocatedAmount = max(0, $agreedPrice - $activeMilestonesTotal);

        if ($unallocatedAmount <= 0 && $agreedPrice > 0) {
            return back()->withErrors([
                'amount' => "No more milestones can be created for this order. The total active milestone amount ({$order->currency} " . number_format($activeMilestonesTotal, 2) . ") has reached the agreed contract price ({$order->currency} " . number_format($agreedPrice, 2) . ")."
            ])->with('error', "No more milestones can be created. Active milestones already total the agreed contract price ({$order->currency} " . number_format($agreedPrice, 2) . ")!");
        }

        if ($validated['amount'] > $unallocatedAmount) {
            return back()->withErrors([
                'amount' => "The milestone amount cannot exceed the remaining unallocated contract allowance ({$order->currency} " . number_format($unallocatedAmount, 2) . ")."
            ])->with('error', "Milestone amount cannot exceed the remaining contract allowance ({$order->currency} " . number_format($unallocatedAmount, 2) . ")!");
        }

        if (empty($validated['order'])) {
            $validated['order'] = ($order->milestones()->max('order') ?? 0) + 1;
        }

        if ($validated['payment_status'] === 'collected') {
            $validated['collected_at'] = Carbon::now();
        } elseif ($validated['payment_status'] === 'refunded') {
            $validated['refunded_at'] = Carbon::now();
            $validated['refund_amount'] = $validated['amount'];
        }

        $validated['custom_order_id'] = $order->id;
        $validated['is_deliverable_unlocked'] = $request->boolean('is_deliverable_unlocked', true);

        $milestone = CustomOrderMilestone::create($validated);

        if ($order->status === 'accepted') {
            $order->update(['status' => 'in_progress']);
        }

        return redirect()->route('admin.custom-orders.show', $order->id)
            ->with('success', "Milestone '{$milestone->title}' added successfully!");
    }

    /**
     * Update an existing milestone (settling amount, payment details, deliverables, payment status).
     */
    public function update(Request $request, int $orderId, int $milestoneId): RedirectResponse
    {
        $order = CustomOrder::with('user')->findOrFail($orderId);
        $milestone = CustomOrderMilestone::where('custom_order_id', $order->id)->findOrFail($milestoneId);

        if ($order->status === 'completed') {
            return back()->with('error', 'Milestones cannot be modified on a completed project.');
        }

        if ($milestone->payment_status !== 'waiting-client-to-pay') {
            $statusLabel = $milestone->status_badge['label'] ?? $milestone->payment_status;
            return back()->with('error', "Milestone '{$milestone->title}' cannot be edited because it is no longer pending (current status: {$statusLabel}).");
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0.01',
            'due_date' => 'nullable|date',
            'order' => 'nullable|integer|min:1',
            'payment_status' => 'required|in:waiting-client-to-pay,paid-and-bank-processing,collected,refunded',
            'payment_method' => 'nullable|string|max:100',
            'payment_details' => 'nullable|string',
            'payment_instructions' => 'nullable|string',
            'github_repo_url' => 'nullable|url|max:255',
            'drive_link' => 'nullable|url|max:500',
            'live_demo_url' => 'nullable|url|max:255',
            'deliverable_notes' => 'nullable|string',
            'is_deliverable_unlocked' => 'nullable|boolean',
            'refund_amount' => 'nullable|numeric|min:0',
            'refund_trx_id' => 'nullable|string|max:100',
            'refund_reason' => 'nullable|string|max:1000',
        ]);

        $agreedPrice = (float) ($order->agreed_price ?: $order->estimated_budget ?: 0);
        $otherActiveTotal = (float) $order->milestones()
            ->where('id', '!=', $milestone->id)
            ->where('payment_status', '!=', 'refunded')
            ->sum('amount');

        $maxAllowed = max(0, $agreedPrice - $otherActiveTotal);

        if ($validated['payment_status'] !== 'refunded' && $validated['amount'] > $maxAllowed) {
            return back()->withErrors([
                'amount' => "The milestone amount cannot exceed the remaining contract allowance ({$order->currency} " . number_format($maxAllowed, 2) . ")."
            ])->with('error', "Milestone amount cannot exceed the remaining contract allowance ({$order->currency} " . number_format($maxAllowed, 2) . ")!");
        }

        $previousStatus = $milestone->payment_status;

        if ($previousStatus === 'collected' && $validated['payment_status'] === 'waiting-client-to-pay') {
            return back()->withErrors([
                'payment_status' => "A completed/collected milestone cannot be reverted back to awaiting client payment."
            ])->with('error', "A completed/collected milestone cannot be reverted back to awaiting client payment!");
        }

        if ($validated['payment_status'] === 'collected' && $previousStatus !== 'collected') {
            $validated['collected_at'] = Carbon::now();
        } elseif ($validated['payment_status'] !== 'collected') {
            $validated['collected_at'] = null;
        }

        if ($validated['payment_status'] === 'refunded' && $previousStatus !== 'refunded') {
            $validated['refunded_at'] = Carbon::now();
            if (empty($validated['refund_amount'])) {
                $validated['refund_amount'] = $validated['amount'];
            }
        }

        $validated['is_deliverable_unlocked'] = $request->boolean('is_deliverable_unlocked', true);

        try {
            $milestone->update($validated);
        } catch (\Illuminate\Database\QueryException $e) {
            if (str_contains($e->getMessage(), '1265') || str_contains($e->getMessage(), 'Data truncated')) {
                \Illuminate\Support\Facades\DB::statement("ALTER TABLE `custom_order_milestones` MODIFY COLUMN `payment_status` VARCHAR(50) NOT NULL DEFAULT 'waiting-client-to-pay'");
                $milestone->update($validated);
            } else {
                throw $e;
            }
        }

        if ($validated['payment_status'] === 'collected' && $previousStatus !== 'collected') {
            try {
                if ($order->user && !empty($order->user->email)) {
                    Mail::to($order->user->email)->send(new MilestoneCollectedMail($order, $milestone));
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('Failed sending MilestoneCollectedMail: ' . $e->getMessage());
            }
        }

        return redirect()->route('admin.custom-orders.show', $order->id)
            ->with('success', "Milestone '{$milestone->title}' updated successfully!");
    }

    /**
     * Fast 1-click status updater for milestone payment status.
     */
    public function updateStatus(Request $request, int $orderId, int $milestoneId): RedirectResponse
    {
        $order = CustomOrder::with('user')->findOrFail($orderId);
        $milestone = CustomOrderMilestone::where('custom_order_id', $order->id)->findOrFail($milestoneId);

        if ($order->status === 'completed') {
            return back()->with('error', 'Milestone payment status cannot be altered on a completed project.');
        }

        $request->validate([
            'payment_status' => 'required|in:waiting-client-to-pay,paid-and-bank-processing,collected,refunded',
        ]);

        $newStatus = $request->payment_status;
        $previousStatus = $milestone->payment_status;

        if ($previousStatus === 'collected' && $newStatus === 'waiting-client-to-pay') {
            return redirect()->route('admin.custom-orders.show', $order->id)
                ->with('error', "A completed/collected milestone cannot be reverted back to awaiting client payment!");
        }

        $updateData = ['payment_status' => $newStatus];

        if ($newStatus === 'collected' && $previousStatus !== 'collected') {
            $updateData['collected_at'] = Carbon::now();
        } elseif ($newStatus !== 'collected') {
            $updateData['collected_at'] = null;
        }

        if ($newStatus === 'refunded' && $previousStatus !== 'refunded') {
            $updateData['refunded_at'] = Carbon::now();
            $updateData['refund_amount'] = $milestone->amount;
        }

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

        if ($newStatus === 'collected' && $previousStatus !== 'collected') {
            try {
                if ($order->user && !empty($order->user->email)) {
                    Mail::to($order->user->email)->send(new MilestoneCollectedMail($order, $milestone));
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('Failed sending MilestoneCollectedMail: ' . $e->getMessage());
            }
        }

        return redirect()->route('admin.custom-orders.show', $order->id)
            ->with('success', "Milestone '{$milestone->title}' status set to: {$milestone->status_badge['label']}");
    }

    /**
     * Delete a milestone (Admin only, and only if still pending / waiting for client to pay).
     */
    public function destroy(int $orderId, int $milestoneId): RedirectResponse
    {
        $order = CustomOrder::findOrFail($orderId);
        $milestone = CustomOrderMilestone::where('custom_order_id', $order->id)->findOrFail($milestoneId);

        if ($order->status === 'completed') {
            return back()->with('error', 'Milestones cannot be deleted on a completed project.');
        }

        if ($milestone->payment_status !== 'waiting-client-to-pay') {
            $statusLabel = $milestone->status_badge['label'] ?? $milestone->payment_status;
            return redirect()->route('admin.custom-orders.show', $order->id)
                ->with('error', "Milestone '{$milestone->title}' cannot be deleted because it is not pending (current status: {$statusLabel}).");
        }

        $title = $milestone->title;
        $milestone->delete();

        return redirect()->route('admin.custom-orders.show', $order->id)
            ->with('info', "Pending milestone '{$title}' removed.");
    }
}
