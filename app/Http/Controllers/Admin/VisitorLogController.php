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
        $search = $request->query('search', '');
        $device = $request->query('device', 'all');
        $browser = $request->query('browser', 'all');
        $fromDate = $request->query('from_date');
        $toDate = $request->query('to_date');

        $query = VisitorLog::with('portfolio');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('ip_address', 'like', "%{$search}%")
                  ->orWhere('url', 'like', "%{$search}%")
                  ->orWhere('referer', 'like', "%{$search}%");
            });
        }

        if ($device !== 'all' && !empty($device)) {
            $query->where('device_type', $device);
        }

        if ($browser !== 'all' && !empty($browser)) {
            $query->where('browser', $browser);
        }

        if ($fromDate && $toDate) {
            $query->whereBetween('created_at', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59']);
        }

        $logs = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/visitor-logs/index', [
            'logs' => $logs,
            'filters' => [
                'search' => $search,
                'device' => $device,
                'browser' => $browser,
                'from_date' => $fromDate,
                'to_date' => $toDate,
            ],
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
