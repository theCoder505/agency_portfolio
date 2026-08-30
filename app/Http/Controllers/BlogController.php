<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    /**
     * Display the Public Blog & Insights Page.
     */
    public function index(Request $request): Response
    {
        $blogs = Blog::with('category')
            ->where('is_published', true)
            ->orderBy('is_featured', 'desc')
            ->orderBy('order')
            ->orderBy('published_at', 'desc')
            ->get();

        // Spotlight featured blog
        $featuredBlog = Blog::with('category')
            ->where('is_published', true)
            ->where('is_featured', true)
            ->orderBy('order')
            ->orderBy('published_at', 'desc')
            ->first();

        // Categories with published blog counts
        $categories = Category::where('is_active', true)
            ->withCount(['blogs' => function ($q) {
                $q->where('is_published', true);
            }])
            ->orderBy('order')
            ->get(['id', 'name', 'slug', 'blogs_count']);

        return Inertia::render('surface/blogs/index', [
            'blogs' => $blogs,
            'featuredBlog' => $featuredBlog,
            'categories' => $categories,
        ]);
    }

    /**
     * Display a Single Blog Article.
     */
    public function show(string $slug): Response
    {
        $blog = Blog::with('category')
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        // Increment reads count directly
        $blog->increment('reads_count');

        // Fetch related articles
        $relatedBlogs = Blog::with('category')
            ->where('id', '!=', $blog->id)
            ->where('is_published', true)
            ->when($blog->category_id, function ($q) use ($blog) {
                $q->where('category_id', $blog->category_id);
            })
            ->orderBy('published_at', 'desc')
            ->take(3)
            ->get();

        return Inertia::render('surface/blogs/show', [
            'blog' => $blog,
            'relatedBlogs' => $relatedBlogs,
        ]);
    }
}
