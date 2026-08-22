<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use App\Models\Category;
use App\Models\Portfolio;
use App\Models\Review;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the Agency Landing Page.
     */
    public function index(): Response
    {
        $categories = Category::where('is_active', true)
            ->orderBy('order')
            ->get(['id', 'name', 'slug']);

        // Landing page max 15 items (3x5 grid on lg screen)
        $portfolios = Portfolio::with('category')
            ->where('is_active', true)
            ->orderBy('is_featured', 'desc')
            ->orderBy('order')
            ->orderBy('created_at', 'desc')
            ->take(15)
            ->get();

        $reviews = Review::where('is_featured', true)
            ->orderBy('rating', 'desc')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        $teamMembers = TeamMember::where('is_active', true)
            ->orderBy('order')
            ->take(6)
            ->get();

        $stats = [
            'projects_delivered' => Portfolio::count(),
            'client_satisfaction' => '99.4%',
            'trustpilot_score' => AppSetting::get('trustpilot_score', '4.9'),
            'total_reviews' => AppSetting::get('trustpilot_reviews_count', '140+'),
            'years_experience' => '8+',
        ];

        return Inertia::render('surface/home', [
            'categories' => $categories,
            'portfolios' => $portfolios,
            'reviews' => $reviews,
            'teamMembers' => $teamMembers,
            'stats' => $stats,
        ]);
    }
}
