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
        'package_tier',
        'billing_cycle',
        'amount',
        'currency',
        'exchange_rate_to_bdt',
        'status',
        'payment_method',
        'sender_number',
        'client_whatsapp',
        'client_email',
        'transaction_id',
        'payment_notes',
        'requested_domain',
        'requested_subdomain',
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
        'exchange_rate_to_bdt' => 'float',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'approved_at' => 'datetime',
        'last_renewed_at' => 'datetime',
    ];

    protected $appends = [
        'effective_exchange_rate',
        'days_remaining',
        'is_active_now',
        'is_expired_now',
        'status_badge',
        'requested_domain_display',
        'requested_subdomain_display',
        'has_pending_invoice',
        'pending_invoices_count',
        'pending_invoice',
    ];

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

    public function getHasPendingInvoiceAttribute(): bool
    {
        if ($this->relationLoaded('invoices')) {
            return $this->invoices->contains('status', 'pending');
        }
        return false;
    }

    public function getPendingInvoicesCountAttribute(): int
    {
        if ($this->relationLoaded('invoices')) {
            return $this->invoices->where('status', 'pending')->count();
        }
        return 0;
    }

    public function getPendingInvoiceAttribute(): ?SubscriptionInvoice
    {
        if ($this->relationLoaded('invoices')) {
            return $this->invoices->firstWhere('status', 'pending');
        }
        return null;
    }

    public function getRequestedDomainDisplayAttribute(): ?string
    {
        return $this->requested_domain ?: $this->domain;
    }

    public function getRequestedSubdomainDisplayAttribute(): ?string
    {
        return $this->requested_subdomain ?: $this->subdomain;
    }

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

    /**
     * Compute new extended expiry date taking current expiry into account.
     */
    public function calculateExtendedExpiryDate(string $cycle): Carbon
    {
        $baseDate = ($this->status === 'active' && $this->expires_at && $this->expires_at->isFuture())
            ? $this->expires_at->copy()
            : Carbon::now();

        return static::calculateExpiryDate($baseDate, $cycle);
    }
}
