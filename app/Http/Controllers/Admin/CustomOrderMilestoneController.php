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

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'nullable|date',
            'order' => 'nullable|integer|min:1',
            'payment_status' => 'required|in:waiting-client-to-pay,paid-and-bank-processing,collected',
            'payment_method' => 'nullable|string|max:100',
            'payment_details' => 'nullable|string',
            'payment_instructions' => 'nullable|string',
            'github_repo_url' => 'nullable|url|max:255',
            'drive_link' => 'nullable|url|max:500',
            'live_demo_url' => 'nullable|url|max:255',
            'deliverable_notes' => 'nullable|string',
            'is_deliverable_unlocked' => 'nullable|boolean',
        ]);

        if (empty($validated['order'])) {
            $validated['order'] = ($order->milestones()->max('order') ?? 0) + 1;
        }

        if ($validated['payment_status'] === 'collected') {
            $validated['collected_at'] = Carbon::now();
        }

        $validated['custom_order_id'] = $order->id;
        $validated['is_deliverable_unlocked'] = $request->boolean('is_deliverable_unlocked', true);

        $milestone = CustomOrderMilestone::create($validated);

        // If all milestones collected and order active, can transition
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

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'nullable|date',
            'order' => 'nullable|integer|min:1',
            'payment_status' => 'required|in:waiting-client-to-pay,paid-and-bank-processing,collected',
            'payment_method' => 'nullable|string|max:100',
            'payment_details' => 'nullable|string',
            'payment_instructions' => 'nullable|string',
            'github_repo_url' => 'nullable|url|max:255',
            'drive_link' => 'nullable|url|max:500',
            'live_demo_url' => 'nullable|url|max:255',
            'deliverable_notes' => 'nullable|string',
            'is_deliverable_unlocked' => 'nullable|boolean',
        ]);

        $previousStatus = $milestone->payment_status;

        if ($validated['payment_status'] === 'collected' && $previousStatus !== 'collected') {
            $validated['collected_at'] = Carbon::now();
        } elseif ($validated['payment_status'] !== 'collected') {
            $validated['collected_at'] = null;
        }

        $validated['is_deliverable_unlocked'] = $request->boolean('is_deliverable_unlocked', true);

        $milestone->update($validated);

        // Send email to customer if newly marked as collected
        if ($validated['payment_status'] === 'collected' && $previousStatus !== 'collected') {
            try {
                if ($order->user && !empty($order->user->email)) {
                    Mail::to($order->user->email)->send(new MilestoneCollectedMail($order, $milestone));
                }
            } catch (\Throwable $e) {
                \Log::error('Failed sending MilestoneCollectedMail: ' . $e->getMessage());
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

        $request->validate([
            'payment_status' => 'required|in:waiting-client-to-pay,paid-and-bank-processing,collected',
        ]);

        $newStatus = $request->payment_status;
        $previousStatus = $milestone->payment_status;

        $updateData = ['payment_status' => $newStatus];

        if ($newStatus === 'collected' && $previousStatus !== 'collected') {
            $updateData['collected_at'] = Carbon::now();
        } elseif ($newStatus !== 'collected') {
            $updateData['collected_at'] = null;
        }

        $milestone->update($updateData);

        // Send notification to customer if marked collected
        if ($newStatus === 'collected' && $previousStatus !== 'collected') {
            try {
                if ($order->user && !empty($order->user->email)) {
                    Mail::to($order->user->email)->send(new MilestoneCollectedMail($order, $milestone));
                }
            } catch (\Throwable $e) {
                \Log::error('Failed sending MilestoneCollectedMail: ' . $e->getMessage());
            }
        }

        return redirect()->route('admin.custom-orders.show', $order->id)
            ->with('success', "Milestone '{$milestone->title}' status set to: {$milestone->status_badge['label']}");
    }

    /**
     * Delete a milestone.
     */
    public function destroy(int $orderId, int $milestoneId): RedirectResponse
    {
        $order = CustomOrder::findOrFail($orderId);
        $milestone = CustomOrderMilestone::where('custom_order_id', $order->id)->findOrFail($milestoneId);
        $title = $milestone->title;

        $milestone->delete();

        return redirect()->route('admin.custom-orders.show', $order->id)
            ->with('info', "Milestone '{$title}' removed.");
    }
}
