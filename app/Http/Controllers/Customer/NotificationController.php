<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Display customer notification center.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $query = $user->notifications();

        // Status filter
        $status = $request->query('status', 'all');
        if ($status === 'unread') {
            $query->whereNull('read_at');
        } elseif ($status === 'read') {
            $query->whereNotNull('read_at');
        }

        // Type filter
        $type = $request->query('type');
        if (!empty($type) && $type !== 'all') {
            $query->where('data->type', $type);
        }

        $notifications = $query->paginate(20)->withQueryString()->through(function ($n) {
            return [
                'id' => $n->id,
                'title' => $n->data['title'] ?? 'Notification',
                'message' => $n->data['message'] ?? '',
                'link' => $n->data['link'] ?? '#',
                'type' => $n->data['type'] ?? 'system',
                'icon' => $n->data['icon'] ?? 'bell',
                'badge' => $n->data['badge'] ?? null,
                'metadata' => $n->data['metadata'] ?? [],
                'read_at' => $n->read_at?->toISOString(),
                'is_read' => $n->read_at !== null,
                'time_ago' => $n->created_at?->diffForHumans(),
                'created_at_formatted' => $n->created_at?->format('M d, Y h:i A'),
            ];
        });

        $unreadCount = $user->unreadNotifications()->count();
        $totalCount = $user->notifications()->count();

        $typeCounts = [
            'all' => $totalCount,
            'unread' => $unreadCount,
            'order' => $user->notifications()->where('data->type', 'order')->count(),
            'subscription' => $user->notifications()->where('data->type', 'subscription')->count(),
            'payment' => $user->notifications()->where('data->type', 'payment')->count(),
        ];

        return Inertia::render('customer/notifications/index', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
            'typeCounts' => $typeCounts,
            'filters' => [
                'status' => $status,
                'type' => $type ?: 'all',
            ],
        ]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, string $id): JsonResponse|RedirectResponse
    {
        $user = Auth::user();
        $notification = $user->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->markAsRead();
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'unread_count' => $user->unreadNotifications()->count(),
            ]);
        }

        return back()->with('success', 'Notification marked as read.');
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse|RedirectResponse
    {
        $user = Auth::user();
        $user->unreadNotifications->markAsRead();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'unread_count' => 0,
            ]);
        }

        return back()->with('success', 'All notifications marked as read.');
    }

    /**
     * Delete a single notification.
     */
    public function destroy(Request $request, string $id): JsonResponse|RedirectResponse
    {
        $user = Auth::user();
        $notification = $user->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->delete();
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'unread_count' => $user->unreadNotifications()->count(),
            ]);
        }

        return back()->with('success', 'Notification removed.');
    }
}
