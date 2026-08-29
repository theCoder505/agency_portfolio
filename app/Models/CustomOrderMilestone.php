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
        'github_repo_url',
        'drive_link',
        'live_demo_url',
        'deliverable_notes',
        'is_deliverable_unlocked',
    ];

    protected $casts = [
        'amount' => 'float',
        'order' => 'integer',
        'due_date' => 'date',
        'client_paid_at' => 'datetime',
        'collected_at' => 'datetime',
        'is_deliverable_unlocked' => 'boolean',
    ];

    protected $appends = [
        'status_badge',
        'has_deliverables',
    ];

    public function customOrder(): BelongsTo
    {
        return $this->belongsTo(CustomOrder::class, 'custom_order_id');
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
            default => [
                'label' => ucfirst($this->payment_status),
                'short_label' => ucfirst($this->payment_status),
                'color' => 'slate',
                'code' => $this->payment_status,
            ],
        };
    }

    public function getHasDeliverablesAttribute(): bool
    {
        return !empty($this->github_repo_url) || !empty($this->drive_link) || !empty($this->live_demo_url);
    }
}
