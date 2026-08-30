<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VisitorLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VisitorLogController extends Controller
{
    /**
     * Display listing of visitor logs.
     */
    public function index(Request $request): Response
    {
        $logs = VisitorLog::with('portfolio')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/visitor-logs/index', [
            'logs' => $logs,
        ]);
    }

    /**
     * Remove the specified visitor log.
     */
    public function destroy(VisitorLog $visitorLog): RedirectResponse
    {
        $visitorLog->delete();

        return back()->with('success', 'Visitor log entry deleted.');
    }

    /**
     * Bulk delete visitor logs.
     */
    public function bulkDelete(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:visitor_logs,id',
        ]);

        VisitorLog::whereIn('id', $request->ids)->delete();

        return back()->with('success', count($request->ids) . ' visitor logs deleted successfully.');
    }

    /**
     * Clear all visitor logs.
     */
    public function clearAll(): RedirectResponse
    {
        VisitorLog::truncate();

        return back()->with('success', 'All visitor logs cleared.');
    }
}
