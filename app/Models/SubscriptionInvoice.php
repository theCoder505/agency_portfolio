<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class SubscriptionInvoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'subscription_id',
        'user_id',
        'billing_cycle',
        'amount',
        'currency',
        'exchange_rate_to_bdt',
        'payment_method',
        'sender_number',
        'transaction_id',
        'type',
        'status',
        'period_start',
        'period_end',
        'paid_at',
        'notes',
        'rejection_reason',
    ];

    protected $casts = [
        'amount' => 'float',
        'exchange_rate_to_bdt' => 'float',
        'period_start' => 'date',
        'period_end' => 'date',
        'paid_at' => 'datetime',
    ];

    protected $appends = [
        'effective_exchange_rate',
    ];

    public function getEffectiveExchangeRateAttribute(): float
    {
        if ($this->currency === 'BDT') {
            return 1.0;
        }
        if ($this->exchange_rate_to_bdt && $this->exchange_rate_to_bdt > 0) {
            return (float) $this->exchange_rate_to_bdt;
        }
        if ($this->relationLoaded('subscription') && $this->subscription) {
            $subRate = $this->subscription->exchange_rate_to_bdt;
            if ($subRate && $subRate > 0) {
                return (float) $subRate;
            }
        }
        return ($this->currency === 'EUR') ? 130.0 : 120.0;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($invoice) {
            if (empty($invoice->invoice_number)) {
                $invoice->invoice_number = 'INV-' . date('Y') . '-' . strtoupper(Str::random(4)) . rand(100, 999);
            }
        });
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(SaasSubscription::class, 'subscription_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
