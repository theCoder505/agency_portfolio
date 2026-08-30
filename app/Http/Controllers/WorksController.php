<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Portfolio;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorksController extends Controller
{
    /**
     * Display the Dedicated Works / Portfolio Page.
     */
    public function index(Request $request): Response
    {
        $portfolios = Portfolio::with('category')
            ->where('is_active', true)
            ->orderBy('is_featured', 'desc')
            ->orderBy('order')
            ->orderBy('created_at', 'desc')
            ->get();

        $categories = Category::where('is_active', true)
            ->withCount(['portfolios' => function ($q) {
                $q->where('is_active', true);
            }])
            ->orderBy('order')
            ->get(['id', 'name', 'slug', 'portfolios_count']);

        return Inertia::render('surface/works/index', [
            'portfolios' => $portfolios,
            'categories' => $categories,
        ]);
    }

    /**
     * Display In-App Project Details Page.
     */
    public function show(string $slug): Response
    {
        $portfolio = Portfolio::with('category')
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        // Increment visit count (handled also in TrackVisitor, ensure direct increment)
        $portfolio->increment('views_count');

        $relatedPortfolios = Portfolio::with('category')
            ->where('id', '!=', $portfolio->id)
            ->where('is_active', true)
            ->when($portfolio->category_id, function ($q) use ($portfolio) {
                $q->where('category_id', $portfolio->category_id);
            })
            ->take(3)
            ->get();

        return Inertia::render('surface/works/show', [
            'portfolio' => $portfolio,
            'relatedPortfolios' => $relatedPortfolios,
        ]);
    }
}
