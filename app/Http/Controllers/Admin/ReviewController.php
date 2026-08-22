<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    /**
     * Display listing of client reviews.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search', '');
        $source = $request->query('source', 'all');

        $reviews = Review::when($search, function ($q) use ($search) {
                $q->where('author_name', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('review_title', 'like', "%{$search}%")
                  ->orWhere('review_text', 'like', "%{$search}%");
            })
            ->when($source !== 'all' && !empty($source), function ($q) use ($source) {
                $q->where('source', $source);
            })
            ->orderBy('rating', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/reviews/index', [
            'reviews' => $reviews,
            'filters' => [
                'search' => $search,
                'source' => $source,
            ],
        ]);
    }

    /**
     * Show form for creating a new review.
     */
    public function create(): Response
    {
        return Inertia::render('admin/reviews/form', [
            'review' => null,
        ]);
    }

    /**
     * Store a newly created review.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'author_name' => 'required|string|max:255',
            'author_role' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'review_title' => 'required|string|max:255',
            'review_text' => 'required|string|max:2000',
            'source' => 'required|in:trustpilot,clutch,direct',
            'review_date' => 'nullable|date',
            'verified_purchase' => 'boolean',
            'is_featured' => 'boolean',
            'author_avatar' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('author_avatar')) {
            $path = $request->file('author_avatar')->store('reviews', 'public');
            $validated['author_avatar'] = '/storage/' . $path;
        }

        Review::create($validated);

        return redirect()->route('admin.reviews.index')
            ->with('success', 'Review added successfully.');
    }

    /**
     * Show form for editing a review.
     */
    public function edit(Review $review): Response
    {
        return Inertia::render('admin/reviews/form', [
            'review' => $review,
        ]);
    }

    /**
     * Update the specified review.
     */
    public function update(Request $request, Review $review): RedirectResponse
    {
        $validated = $request->validate([
            'author_name' => 'required|string|max:255',
            'author_role' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'review_title' => 'required|string|max:255',
            'review_text' => 'required|string|max:2000',
            'source' => 'required|in:trustpilot,clutch,direct',
            'review_date' => 'nullable|date',
            'verified_purchase' => 'boolean',
            'is_featured' => 'boolean',
            'author_avatar' => 'nullable',
        ]);

        if ($request->hasFile('author_avatar')) {
            $path = $request->file('author_avatar')->store('reviews', 'public');
            $validated['author_avatar'] = '/storage/' . $path;
        } else {
            unset($validated['author_avatar']);
        }

        $review->update($validated);

        return redirect()->route('admin.reviews.index')
            ->with('success', 'Review updated successfully.');
    }

    /**
     * Remove the specified review.
     */
    public function destroy(Review $review): RedirectResponse
    {
        $review->delete();

        return back()->with('success', 'Review deleted successfully.');
    }
}
