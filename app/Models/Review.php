<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'custom_order_id',
        'author_name',
        'author_avatar',
        'author_role',
        'company',
        'rating',
        'review_title',
        'review_text',
        'source',
        'review_date',
        'verified_purchase',
        'is_featured',
    ];

    protected $casts = [
        'rating' => 'integer',
        'verified_purchase' => 'boolean',
        'is_featured' => 'boolean',
        'review_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function customOrder(): BelongsTo
    {
        return $this->belongsTo(CustomOrder::class, 'custom_order_id');
    }
}
