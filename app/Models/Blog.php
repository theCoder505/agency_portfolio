<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Blog extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'title',
        'slug',
        'short_description',
        'content',
        'thumbnail',
        'author_name',
        'author_role',
        'author_avatar',
        'tags',
        'reads_count',
        'is_featured',
        'is_published',
        'published_at',
        'order',
    ];

    protected $casts = [
        'tags' => 'array',
        'reads_count' => 'integer',
        'is_featured' => 'boolean',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
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

    /**
     * Scope for published blog posts.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope for featured blog posts.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($blog) {
            if (empty($blog->slug)) {
                $blog->slug = Str::slug($blog->title);
            }
            if (empty($blog->published_at) && $blog->is_published) {
                $blog->published_at = now();
            }
        });

        static::updating(function ($blog) {
            if (empty($blog->slug)) {
                $blog->slug = Str::slug($blog->title);
            }
            if (empty($blog->published_at) && $blog->is_published) {
                $blog->published_at = now();
            }
        });
    }
}
