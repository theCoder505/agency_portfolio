<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomOrderMilestone extends Model
{
    use HasFactory;

    protected $fillable = [
        'custom_order_id',
        'order',
        'title',
        'description',
        'amount',
        'exchange_rate_to_bdt',
        'due_date',
        'payment_status',
        'payment_method',
        'payment_details',
        'payment_instructions',
        'client_payment_method',
        'client_trx_id',
        'client_sender_info',
        'client_payment_proof',
        'client_payment_notes',
        'client_paid_at',
        'collected_at',
        'refund_amount',
        'refund_trx_id',
        'refund_reason',
        'refunded_at',
        'github_repo_url',
        'drive_link',
        'live_demo_url',
        'deliverable_notes',
        'is_deliverable_unlocked',
    ];

    protected $casts = [
        'amount' => 'float',
        'refund_amount' => 'float',
        'exchange_rate_to_bdt' => 'float',
        'order' => 'integer',
        'due_date' => 'date',
        'client_paid_at' => 'datetime',
        'collected_at' => 'datetime',
        'refunded_at' => 'datetime',
        'is_deliverable_unlocked' => 'boolean',
    ];

    protected $appends = [
        'effective_exchange_rate',
        'status_badge',
        'has_deliverables',
        'is_late',
        'days_overdue',
    ];

    public function customOrder(): BelongsTo
    {
        return $this->belongsTo(CustomOrder::class, 'custom_order_id');
    }

    public function getEffectiveExchangeRateAttribute(): float
    {
        if ($this->exchange_rate_to_bdt && $this->exchange_rate_to_bdt > 0) {
            return (float) $this->exchange_rate_to_bdt;
        }
        if ($this->relationLoaded('customOrder') && $this->customOrder) {
            $orderRate = $this->customOrder->exchange_rate_to_bdt;
            if ($orderRate && $orderRate > 0) {
                return (float) $orderRate;
            }
            if ($this->customOrder->currency === 'BDT') {
                return 1.0;
            }
            return ($this->customOrder->currency === 'EUR') ? 130.0 : 120.0;
        }
        return 120.0;
    }

    public function getStatusBadgeAttribute(): array
    {
        return match ($this->payment_status) {
            'waiting-client-to-pay' => [
                'label' => 'Waiting for Client Payment',
                'short_label' => 'Awaiting Payment',
                'color' => 'amber',
                'code' => 'waiting-client-to-pay',
            ],
            'paid-and-bank-processing' => [
                'label' => 'Paid & Bank Processing',
                'short_label' => 'Under Verification',
                'color' => 'blue',
                'code' => 'paid-and-bank-processing',
            ],
            'collected' => [
                'label' => 'Payment Collected (Received)',
                'short_label' => 'Collected',
                'color' => 'emerald',
                'code' => 'collected',
            ],
            'refunded' => [
                'label' => 'Payment Returned / Refunded',
                'short_label' => 'Refunded',
                'color' => 'rose',
                'code' => 'refunded',
            ],
            default => [
                'label' => ucfirst(str_replace('-', ' ', $this->payment_status)),
                'short_label' => ucfirst(str_replace('-', ' ', $this->payment_status)),
                'color' => 'slate',
                'code' => $this->payment_status,
            ],
        };
    }

    public function getHasDeliverablesAttribute(): bool
    {
        return !empty($this->github_repo_url) || !empty($this->drive_link) || !empty($this->live_demo_url);
    }

    public function getIsLateAttribute(): bool
    {
        if (in_array($this->payment_status, ['collected', 'refunded']) || !$this->due_date) {
            return false;
        }
        return Carbon::today()->greaterThan(Carbon::parse($this->due_date)->startOfDay());
    }

    public function getDaysOverdueAttribute(): int
    {
        if (!$this->due_date) {
            return 0;
        }
        $due = Carbon::parse($this->due_date)->startOfDay();
        if (in_array($this->payment_status, ['collected', 'refunded'])) {
            $paid = $this->collected_at ? Carbon::parse($this->collected_at)->startOfDay() : null;
            return ($paid && $paid->greaterThan($due)) ? $paid->diffInDays($due) : 0;
        }
        $today = Carbon::today();
        return $today->greaterThan($due) ? $today->diffInDays($due) : 0;
    }
}
