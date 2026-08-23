<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    /**
     * Display a listing of blog articles for admin.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search', '');
        $categoryId = $request->query('category_id', 'all');
        $status = $request->query('status', 'all');
        $fromDate = $request->query('from_date');
        $toDate = $request->query('to_date');

        $query = Blog::with('category');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%")
                  ->orWhere('author_name', 'like', "%{$search}%");
            });
        }

        if ($categoryId !== 'all' && !empty($categoryId)) {
            $query->where('category_id', $categoryId);
        }

        if ($status === 'published') {
            $query->where('is_published', true);
        } elseif ($status === 'draft') {
            $query->where('is_published', false);
        } elseif ($status === 'featured') {
            $query->where('is_featured', true);
        }

        if ($fromDate && $toDate) {
            $query->whereBetween('created_at', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59']);
        }

        $blogs = $query->orderBy('is_featured', 'desc')
            ->orderBy('order')
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $categories = Category::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/blogs/index', [
            'blogs' => $blogs,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
                'status' => $status,
                'from_date' => $fromDate,
                'to_date' => $toDate,
            ],
        ]);
    }

    /**
     * Show the form for creating a new blog article.
     */
    public function create(): Response
    {
        $categories = Category::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/blogs/form', [
            'blog' => null,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created blog article.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blogs,slug',
            'short_description' => 'nullable|string|max:600',
            'content' => 'nullable|string',
            'author_name' => 'nullable|string|max:150',
            'author_role' => 'nullable|string|max:150',
            'author_avatar' => 'nullable|string|max:500',
            'tags' => 'nullable|array',
            'reads_count' => 'nullable|integer|min:0',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
            'order' => 'nullable|integer',
            'thumbnail' => 'nullable|image|max:10240', // 10MB
            'thumbnail_url' => 'nullable|string|max:500',
        ]);

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = '/storage/' . $request->file('thumbnail')->store('blogs', 'public');
        } elseif (!empty($validated['thumbnail_url'])) {
            $thumbnailPath = $validated['thumbnail_url'];
        }

        $slug = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['title']);

        Blog::create([
            'category_id' => $validated['category_id'] ?? null,
            'title' => $validated['title'],
            'slug' => $slug,
            'short_description' => $validated['short_description'] ?? null,
            'content' => $validated['content'] ?? '',
            'thumbnail' => $thumbnailPath,
            'author_name' => $validated['author_name'] ?? 'CodeVenture Editorial Team',
            'author_role' => $validated['author_role'] ?? 'Lead Architect',
            'author_avatar' => $validated['author_avatar'] ?? null,
            'tags' => $validated['tags'] ?? [],
            'reads_count' => $validated['reads_count'] ?? 0,
            'is_featured' => $request->boolean('is_featured'),
            'is_published' => $request->boolean('is_published', true),
            'published_at' => $request->boolean('is_published', true) ? now() : null,
            'order' => $validated['order'] ?? 0,
        ]);

        return redirect()->route('admin.blogs.index')->with('success', 'Blog article created successfully.');
    }

    /**
     * Show the form for editing the specified blog article.
     */
    public function edit(Blog $blog): Response
    {
        $categories = Category::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/blogs/form', [
            'blog' => $blog,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified blog article.
     */
    public function update(Request $request, Blog $blog): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blogs,slug,' . $blog->id,
            'short_description' => 'nullable|string|max:600',
            'content' => 'nullable|string',
            'author_name' => 'nullable|string|max:150',
            'author_role' => 'nullable|string|max:150',
            'author_avatar' => 'nullable|string|max:500',
            'tags' => 'nullable|array',
            'reads_count' => 'nullable|integer|min:0',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
            'order' => 'nullable|integer',
            'thumbnail' => 'nullable|image|max:10240',
            'existing_thumbnail' => 'nullable|string',
        ]);

        $thumbnailPath = $blog->thumbnail;

        if ($request->hasFile('thumbnail')) {
            // Delete old file if local
            if ($blog->thumbnail && str_starts_with($blog->thumbnail, '/storage/')) {
                $relative = str_replace('/storage/', '', $blog->thumbnail);
                Storage::disk('public')->delete($relative);
            }
            $thumbnailPath = '/storage/' . $request->file('thumbnail')->store('blogs', 'public');
        } elseif ($request->filled('existing_thumbnail')) {
            $thumbnailPath = $request->input('existing_thumbnail');
        } elseif ($request->has('remove_thumbnail') && $request->boolean('remove_thumbnail')) {
            if ($blog->thumbnail && str_starts_with($blog->thumbnail, '/storage/')) {
                $relative = str_replace('/storage/', '', $blog->thumbnail);
                Storage::disk('public')->delete($relative);
            }
            $thumbnailPath = null;
        }

        $slug = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['title']);

        $blog->update([
            'category_id' => $validated['category_id'] ?? null,
            'title' => $validated['title'],
            'slug' => $slug,
            'short_description' => $validated['short_description'] ?? null,
            'content' => $validated['content'] ?? '',
            'thumbnail' => $thumbnailPath,
            'author_name' => $validated['author_name'] ?? $blog->author_name,
            'author_role' => $validated['author_role'] ?? $blog->author_role,
            'author_avatar' => $validated['author_avatar'] ?? $blog->author_avatar,
            'tags' => $validated['tags'] ?? [],
            'reads_count' => $validated['reads_count'] ?? $blog->reads_count,
            'is_featured' => $request->boolean('is_featured'),
            'is_published' => $request->boolean('is_published'),
            'order' => $validated['order'] ?? 0,
        ]);

        return redirect()->route('admin.blogs.index')->with('success', 'Blog article updated successfully.');
    }

    /**
     * Remove the specified blog article.
     */
    public function destroy(Blog $blog): RedirectResponse
    {
        if ($blog->thumbnail && str_starts_with($blog->thumbnail, '/storage/')) {
            $relative = str_replace('/storage/', '', $blog->thumbnail);
            Storage::disk('public')->delete($relative);
        }

        $blog->delete();

        return redirect()->route('admin.blogs.index')->with('success', 'Blog article deleted successfully.');
    }

    /**
     * Bulk delete selected blog articles.
     */
    public function bulkDelete(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:blogs,id',
        ]);

        $blogs = Blog::whereIn('id', $validated['ids'])->get();

        foreach ($blogs as $blog) {
            if ($blog->thumbnail && str_starts_with($blog->thumbnail, '/storage/')) {
                $relative = str_replace('/storage/', '', $blog->thumbnail);
                Storage::disk('public')->delete($relative);
            }
            $blog->delete();
        }

        return redirect()->route('admin.blogs.index')->with('success', count($validated['ids']) . ' blog articles deleted successfully.');
    }
}
