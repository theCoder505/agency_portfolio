<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
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
}
