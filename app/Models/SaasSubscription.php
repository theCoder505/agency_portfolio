<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class SaasSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'saas_product_id',
        'billing_cycle',
        'amount',
        'currency',
        'status',
        'payment_method',
        'sender_number',
        'transaction_id',
        'payment_notes',
        'domain',
        'subdomain',
        'admin_notes',
        'starts_at',
        'expires_at',
        'approved_at',
        'approved_by',
        'rejection_reason',
        'last_renewed_at',
    ];

    protected $casts = [
        'amount' => 'float',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'approved_at' => 'datetime',
        'last_renewed_at' => 'datetime',
    ];

    protected $appends = [
        'days_remaining',
        'is_active_now',
        'is_expired_now',
        'status_badge',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($subscription) {
            if (empty($subscription->order_number)) {
                $subscription->order_number = 'ORD-' . strtoupper(Str::random(4)) . '-' . rand(1000, 9999);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(SaasProduct::class, 'saas_product_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'approved_by');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(SubscriptionInvoice::class, 'subscription_id')->orderBy('created_at', 'desc');
    }

    /**
     * Compute days remaining until deadline.
     */
    public function getDaysRemainingAttribute(): int
    {
        if ($this->status !== 'active' || !$this->expires_at) {
            return 0;
        }

        $now = Carbon::now();
        if ($now->greaterThan($this->expires_at)) {
            return 0;
        }

        return (int) $now->diffInDays($this->expires_at, false) + 1;
    }

    public function getIsActiveNowAttribute(): bool
    {
        if ($this->status !== 'active' || !$this->expires_at) {
            return false;
        }

        return Carbon::now()->lessThanOrEqualTo($this->expires_at);
    }

    public function getIsExpiredNowAttribute(): bool
    {
        if ($this->status === 'expired') {
            return true;
        }

        if ($this->status === 'active' && $this->expires_at && Carbon::now()->greaterThan($this->expires_at)) {
            return true;
        }

        return false;
    }

    public function getStatusBadgeAttribute(): array
    {
        if ($this->status === 'pending') {
            return ['label' => 'Pending Verification', 'color' => 'amber'];
        }

        if ($this->is_expired_now) {
            return ['label' => 'Expired / Renewal Due', 'color' => 'rose'];
        }

        if ($this->status === 'active') {
            return ['label' => 'Active Package', 'color' => 'emerald'];
        }

        if ($this->status === 'rejected') {
            return ['label' => 'Payment Rejected', 'color' => 'red'];
        }

        return ['label' => ucfirst($this->status), 'color' => 'slate'];
    }

    /**
     * Calculate expiry date from a given start date and billing cycle.
     */
    public static function calculateExpiryDate(Carbon $startDate, string $cycle): Carbon
    {
        return match ($cycle) {
            'half_yearly' => $startDate->copy()->addMonths(6),
            'yearly' => $startDate->copy()->addYears(1),
            default => $startDate->copy()->addMonth(),
        };
    }
}
