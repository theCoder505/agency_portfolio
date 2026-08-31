<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomOrder;
use App\Models\CustomOrderMilestone;
use App\Models\SaasSubscription;
use App\Models\SubscriptionInvoice;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PnLController extends Controller
{
    /**
     * Normalize currency strings to standard ISO codes (BDT, USD, EUR).
     */
    private function normalizeCurrency(?string $currency): string
    {
        if (!$currency) {
            return 'BDT';
        }
        $c = strtoupper(trim($currency));
        if (in_array($c, ['BDT', '৳', 'TK', 'TAKA'])) {
            return 'BDT';
        }
        if (in_array($c, ['USD', '$', 'DOLLAR'])) {
            return 'USD';
        }
        if (in_array($c, ['EUR', '€', 'EURO'])) {
            return 'EUR';
        }
        return $c;
    }

    /**
     * Display P&L (Profit & Loss / Revenue Analytics) representing:
     * Cleared Income = Collected Custom Order Milestones + Paid/Approved Subscriptions
     * Plus Separate Metrics for Cancelled, Rejected, and Returned / Refunded orders.
     */
    public function index(Request $request): Response
    {
        $timeframe = $request->query('timeframe', 'monthly'); // monthly (default), daily, weekly, yearly, custom
        $currencyFilter = strtoupper($request->query('currency', 'ALL')); // ALL, BDT, USD, EUR

        // 1. Determine Exact Start & End Date depending on timeframe
        switch ($timeframe) {
            case 'daily':
                if ($request->filled('from_date')) {
                    $startDate = Carbon::parse($request->query('from_date'))->startOfDay();
                    $endDate = $request->filled('to_date') 
                        ? Carbon::parse($request->query('to_date'))->endOfDay() 
                        : $startDate->copy()->endOfDay();
                } else {
                    $startDate = Carbon::now()->startOfDay();
                    $endDate = Carbon::now()->endOfDay();
                }
                break;

            case 'weekly':
                if ($request->filled('from_date')) {
                    $startDate = Carbon::parse($request->query('from_date'))->startOfWeek();
                    $endDate = $request->filled('to_date') 
                        ? Carbon::parse($request->query('to_date'))->endOfWeek() 
                        : $startDate->copy()->endOfWeek();
                } else {
                    $startDate = Carbon::now()->startOfWeek();
                    $endDate = Carbon::now()->endOfWeek();
                }
                break;

            case 'yearly':
                if ($request->filled('from_date')) {
                    $startDate = Carbon::parse($request->query('from_date'))->startOfYear();
                    $endDate = $request->filled('to_date') 
                        ? Carbon::parse($request->query('to_date'))->endOfYear() 
                        : $startDate->copy()->endOfYear();
                } else {
                    $startDate = Carbon::now()->startOfYear();
                    $endDate = Carbon::now()->endOfYear();
                }
                break;

            case 'custom':
                $startDate = $request->filled('from_date')
                    ? Carbon::parse($request->query('from_date'))->startOfDay()
                    : Carbon::now()->startOfMonth();
                $endDate = $request->filled('to_date')
                    ? Carbon::parse($request->query('to_date'))->endOfDay()
                    : Carbon::now()->endOfMonth();
                break;

            case 'monthly':
            default:
                $timeframe = 'monthly';
                if ($request->filled('from_date')) {
                    $startDate = Carbon::parse($request->query('from_date'))->startOfMonth();
                    $endDate = $request->filled('to_date') 
                        ? Carbon::parse($request->query('to_date'))->endOfMonth() 
                        : $startDate->copy()->endOfMonth();
                } else {
                    $startDate = Carbon::now()->startOfMonth();
                    $endDate = Carbon::now()->endOfMonth();
                }
                break;
        }

        // -------------------------------------------------------------
        // 2. FETCH CLEARED INCOME ONLY (Paid Invoices & Collected Milestones)
        // -------------------------------------------------------------

        // 2A. Fetch Paid Orders & Subscriptions Invoices within the date range
        $invoices = SubscriptionInvoice::with(['user', 'subscription.product'])
            ->where('status', 'paid')
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('paid_at', [$startDate, $endDate])
                  ->orWhere(function ($subQ) use ($startDate, $endDate) {
                      $subQ->whereNull('paid_at')
                           ->whereBetween('created_at', [$startDate, $endDate]);
                  });
            })
            ->get();

        // 2B. Fallback for Active Subscriptions that might not have an invoice record
        $activeSubscriptionsWithoutInvoices = SaasSubscription::with(['user', 'product'])
            ->where('status', 'active')
            ->whereDoesntHave('invoices', function ($q) {
                $q->where('status', 'paid');
            })
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('approved_at', [$startDate, $endDate])
                  ->orWhere(function ($subQ) use ($startDate, $endDate) {
                      $subQ->whereNull('approved_at')
                           ->whereBetween('created_at', [$startDate, $endDate]);
                  });
            })
            ->get();

        // 2C. Fetch Collected Custom Orders Milestones within the exact date range
        // Only payment_status = 'collected' is counted as cleared income
        $milestones = CustomOrderMilestone::with(['customOrder.user'])
            ->where('payment_status', 'collected')
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('collected_at', [$startDate, $endDate])
                  ->orWhere(function ($subQ) use ($startDate, $endDate) {
                      $subQ->whereNull('collected_at')
                           ->whereBetween('client_paid_at', [$startDate, $endDate]);
                  })
                  ->orWhere(function ($subQ2) use ($startDate, $endDate) {
                      $subQ2->whereNull('collected_at')
                            ->whereNull('client_paid_at')
                            ->whereBetween('updated_at', [$startDate, $endDate]);
                  });
            })
            ->get();

        // 2D. Fallback for Completed Custom Orders without any milestones
        $completedOrdersWithoutMilestones = CustomOrder::with('user')
            ->where('status', 'completed')
            ->whereDoesntHave('milestones')
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('completed_at', [$startDate, $endDate])
                  ->orWhere(function ($subQ) use ($startDate, $endDate) {
                      $subQ->whereNull('completed_at')
                           ->whereBetween('updated_at', [$startDate, $endDate]);
                  });
            })
            ->get();

        // -------------------------------------------------------------
        // 3. AGGREGATE CLEARED INCOME
        // -------------------------------------------------------------
        $totalBdt = 0.0;
        $totalUsd = 0.0;
        $totalEur = 0.0;

        $subscriptionsBdt = 0.0;
        $subscriptionsUsd = 0.0;
        $subscriptionsEur = 0.0;

        $customOrdersBdt = 0.0;
        $customOrdersUsd = 0.0;
        $customOrdersEur = 0.0;

        $gatewayCounts = [];
        $allTransactions = [];

        // Process Orders & Subscriptions Invoices
        foreach ($invoices as $inv) {
            $curr = $this->normalizeCurrency($inv->currency);
            $amt = (float) $inv->amount;
            $paidDate = $inv->paid_at ?? $inv->created_at;

            if ($curr === 'BDT') {
                $totalBdt += $amt;
                $subscriptionsBdt += $amt;
            } elseif ($curr === 'USD') {
                $totalUsd += $amt;
                $subscriptionsUsd += $amt;
            } elseif ($curr === 'EUR') {
                $totalEur += $amt;
                $subscriptionsEur += $amt;
            }

            $method = strtoupper($inv->payment_method ?: 'bKash/Nagad');
            $gatewayCounts[$method] = ($gatewayCounts[$method] ?? 0) + $amt;

            $allTransactions[] = [
                'id' => 'INV-' . $inv->id,
                'source' => 'Orders & Subscriptions',
                'source_type' => 'subscriptions',
                'invoice_number' => $inv->invoice_number,
                'order_number' => $inv->subscription?->order_number ?? 'N/A',
                'order_url' => $inv->subscription ? '/admin/subscriptions/' . $inv->subscription->order_number : '/admin/subscriptions',
                'client_name' => $inv->user?->name ?? 'Customer',
                'client_email' => $inv->user?->email ?? '',
                'title' => ($inv->subscription?->product?->name ?? 'SaaS Product') . ' (' . ucfirst($inv->type ?: 'initial') . ' • ' . ucfirst(str_replace('_', ' ', $inv->billing_cycle ?: 'monthly')) . ')',
                'amount' => $amt,
                'currency' => $curr,
                'payment_method' => $inv->payment_method ?: 'bKash/Nagad',
                'transaction_id' => $inv->transaction_id ?: 'N/A',
                'paid_at' => $paidDate ? $paidDate->toIso8601String() : null,
                'paid_at_formatted' => $paidDate ? $paidDate->format('M d, Y') : 'N/A',
                'status' => 'paid',
            ];
        }

        // Process Direct Active Subscriptions (if any without invoices)
        foreach ($activeSubscriptionsWithoutInvoices as $sub) {
            $curr = $this->normalizeCurrency($sub->currency);
            $amt = (float) $sub->amount;
            $paidDate = $sub->approved_at ?? $sub->created_at;

            if ($curr === 'BDT') {
                $totalBdt += $amt;
                $subscriptionsBdt += $amt;
            } elseif ($curr === 'USD') {
                $totalUsd += $amt;
                $subscriptionsUsd += $amt;
            } elseif ($curr === 'EUR') {
                $totalEur += $amt;
                $subscriptionsEur += $amt;
            }

            $method = strtoupper($sub->payment_method ?: 'bKash/Nagad');
            $gatewayCounts[$method] = ($gatewayCounts[$method] ?? 0) + $amt;

            $allTransactions[] = [
                'id' => 'SUB-' . $sub->id,
                'source' => 'Orders & Subscriptions',
                'source_type' => 'subscriptions',
                'invoice_number' => 'ORD-' . $sub->order_number,
                'order_number' => $sub->order_number,
                'order_url' => '/admin/subscriptions/' . $sub->order_number,
                'client_name' => $sub->user?->name ?? 'Customer',
                'client_email' => $sub->user?->email ?? '',
                'title' => ($sub->product?->name ?? 'SaaS Product') . ' (Direct Approval • ' . ucfirst(str_replace('_', ' ', $sub->billing_cycle ?: 'monthly')) . ')',
                'amount' => $amt,
                'currency' => $curr,
                'payment_method' => $sub->payment_method ?: 'bKash/Nagad',
                'transaction_id' => $sub->transaction_id ?: 'N/A',
                'paid_at' => $paidDate ? $paidDate->toIso8601String() : null,
                'paid_at_formatted' => $paidDate ? $paidDate->format('M d, Y') : 'N/A',
                'status' => 'paid',
            ];
        }

        // Process Collected Custom Order Milestones
        foreach ($milestones as $ms) {
            $curr = $this->normalizeCurrency($ms->customOrder?->currency);
            $amt = (float) $ms->amount;
            $paidDate = $ms->collected_at ?? $ms->client_paid_at ?? $ms->updated_at;

            if ($curr === 'BDT') {
                $totalBdt += $amt;
                $customOrdersBdt += $amt;
            } elseif ($curr === 'USD') {
                $totalUsd += $amt;
                $customOrdersUsd += $amt;
            } elseif ($curr === 'EUR') {
                $totalEur += $amt;
                $customOrdersEur += $amt;
            }

            $method = strtoupper($ms->client_payment_method ?: $ms->payment_method ?: 'Direct');
            $gatewayCounts[$method] = ($gatewayCounts[$method] ?? 0) + $amt;

            $allTransactions[] = [
                'id' => 'MS-' . $ms->id,
                'source' => 'Custom Orders',
                'source_type' => 'custom_orders',
                'invoice_number' => 'MS-' . $ms->id,
                'order_number' => $ms->customOrder?->order_number ?? 'N/A',
                'order_url' => $ms->customOrder ? '/admin/custom-orders/' . $ms->customOrder->order_number : '/admin/custom-orders',
                'client_name' => $ms->customOrder?->user?->name ?? 'Client',
                'client_email' => $ms->customOrder?->user?->email ?? '',
                'title' => ($ms->customOrder?->title ?? 'Custom Project') . ' • ' . $ms->title,
                'amount' => $amt,
                'currency' => $curr,
                'payment_method' => $ms->client_payment_method ?: $ms->payment_method ?: 'Direct',
                'transaction_id' => $ms->client_trx_id ?: 'N/A',
                'paid_at' => $paidDate ? $paidDate->toIso8601String() : null,
                'paid_at_formatted' => $paidDate ? $paidDate->format('M d, Y') : 'N/A',
                'status' => 'collected',
            ];
        }

        // Process Completed Custom Orders without Milestones
        foreach ($completedOrdersWithoutMilestones as $co) {
            $curr = $this->normalizeCurrency($co->currency);
            $amt = (float) ($co->agreed_price ?: $co->estimated_budget ?: 0);
            $paidDate = $co->completed_at ?? $co->updated_at;

            if ($amt > 0) {
                if ($curr === 'BDT') {
                    $totalBdt += $amt;
                    $customOrdersBdt += $amt;
                } elseif ($curr === 'USD') {
                    $totalUsd += $amt;
                    $customOrdersUsd += $amt;
                } elseif ($curr === 'EUR') {
                    $totalEur += $amt;
                    $customOrdersEur += $amt;
                }

                $method = 'DIRECT / SETTLED';
                $gatewayCounts[$method] = ($gatewayCounts[$method] ?? 0) + $amt;

                $allTransactions[] = [
                    'id' => 'CO-' . $co->id,
                    'source' => 'Custom Orders',
                    'source_type' => 'custom_orders',
                    'invoice_number' => 'ORD-' . $co->order_number,
                    'order_number' => $co->order_number,
                    'order_url' => '/admin/custom-orders/' . $co->order_number,
                    'client_name' => $co->user?->name ?? 'Client',
                    'client_email' => $co->user?->email ?? '',
                    'title' => ($co->title ?? 'Custom Project') . ' (Direct Contract Settlement)',
                    'amount' => $amt,
                    'currency' => $curr,
                    'payment_method' => 'Direct Settlement',
                    'transaction_id' => 'SETTLED',
                    'paid_at' => $paidDate ? $paidDate->toIso8601String() : null,
                    'paid_at_formatted' => $paidDate ? $paidDate->format('M d, Y') : 'N/A',
                    'status' => 'completed',
                ];
            }
        }

        // Sort cleared transactions newest to oldest
        usort($allTransactions, function ($a, $b) {
            return strcmp($b['paid_at'] ?? '', $a['paid_at'] ?? '');
        });

        // -------------------------------------------------------------
        // 4. FETCH CANCELLED, REJECTED & RETURNED / REFUNDED STATS & RECORDS
        // -------------------------------------------------------------
        $nonClearedItems = [];

        $refundedBdt = 0.0;
        $refundedUsd = 0.0;
        $refundedEur = 0.0;
        $refundedCount = 0;

        $rejectedSubscriptionsBdt = 0.0;
        $rejectedSubscriptionsUsd = 0.0;
        $rejectedSubscriptionsEur = 0.0;
        $rejectedSubscriptionsCount = 0;

        $cancelledCustomOrdersBdt = 0.0;
        $cancelledCustomOrdersUsd = 0.0;
        $cancelledCustomOrdersEur = 0.0;
        $cancelledCustomOrdersCount = 0;

        // 4A. Refunded / Returned Custom Order Milestones
        $refundedMilestones = CustomOrderMilestone::with(['customOrder.user'])
            ->where('payment_status', 'refunded')
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('refunded_at', [$startDate, $endDate])
                  ->orWhere(function ($subQ) use ($startDate, $endDate) {
                      $subQ->whereNull('refunded_at')
                           ->whereBetween('updated_at', [$startDate, $endDate]);
                  });
            })
            ->get();

        foreach ($refundedMilestones as $rf) {
            $curr = $this->normalizeCurrency($rf->customOrder?->currency);
            $amt = (float) ($rf->refund_amount ?: $rf->amount);
            $date = $rf->refunded_at ?? $rf->updated_at;

            if ($curr === 'BDT') $refundedBdt += $amt;
            elseif ($curr === 'USD') $refundedUsd += $amt;
            elseif ($curr === 'EUR') $refundedEur += $amt;
            $refundedCount++;

            $nonClearedItems[] = [
                'id' => 'RF-MS-' . $rf->id,
                'category' => 'refunded',
                'category_label' => 'Payment Returned / Refunded',
                'source' => 'Custom Orders',
                'source_type' => 'custom_orders',
                'ref_number' => 'MS-' . $rf->id,
                'order_number' => $rf->customOrder?->order_number ?? 'N/A',
                'order_url' => $rf->customOrder ? '/admin/custom-orders/' . $rf->customOrder->order_number : '/admin/custom-orders',
                'client_name' => $rf->customOrder?->user?->name ?? 'Client',
                'client_email' => $rf->customOrder?->user?->email ?? '',
                'title' => ($rf->customOrder?->title ?? 'Custom Project') . ' • ' . $rf->title,
                'amount' => $amt,
                'currency' => $curr,
                'reason' => $rf->refund_reason ?: 'Payment returned / refunded to client',
                'transaction_id' => $rf->refund_trx_id ?: ($rf->client_trx_id ?: 'N/A'),
                'occurred_at' => $date ? $date->toIso8601String() : null,
                'occurred_at_formatted' => $date ? $date->format('M d, Y') : 'N/A',
            ];
        }

        // 4B. Denied / Cancelled Custom Orders
        $cancelledOrders = CustomOrder::with('user')
            ->whereIn('status', ['denied', 'cancelled'])
            ->whereBetween('updated_at', [$startDate, $endDate])
            ->get();

        foreach ($cancelledOrders as $co) {
            $curr = $this->normalizeCurrency($co->currency);
            $amt = (float) ($co->agreed_price ?: $co->estimated_budget ?: 0);
            $date = $co->updated_at;

            if ($curr === 'BDT') $cancelledCustomOrdersBdt += $amt;
            elseif ($curr === 'USD') $cancelledCustomOrdersUsd += $amt;
            elseif ($curr === 'EUR') $cancelledCustomOrdersEur += $amt;
            $cancelledCustomOrdersCount++;

            $nonClearedItems[] = [
                'id' => 'CAN-CO-' . $co->id,
                'category' => 'cancelled',
                'category_label' => $co->status === 'denied' ? 'Proposal Denied' : 'Order Cancelled',
                'source' => 'Custom Orders',
                'source_type' => 'custom_orders',
                'ref_number' => 'ORD-' . $co->order_number,
                'order_number' => $co->order_number,
                'order_url' => '/admin/custom-orders/' . $co->order_number,
                'client_name' => $co->user?->name ?? 'Client',
                'client_email' => $co->user?->email ?? '',
                'title' => $co->title ?? 'Custom Project',
                'amount' => $amt,
                'currency' => $curr,
                'reason' => $co->rejection_reason ?: ($co->admin_notes ?: 'Project cancelled or denied by admin'),
                'transaction_id' => 'N/A',
                'occurred_at' => $date ? $date->toIso8601String() : null,
                'occurred_at_formatted' => $date ? $date->format('M d, Y') : 'N/A',
            ];
        }

        // 4C. Rejected Subscription Invoices
        $rejectedInvoices = SubscriptionInvoice::with(['user', 'subscription.product'])
            ->where('status', 'rejected')
            ->whereBetween('updated_at', [$startDate, $endDate])
            ->get();

        foreach ($rejectedInvoices as $rjInv) {
            $curr = $this->normalizeCurrency($rjInv->currency);
            $amt = (float) $rjInv->amount;
            $date = $rjInv->updated_at;

            if ($curr === 'BDT') $rejectedSubscriptionsBdt += $amt;
            elseif ($curr === 'USD') $rejectedSubscriptionsUsd += $amt;
            elseif ($curr === 'EUR') $rejectedSubscriptionsEur += $amt;
            $rejectedSubscriptionsCount++;

            $nonClearedItems[] = [
                'id' => 'RJ-INV-' . $rjInv->id,
                'category' => 'rejected',
                'category_label' => 'Payment Rejected',
                'source' => 'Orders & Subscriptions',
                'source_type' => 'subscriptions',
                'ref_number' => $rjInv->invoice_number,
                'order_number' => $rjInv->subscription?->order_number ?? 'N/A',
                'order_url' => $rjInv->subscription ? '/admin/subscriptions/' . $rjInv->subscription->order_number : '/admin/subscriptions',
                'client_name' => $rjInv->user?->name ?? 'Customer',
                'client_email' => $rjInv->user?->email ?? '',
                'title' => ($rjInv->subscription?->product?->name ?? 'SaaS Product') . ' (' . ucfirst($rjInv->type ?: 'initial') . ')',
                'amount' => $amt,
                'currency' => $curr,
                'reason' => $rjInv->rejection_reason ?: 'Payment verification rejected',
                'transaction_id' => $rjInv->transaction_id ?: 'N/A',
                'occurred_at' => $date ? $date->toIso8601String() : null,
                'occurred_at_formatted' => $date ? $date->format('M d, Y') : 'N/A',
            ];
        }

        // 4D. Rejected Subscriptions (where no rejected invoice is already counted)
        $rejectedSubscriptions = SaasSubscription::with(['user', 'product'])
            ->whereIn('status', ['rejected', 'cancelled'])
            ->whereDoesntHave('invoices', function ($q) {
                $q->where('status', 'rejected');
            })
            ->whereBetween('updated_at', [$startDate, $endDate])
            ->get();

        foreach ($rejectedSubscriptions as $rjSub) {
            $curr = $this->normalizeCurrency($rjSub->currency);
            $amt = (float) $rjSub->amount;
            $date = $rjSub->updated_at;

            if ($curr === 'BDT') $rejectedSubscriptionsBdt += $amt;
            elseif ($curr === 'USD') $rejectedSubscriptionsUsd += $amt;
            elseif ($curr === 'EUR') $rejectedSubscriptionsEur += $amt;
            $rejectedSubscriptionsCount++;

            $nonClearedItems[] = [
                'id' => 'RJ-SUB-' . $rjSub->id,
                'category' => 'rejected',
                'category_label' => ucfirst($rjSub->status),
                'source' => 'Orders & Subscriptions',
                'source_type' => 'subscriptions',
                'ref_number' => 'ORD-' . $rjSub->order_number,
                'order_number' => $rjSub->order_number,
                'order_url' => '/admin/subscriptions/' . $rjSub->order_number,
                'client_name' => $rjSub->user?->name ?? 'Customer',
                'client_email' => $rjSub->user?->email ?? '',
                'title' => ($rjSub->product?->name ?? 'SaaS Product') . ' (' . ucfirst(str_replace('_', ' ', $rjSub->billing_cycle ?: 'monthly')) . ')',
                'amount' => $amt,
                'currency' => $curr,
                'reason' => $rjSub->rejection_reason ?: 'Subscription rejected or cancelled',
                'transaction_id' => $rjSub->transaction_id ?: 'N/A',
                'occurred_at' => $date ? $date->toIso8601String() : null,
                'occurred_at_formatted' => $date ? $date->format('M d, Y') : 'N/A',
            ];
        }

        // Sort non-cleared items newest to oldest
        usort($nonClearedItems, function ($a, $b) {
            return strcmp($b['occurred_at'] ?? '', $a['occurred_at'] ?? '');
        });

        // -------------------------------------------------------------
        // 5. FETCH UNCLEARED / PENDING PIPELINE STATS (Waiting / Processing)
        // -------------------------------------------------------------
        $pendingMilestones = CustomOrderMilestone::with(['customOrder.user'])
            ->whereIn('payment_status', ['waiting-client-to-pay', 'paid-and-bank-processing'])
            ->get();

        $pendingInvoices = SubscriptionInvoice::with(['user', 'subscription.product'])
            ->where('status', 'pending')
            ->get();

        $pendingBdt = 0.0;
        $pendingUsd = 0.0;
        $pendingEur = 0.0;

        foreach ($pendingMilestones as $pm) {
            $curr = $this->normalizeCurrency($pm->customOrder?->currency);
            $amt = (float) $pm->amount;
            if ($curr === 'BDT') $pendingBdt += $amt;
            elseif ($curr === 'USD') $pendingUsd += $amt;
            elseif ($curr === 'EUR') $pendingEur += $amt;
        }

        foreach ($pendingInvoices as $pi) {
            $curr = $this->normalizeCurrency($pi->currency);
            $amt = (float) $pi->amount;
            if ($curr === 'BDT') $pendingBdt += $amt;
            elseif ($curr === 'USD') $pendingUsd += $amt;
            elseif ($curr === 'EUR') $pendingEur += $amt;
        }

        // -------------------------------------------------------------
        // 6. GENERATE DYNAMIC TIME-SERIES CHART DATASETS
        // -------------------------------------------------------------
        $labels = [];
        $bdtSeries = [];
        $usdSeries = [];
        $eurSeries = [];

        if ($timeframe === 'daily') {
            for ($h = 0; $h < 24; $h += 2) {
                $key = sprintf('%02d', $h);
                $labels[$key] = Carbon::createFromTime($h, 0)->format('g A');
                $bdtSeries[$key] = 0;
                $usdSeries[$key] = 0;
                $eurSeries[$key] = 0;
            }

            foreach ($allTransactions as $tx) {
                if (!$tx['paid_at']) continue;
                $txHour = (int) Carbon::parse($tx['paid_at'])->format('H');
                $blockKey = sprintf('%02d', (int) floor($txHour / 2) * 2);
                if (isset($labels[$blockKey])) {
                    if ($tx['currency'] === 'BDT') $bdtSeries[$blockKey] += $tx['amount'];
                    elseif ($tx['currency'] === 'USD') $usdSeries[$blockKey] += $tx['amount'];
                    elseif ($tx['currency'] === 'EUR') $eurSeries[$blockKey] += $tx['amount'];
                }
            }
        } elseif ($timeframe === 'weekly') {
            $cursor = $startDate->copy();
            while ($cursor->lte($endDate)) {
                $key = $cursor->format('Y-m-d');
                $labels[$key] = $cursor->format('D (M d)');
                $bdtSeries[$key] = 0;
                $usdSeries[$key] = 0;
                $eurSeries[$key] = 0;
                $cursor->addDay();
            }

            foreach ($allTransactions as $tx) {
                if (!$tx['paid_at']) continue;
                $txDate = Carbon::parse($tx['paid_at'])->format('Y-m-d');
                if (isset($labels[$txDate])) {
                    if ($tx['currency'] === 'BDT') $bdtSeries[$txDate] += $tx['amount'];
                    elseif ($tx['currency'] === 'USD') $usdSeries[$txDate] += $tx['amount'];
                    elseif ($tx['currency'] === 'EUR') $eurSeries[$txDate] += $tx['amount'];
                }
            }
        } elseif ($timeframe === 'yearly') {
            $cursor = $startDate->copy();
            while ($cursor->lte($endDate)) {
                $key = $cursor->format('Y-m');
                $labels[$key] = $cursor->format('M Y');
                $bdtSeries[$key] = 0;
                $usdSeries[$key] = 0;
                $eurSeries[$key] = 0;
                $cursor->addMonth();
            }

            foreach ($allTransactions as $tx) {
                if (!$tx['paid_at']) continue;
                $txKey = Carbon::parse($tx['paid_at'])->format('Y-m');
                if (isset($labels[$txKey])) {
                    if ($tx['currency'] === 'BDT') $bdtSeries[$txKey] += $tx['amount'];
                    elseif ($tx['currency'] === 'USD') $usdSeries[$txKey] += $tx['amount'];
                    elseif ($tx['currency'] === 'EUR') $eurSeries[$txKey] += $tx['amount'];
                }
            }
        } else { 
            // monthly & custom ranges
            $cursor = $startDate->copy();
            $daysDiff = $startDate->diffInDays($endDate);

            if ($daysDiff <= 45) {
                while ($cursor->lte($endDate)) {
                    $key = $cursor->format('Y-m-d');
                    $labels[$key] = $cursor->format('M d');
                    $bdtSeries[$key] = 0;
                    $usdSeries[$key] = 0;
                    $eurSeries[$key] = 0;
                    $cursor->addDay();
                }

                foreach ($allTransactions as $tx) {
                    if (!$tx['paid_at']) continue;
                    $txDate = Carbon::parse($tx['paid_at'])->format('Y-m-d');
                    if (isset($labels[$txDate])) {
                        if ($tx['currency'] === 'BDT') $bdtSeries[$txDate] += $tx['amount'];
                        elseif ($tx['currency'] === 'USD') $usdSeries[$txDate] += $tx['amount'];
                        elseif ($tx['currency'] === 'EUR') $eurSeries[$txDate] += $tx['amount'];
                    }
                }
            } else {
                while ($cursor->lte($endDate)) {
                    $key = $cursor->format('Y-m');
                    $labels[$key] = $cursor->format('M Y');
                    $bdtSeries[$key] = 0;
                    $usdSeries[$key] = 0;
                    $eurSeries[$key] = 0;
                    $cursor->addMonth();
                }

                foreach ($allTransactions as $tx) {
                    if (!$tx['paid_at']) continue;
                    $txKey = Carbon::parse($tx['paid_at'])->format('Y-m');
                    if (isset($labels[$txKey])) {
                        if ($tx['currency'] === 'BDT') $bdtSeries[$txKey] += $tx['amount'];
                        elseif ($tx['currency'] === 'USD') $usdSeries[$txKey] += $tx['amount'];
                        elseif ($tx['currency'] === 'EUR') $eurSeries[$txKey] += $tx['amount'];
                    }
                }
            }
        }

        return Inertia::render('admin/reports/pnl', [
            'filters' => [
                'timeframe' => $timeframe,
                'currency' => $currencyFilter,
                'from_date' => $startDate->format('Y-m-d'),
                'to_date' => $endDate->format('Y-m-d'),
                'period_label' => $timeframe === 'monthly'
                    ? $startDate->format('F Y')
                    : ($timeframe === 'yearly'
                        ? $startDate->format('Y')
                        : ($timeframe === 'daily'
                            ? $startDate->format('M d, Y')
                            : ($startDate->format('M d, Y') . ' — ' . $endDate->format('M d, Y')))),
            ],
            'summary' => [
                'total_bdt' => $totalBdt,
                'total_usd' => $totalUsd,
                'total_eur' => $totalEur,
                'total_transactions' => count($allTransactions),
                'subscriptions_breakdown' => [
                    'bdt' => $subscriptionsBdt,
                    'usd' => $subscriptionsUsd,
                    'eur' => $subscriptionsEur,
                    'count' => $invoices->count() + $activeSubscriptionsWithoutInvoices->count(),
                ],
                'custom_orders_breakdown' => [
                    'bdt' => $customOrdersBdt,
                    'usd' => $customOrdersUsd,
                    'eur' => $customOrdersEur,
                    'count' => $milestones->count() + $completedOrdersWithoutMilestones->count(),
                ],
            ],
            'nonClearedSummary' => [
                'total_bdt' => $refundedBdt + $rejectedSubscriptionsBdt + $cancelledCustomOrdersBdt,
                'total_usd' => $refundedUsd + $rejectedSubscriptionsUsd + $cancelledCustomOrdersUsd,
                'total_eur' => $refundedEur + $rejectedSubscriptionsEur + $cancelledCustomOrdersEur,
                'total_count' => count($nonClearedItems),
                'refunded' => [
                    'bdt' => $refundedBdt,
                    'usd' => $refundedUsd,
                    'eur' => $refundedEur,
                    'count' => $refundedCount,
                ],
                'rejected_subscriptions' => [
                    'bdt' => $rejectedSubscriptionsBdt,
                    'usd' => $rejectedSubscriptionsUsd,
                    'eur' => $rejectedSubscriptionsEur,
                    'count' => $rejectedSubscriptionsCount,
                ],
                'cancelled_custom_orders' => [
                    'bdt' => $cancelledCustomOrdersBdt,
                    'usd' => $cancelledCustomOrdersUsd,
                    'eur' => $cancelledCustomOrdersEur,
                    'count' => $cancelledCustomOrdersCount,
                ],
            ],
            'pipelineSummary' => [
                'pending_bdt' => $pendingBdt,
                'pending_usd' => $pendingUsd,
                'pending_eur' => $pendingEur,
                'pending_milestones_count' => $pendingMilestones->count(),
                'pending_invoices_count' => $pendingInvoices->count(),
            ],
            'trendChart' => [
                'labels' => array_values($labels),
                'bdt' => array_values($bdtSeries),
                'usd' => array_values($usdSeries),
                'eur' => array_values($eurSeries),
            ],
            'gatewayBreakdown' => $gatewayCounts,
            'transactions' => $allTransactions,
            'nonClearedItems' => $nonClearedItems,
        ]);
    }
}
