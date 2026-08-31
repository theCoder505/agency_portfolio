<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
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
        'proposed_budget',
        'proposed_currency',
        'proposed_budget_notes',
        'proposed_budget_at',
        'budget_update_status',
        'currency',
        'exchange_rate_to_bdt',
        'client_whatsapp',
        'client_email',
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
        'proposed_budget' => 'float',
        'exchange_rate_to_bdt' => 'float',
        'proposed_budget_at' => 'datetime',
        'attachments' => 'array',
        'target_deadline' => 'date',
        'accepted_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected $appends = [
        'effective_exchange_rate',
        'total_milestones_amount',
        'total_active_milestones_amount',
        'unallocated_milestone_amount',
        'total_collected_amount',
        'total_processing_amount',
        'total_pending_amount',
        'total_refunded_amount',
        'remaining_balance',
        'progress_percentage',
        'status_badge',
        'is_late',
        'days_overdue',
        'late_milestones_count',
        'has_pending_budget_request',
        'is_fully_paid',
        'slug',
        'customer_show_url',
        'admin_show_url',
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

    public function review(): HasOne
    {
        return $this->hasOne(Review::class, 'custom_order_id');
    }

    public function getEffectiveExchangeRateAttribute(): float
    {
        if ($this->currency === 'BDT') {
            return 1.0;
        }
        if ($this->exchange_rate_to_bdt && $this->exchange_rate_to_bdt > 0) {
            return (float) $this->exchange_rate_to_bdt;
        }
        return $this->currency === 'EUR' ? 130.0 : 120.0;
    }

    /**
     * Compute the sum of all milestones settled amounts.
     */
    public function getTotalMilestonesAmountAttribute(): float
    {
        if ($this->relationLoaded('milestones')) {
            return (float) $this->milestones->sum('amount');
        }
        return (float) $this->milestones()->sum('amount');
    }

    /**
     * Compute the sum of all active (not returned/refunded) milestones.
     */
    public function getTotalActiveMilestonesAmountAttribute(): float
    {
        if ($this->relationLoaded('milestones')) {
            return (float) $this->milestones->where('payment_status', '!=', 'refunded')->sum('amount');
        }
        return (float) $this->milestones()->where('payment_status', '!=', 'refunded')->sum('amount');
    }

    /**
     * Compute remaining milestone amount that can still be created for this order based on agreed main price.
     */
    public function getUnallocatedMilestoneAmountAttribute(): float
    {
        $milestonesSum = $this->relationLoaded('milestones') ? $this->milestones->sum('amount') : $this->milestones()->sum('amount');
        $agreedPrice = (float) ($this->agreed_price ?: $milestonesSum ?: $this->estimated_budget ?: 0);
        return max(0, $agreedPrice - $this->total_active_milestones_amount);
    }

    /**
     * Compute the sum of all collected milestone payments.
     */
    public function getTotalCollectedAmountAttribute(): float
    {
        if ($this->relationLoaded('milestones')) {
            return (float) $this->milestones->where('payment_status', 'collected')->sum('amount');
        }
        return (float) $this->milestones()->where('payment_status', 'collected')->sum('amount');
    }

    /**
     * Compute the sum of all paid & bank processing milestones.
     */
    public function getTotalProcessingAmountAttribute(): float
    {
        if ($this->relationLoaded('milestones')) {
            return (float) $this->milestones->where('payment_status', 'paid-and-bank-processing')->sum('amount');
        }
        return (float) $this->milestones()->where('payment_status', 'paid-and-bank-processing')->sum('amount');
    }

    /**
     * Compute the sum of waiting client to pay milestones.
     */
    public function getTotalPendingAmountAttribute(): float
    {
        if ($this->relationLoaded('milestones')) {
            return (float) $this->milestones->where('payment_status', 'waiting-client-to-pay')->sum('amount');
        }
        return (float) $this->milestones()->where('payment_status', 'waiting-client-to-pay')->sum('amount');
    }

    /**
     * Compute the sum of refunded / returned amounts.
     */
    public function getTotalRefundedAmountAttribute(): float
    {
        if ($this->relationLoaded('milestones')) {
            return (float) $this->milestones->sum(function ($m) {
                return (float) ($m->refund_amount ?: ($m->payment_status === 'refunded' ? $m->amount : 0));
            });
        }
        return (float) $this->milestones()->whereNotNull('refund_amount')->sum('refund_amount');
    }

    /**
     * Compute remaining balance due.
     */
    public function getRemainingBalanceAttribute(): float
    {
        $milestonesSum = $this->relationLoaded('milestones') ? $this->milestones->sum('amount') : $this->milestones()->sum('amount');
        $agreed = (float) ($this->agreed_price ?: $milestonesSum ?: $this->estimated_budget);
        return max(0, $agreed - $this->total_collected_amount);
    }

    /**
     * Compute completion progress percentage strictly according to completed payment relative to agreed price.
     */
    public function getProgressPercentageAttribute(): int
    {
        if ($this->status === 'completed') {
            return 100;
        }

        $milestonesSum = $this->relationLoaded('milestones') ? $this->milestones->sum('amount') : $this->milestones()->sum('amount');
        $agreedPrice = (float) ($this->agreed_price ?: $milestonesSum ?: $this->estimated_budget);
        if ($agreedPrice <= 0) {
            return match ($this->status) {
                'in_progress', 'accepted' => 20,
                'denied', 'cancelled' => 0,
                default => 5,
            };
        }

        $collectedAmount = $this->total_collected_amount;
        $calc = ($collectedAmount / $agreedPrice) * 100;
        return min(100, max(0, (int) round($calc)));
    }

    /**
     * Check if project is late / overdue.
     */
    public function getIsLateAttribute(): bool
    {
        if (in_array($this->status, ['cancelled', 'denied'])) {
            return false;
        }
        if ($this->status === 'completed' && $this->completed_at && $this->target_deadline) {
            return Carbon::parse($this->completed_at)->startOfDay()->greaterThan(Carbon::parse($this->target_deadline)->startOfDay());
        }
        if ($this->target_deadline && $this->status !== 'completed') {
            return Carbon::today()->greaterThan(Carbon::parse($this->target_deadline)->startOfDay());
        }
        return false;
    }

    /**
     * Number of days overdue.
     */
    public function getDaysOverdueAttribute(): int
    {
        if (!$this->target_deadline) {
            return 0;
        }
        $deadline = Carbon::parse($this->target_deadline)->startOfDay();
        if ($this->status === 'completed' && $this->completed_at) {
            $completed = Carbon::parse($this->completed_at)->startOfDay();
            return $completed->greaterThan($deadline) ? $completed->diffInDays($deadline) : 0;
        }
        $today = Carbon::today();
        return $today->greaterThan($deadline) ? $today->diffInDays($deadline) : 0;
    }

    /**
     * Count of overdue milestones.
     */
    public function getLateMilestonesCountAttribute(): int
    {
        $today = Carbon::today();
        if ($this->relationLoaded('milestones')) {
            return $this->milestones->filter(function ($m) use ($today) {
                return $m->due_date && 
                       !in_array($m->payment_status, ['collected', 'refunded']) &&
                       $today->greaterThan(Carbon::parse($m->due_date)->startOfDay());
            })->count();
        }
        return $this->milestones()
            ->whereNotNull('due_date')
            ->whereNotIn('payment_status', ['collected', 'refunded'])
            ->where('due_date', '<', $today->toDateString())
            ->count();
    }

    /**
     * Has a pending client budget update request.
     */
    public function getHasPendingBudgetRequestAttribute(): bool
    {
        return $this->budget_update_status === 'pending' && $this->proposed_budget !== null;
    }

    /**
     * Check if project payment is 100% fully settled.
     */
    public function getIsFullyPaidAttribute(): bool
    {
        $milestonesSum = $this->relationLoaded('milestones') ? $this->milestones->sum('amount') : $this->milestones()->sum('amount');
        $agreed = (float) ($this->agreed_price ?: $milestonesSum ?: $this->estimated_budget);
        if ($agreed <= 0) {
            return false;
        }
        return $this->total_collected_amount >= $agreed && $this->remaining_balance <= 0;
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

    /**
     * URL-friendly slug of project title.
     */
    public function getSlugAttribute(): string
    {
        $slug = Str::slug($this->title ?: 'custom-order');
        return !empty($slug) ? $slug : 'order';
    }

    /**
     * Full customer URL with ref and title: prefix/{ref}/{title}
     */
    public function getCustomerShowUrlAttribute(): string
    {
        $ref = $this->order_number ?: $this->id;
        return "/customer/custom-orders/{$ref}/{$this->slug}";
    }

    /**
     * Full admin URL with ref and title: prefix/{ref}/{title}
     */
    public function getAdminShowUrlAttribute(): string
    {
        $ref = $this->order_number ?: $this->id;
        return "/admin/custom-orders/{$ref}/{$this->slug}";
    }

    /**
     * Find CustomOrder by order_number or numeric id (with optional user constraint).
     */
    public static function findByRefOrFail(string|int $ref, ?int $userId = null): self
    {
        $query = static::where(function ($q) use ($ref) {
            $q->where('order_number', $ref);
            if (is_numeric($ref)) {
                $q->orWhere('id', (int) $ref);
            }
        });

        if ($userId !== null) {
            $query->where('user_id', $userId);
        }

        return $query->firstOrFail();
    }
}
