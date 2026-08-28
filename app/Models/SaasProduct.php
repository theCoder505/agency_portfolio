<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class SaasProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'tagline',
        'description',
        'icon',
        'badge',
        'monthly_price',
        'half_yearly_price',
        'yearly_price',
        'has_monthly',
        'has_half_yearly',
        'has_yearly',
        'features',
        'order',
        'is_featured',
        'is_active',
    ];

    protected $casts = [
        'monthly_price' => 'float',
        'half_yearly_price' => 'float',
        'yearly_price' => 'float',
        'has_monthly' => 'boolean',
        'has_half_yearly' => 'boolean',
        'has_yearly' => 'boolean',
        'features' => 'array',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(SaasSubscription::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Get price for a specific billing cycle.
     */
    public function getPriceForCycle(string $cycle): float
    {
        return match ($cycle) {
            'half_yearly' => (float) $this->half_yearly_price,
            'yearly' => (float) $this->yearly_price,
            default => (float) $this->monthly_price,
        };
    }
}
