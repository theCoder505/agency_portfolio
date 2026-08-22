<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Portfolio;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    /**
     * Display a listing of portfolio products/projects.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search', '');
        $categoryId = $request->query('category_id', 'all');
        $itemType = $request->query('item_type', 'all');
        $fromDate = $request->query('from_date');
        $toDate = $request->query('to_date');

        $query = Portfolio::with('category');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('client_name', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        if ($categoryId !== 'all' && !empty($categoryId)) {
            $query->where('category_id', $categoryId);
        }

        if ($itemType !== 'all' && !empty($itemType)) {
            $query->where('item_type', $itemType);
        }

        if ($fromDate && $toDate) {
            $query->whereBetween('created_at', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59']);
        }

        $portfolios = $query->orderBy('is_featured', 'desc')
            ->orderBy('order')
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $categories = Category::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/portfolios/index', [
            'portfolios' => $portfolios,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
                'item_type' => $itemType,
                'from_date' => $fromDate,
                'to_date' => $toDate,
            ],
        ]);
    }

    /**
     * Show the form for creating a new portfolio project.
     */
    public function create(): Response
    {
        $categories = Category::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/portfolios/form', [
            'portfolio' => null,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created portfolio project.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:portfolios,slug',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'item_type' => 'required|in:direct_link,in_app_link',
            'direct_url' => 'nullable|url|max:500',
            'youtube_video_url' => 'nullable|string|max:500',
            'client_name' => 'nullable|string|max:255',
            'completion_date' => 'nullable|string|max:100',
            'tech_stacks' => 'nullable|array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'order' => 'nullable|integer',
            'thumbnail' => 'nullable|image|max:10240', // 10MB max
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'image|max:10240',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Handle single thumbnail upload
        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('portfolios/thumbnails', 'public');
            $validated['thumbnail'] = '/storage/' . $path;
        }

        // Handle masonry gallery images upload
        $galleryPaths = [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $image) {
                $path = $image->store('portfolios/galleries', 'public');
                $galleryPaths[] = '/storage/' . $path;
            }
        }
        $validated['gallery_images'] = $galleryPaths;

        Portfolio::create($validated);

        return redirect()->route('admin.portfolios.index')
            ->with('success', 'Project created successfully.');
    }

    /**
     * Show the form for editing the specified portfolio project.
     */
    public function edit(Portfolio $portfolio): Response
    {
        $categories = Category::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/portfolios/form', [
            'portfolio' => $portfolio->load('category'),
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified portfolio project.
     */
    public function update(Request $request, Portfolio $portfolio): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:portfolios,slug,' . $portfolio->id,
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'item_type' => 'required|in:direct_link,in_app_link',
            'direct_url' => 'nullable|url|max:500',
            'youtube_video_url' => 'nullable|string|max:500',
            'client_name' => 'nullable|string|max:255',
            'completion_date' => 'nullable|string|max:100',
            'tech_stacks' => 'nullable|array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'order' => 'nullable|integer',
            'thumbnail' => 'nullable', // can be uploaded file or string of existing
            'gallery_images' => 'nullable|array',
            'existing_gallery' => 'nullable|array',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Handle thumbnail replacement if new file provided
        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('portfolios/thumbnails', 'public');
            $validated['thumbnail'] = '/storage/' . $path;
        } else {
            unset($validated['thumbnail']);
        }

        // Handle gallery images
        $galleryImages = $request->input('existing_gallery', []);
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $image) {
                $path = $image->store('portfolios/galleries', 'public');
                $galleryImages[] = '/storage/' . $path;
            }
        }
        $validated['gallery_images'] = array_values($galleryImages);
        unset($validated['existing_gallery']);

        $portfolio->update($validated);

        return redirect()->route('admin.portfolios.index')
            ->with('success', 'Project updated successfully.');
    }

    /**
     * Remove the specified portfolio project.
     */
    public function destroy(Portfolio $portfolio): RedirectResponse
    {
        $portfolio->delete();

        return back()->with('success', 'Project deleted successfully.');
    }

    /**
     * Bulk delete portfolio items.
     */
    public function bulkDelete(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:portfolios,id',
        ]);

        Portfolio::whereIn('id', $request->ids)->delete();

        return back()->with('success', count($request->ids) . ' projects deleted successfully.');
    }
}
