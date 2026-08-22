<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Portfolio extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'title',
        'slug',
        'short_description',
        'description',
        'thumbnail',
        'gallery_images',
        'item_type',
        'direct_url',
        'youtube_video_url',
        'client_name',
        'completion_date',
        'tech_stacks',
        'views_count',
        'is_featured',
        'order',
        'is_active',
    ];

    protected $casts = [
        'gallery_images' => 'array',
        'tech_stacks' => 'array',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'views_count' => 'integer',
        'order' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function visitorLogs()
    {
        return $this->hasMany(VisitorLog::class);
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($portfolio) {
            if (empty($portfolio->slug)) {
                $portfolio->slug = Str::slug($portfolio->title);
            }
        });
    }
}
