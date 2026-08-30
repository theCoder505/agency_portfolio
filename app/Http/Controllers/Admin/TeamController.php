<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    /**
     * Display listing of team members.
     */
    public function index(Request $request): Response
    {
        $teamMembers = TeamMember::orderBy('order')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/team/index', [
            'teamMembers' => $teamMembers,
        ]);
    }

    /**
     * Show form for creating a new team member.
     */
    public function create(): Response
    {
        return Inertia::render('admin/team/form', [
            'member' => null,
        ]);
    }

    /**
     * Store a newly created team member.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'avatar' => 'nullable|image|max:5120',
            'social_linkedin' => 'nullable|url|max:255',
            'social_github' => 'nullable|url|max:255',
            'social_twitter' => 'nullable|url|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('team', 'public');
            $validated['avatar'] = '/storage/' . $path;
        }

        TeamMember::create($validated);

        return redirect()->route('admin.team.index')
            ->with('success', 'Team member added successfully.');
    }

    /**
     * Show form for editing the team member.
     */
    public function edit(TeamMember $team): Response
    {
        return Inertia::render('admin/team/form', [
            'member' => $team,
        ]);
    }

    /**
     * Update the team member.
     */
    public function update(Request $request, TeamMember $team): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'avatar' => 'nullable',
            'social_linkedin' => 'nullable|url|max:255',
            'social_github' => 'nullable|url|max:255',
            'social_twitter' => 'nullable|url|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('team', 'public');
            $validated['avatar'] = '/storage/' . $path;
        } else {
            unset($validated['avatar']);
        }

        $team->update($validated);

        return redirect()->route('admin.team.index')
            ->with('success', 'Team member updated successfully.');
    }

    /**
     * Remove the team member.
     */
    public function destroy(TeamMember $team): RedirectResponse
    {
        $team->delete();

        return back()->with('success', 'Team member deleted successfully.');
    }
}
