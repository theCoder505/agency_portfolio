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
        'thumbnail',
        'gallery_images',
        'packages',
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
        'thumbnail' => 'string',
        'gallery_images' => 'array',
        'packages' => 'array',
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
     * Accessor to ensure structured package tiers are always present.
     */
    public function getPackagesAttribute($value)
    {
        $decoded = is_string($value) ? json_decode($value, true) : $value;

        if (is_array($decoded) && isset($decoded['basic'], $decoded['standard'], $decoded['premium'])) {
            return $decoded;
        }

        // Generate intelligent defaults from base attributes if packages not explicitly configured
        $baseMonthly = (float) ($this->monthly_price > 0 ? $this->monthly_price : 2999);
        $baseYearly = (float) ($this->yearly_price > 0 ? $this->yearly_price : ($baseMonthly * 10));
        $baseFeatures = is_array($this->features) && count($this->features) > 0 ? $this->features : [
            'Core module access and dashboard',
            'Subdomain SSL certificate (.codeventure.app)',
            'Standard automated weekly backup',
        ];

        return [
            'basic' => [
                'name' => 'Basic Tier',
                'tagline' => 'Essential features for startups and individual professionals',
                'monthly_price' => round($baseMonthly * 0.7),
                'yearly_price' => round($baseYearly * 0.7),
                'badge' => 'Starter',
                'is_popular' => false,
                'features' => array_slice($baseFeatures, 0, 3),
            ],
            'standard' => [
                'name' => 'Standard Tier',
                'tagline' => 'Most popular choice for growing commercial teams',
                'monthly_price' => $baseMonthly,
                'yearly_price' => $baseYearly,
                'badge' => 'Most Popular',
                'is_popular' => true,
                'features' => count($baseFeatures) > 4 ? array_slice($baseFeatures, 0, 5) : $baseFeatures,
            ],
            'premium' => [
                'name' => 'Premium Tier',
                'tagline' => 'Full enterprise power with priority 24/7 dedicated support',
                'monthly_price' => round($baseMonthly * 1.6),
                'yearly_price' => round($baseYearly * 1.6),
                'badge' => 'Enterprise',
                'is_popular' => false,
                'features' => array_merge($baseFeatures, [
                    'Dedicated Account Engineer & SLA guarantee',
                    'Custom domain integration with auto-renew SSL',
                    'Unlimited multi-tenant user access',
                ]),
            ],
        ];
    }

    /**
     * Get price for a specific billing cycle and package tier.
     */
    public function getPriceForCycle(string $cycle, string $tier = 'standard'): float
    {
        $packages = $this->packages;
        $tierKey = strtolower($tier);

        if (isset($packages[$tierKey])) {
            $selectedTier = $packages[$tierKey];
            $monthly = (float) ($selectedTier['monthly_price'] ?? $this->monthly_price);
            $yearly = (float) ($selectedTier['yearly_price'] ?? ($monthly * 10));

            return match ($cycle) {
                'half_yearly' => round($monthly * 5.5),
                'yearly' => $yearly,
                default => $monthly,
            };
        }

        return match ($cycle) {
            'half_yearly' => (float) ($this->half_yearly_price > 0 ? $this->half_yearly_price : ($this->monthly_price * 5.5)),
            'yearly' => (float) ($this->yearly_price > 0 ? $this->yearly_price : ($this->monthly_price * 10)),
            default => (float) $this->monthly_price,
        };
    }
}
