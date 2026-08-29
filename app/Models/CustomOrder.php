<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class CustomOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'title',
        'category',
        'estimated_budget',
        'agreed_price',
        'currency',
        'target_deadline',
        'requirements',
        'reference_links',
        'attachments',
        'status',
        'admin_notes',
        'rejection_reason',
        'github_repo_url',
        'drive_link',
        'live_demo_url',
        'accepted_at',
        'completed_at',
    ];

    protected $casts = [
        'estimated_budget' => 'float',
        'agreed_price' => 'float',
        'attachments' => 'array',
        'target_deadline' => 'date',
        'accepted_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected $appends = [
        'total_milestones_amount',
        'total_collected_amount',
        'total_processing_amount',
        'total_pending_amount',
        'progress_percentage',
        'status_badge',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = 'CUST-' . strtoupper(Str::random(4)) . '-' . rand(1000, 9999);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(CustomOrderMilestone::class, 'custom_order_id')->orderBy('order', 'asc')->orderBy('id', 'asc');
    }

    /**
     * Compute the sum of all milestones settled amounts.
     */
    public function getTotalMilestonesAmountAttribute(): float
    {
        return (float) $this->milestones->sum('amount');
    }

    /**
     * Compute the sum of all collected milestone payments.
     */
    public function getTotalCollectedAmountAttribute(): float
    {
        return (float) $this->milestones->where('payment_status', 'collected')->sum('amount');
    }

    /**
     * Compute the sum of all paid & bank processing milestones.
     */
    public function getTotalProcessingAmountAttribute(): float
    {
        return (float) $this->milestones->where('payment_status', 'paid-and-bank-processing')->sum('amount');
    }

    /**
     * Compute the sum of waiting client to pay milestones.
     */
    public function getTotalPendingAmountAttribute(): float
    {
        return (float) $this->milestones->where('payment_status', 'waiting-client-to-pay')->sum('amount');
    }

    /**
     * Compute completion progress percentage based on collected milestones vs total agreed/milestones amount.
     */
    public function getProgressPercentageAttribute(): int
    {
        $totalMilestones = $this->milestones->count();
        if ($totalMilestones === 0) {
            return match ($this->status) {
                'completed' => 100,
                'in_progress', 'accepted' => 20,
                'denied', 'cancelled' => 0,
                default => 5,
            };
        }

        $collectedCount = $this->milestones->where('payment_status', 'collected')->count();
        $processingCount = $this->milestones->where('payment_status', 'paid-and-bank-processing')->count();

        $calc = (($collectedCount * 100) + ($processingCount * 50)) / $totalMilestones;
        return min(100, (int) round($calc));
    }

    /**
     * Visual UI badge info for order status.
     */
    public function getStatusBadgeAttribute(): array
    {
        return match ($this->status) {
            'pending' => [
                'label' => 'Under Review',
                'color' => 'amber',
                'description' => 'Our engineering team is evaluating your project scope & requirements.',
            ],
            'accepted' => [
                'label' => 'Accepted & Ready',
                'color' => 'indigo',
                'description' => 'Project accepted! Milestones and payment instructions are available.',
            ],
            'in_progress' => [
                'label' => 'In Development',
                'color' => 'blue',
                'description' => 'Project actively under active development.',
            ],
            'completed' => [
                'label' => 'Completed & Delivered',
                'color' => 'emerald',
                'description' => 'Project completed and all deliverables/codebase transferred.',
            ],
            'denied' => [
                'label' => 'Proposal Denied',
                'color' => 'rose',
                'description' => 'This project request could not be accepted at this time.',
            ],
            'cancelled' => [
                'label' => 'Cancelled',
                'color' => 'slate',
                'description' => 'Order was cancelled.',
            ],
            default => [
                'label' => ucfirst($this->status),
                'color' => 'slate',
                'description' => '',
            ],
        };
    }
}
