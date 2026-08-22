<?php

namespace App\Http\Controllers;

use App\Models\TeamMember;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    /**
     * Display About Us and Team Page.
     */
    public function index(): Response
    {
        $teamMembers = TeamMember::where('is_active', true)
            ->orderBy('order')
            ->get();

        return Inertia::render('surface/about', [
            'teamMembers' => $teamMembers,
        ]);
    }
}
