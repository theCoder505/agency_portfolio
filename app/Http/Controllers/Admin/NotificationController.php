<?php

namespace App\Http\Controllers\Admin;

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
     * Display a listing of admin notifications.
     */
    public function index(Request $request): Response
    {
        $admin = Auth::guard('admin')->user();
        
        $query = $admin->notifications();

        // Filter by status (all, unread, read)
        $status = $request->query('status', 'all');
        if ($status === 'unread') {
            $query->whereNull('read_at');
        } elseif ($status === 'read') {
            $query->whereNotNull('read_at');
        }

        // Filter by notification category type (orders, subscriptions, payments, contacts, reviews)
        $type = $request->query('type');
        if (!empty($type) && $type !== 'all') {
            $query->where('data->type', $type);
        }

        // Search in title and message
        $search = $request->query('search');
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('data->title', 'like', "%{$search}%")
                  ->orWhere('data->message', 'like', "%{$search}%");
            });
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

        $unreadCount = $admin->unreadNotifications()->count();
        $totalCount = $admin->notifications()->count();

        // Categorized counts for filter tabs
        $typeCounts = [
            'all' => $totalCount,
            'unread' => $unreadCount,
            'order' => $admin->notifications()->where('data->type', 'order')->count(),
            'subscription' => $admin->notifications()->where('data->type', 'subscription')->count(),
            'payment' => $admin->notifications()->where('data->type', 'payment')->count(),
            'contact' => $admin->notifications()->where('data->type', 'contact')->count(),
            'review' => $admin->notifications()->where('data->type', 'review')->count(),
        ];

        return Inertia::render('admin/notifications/index', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
            'typeCounts' => $typeCounts,
            'filters' => [
                'status' => $status,
                'type' => $type ?: 'all',
                'search' => $search ?: '',
            ],
        ]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, string $id): JsonResponse|RedirectResponse
    {
        $admin = Auth::guard('admin')->user();
        $notification = $admin->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->markAsRead();
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'unread_count' => $admin->unreadNotifications()->count(),
            ]);
        }

        return back()->with('success', 'Notification marked as read.');
    }

    /**
     * Mark all unread notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse|RedirectResponse
    {
        $admin = Auth::guard('admin')->user();
        $admin->unreadNotifications->markAsRead();

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
        $admin = Auth::guard('admin')->user();
        $notification = $admin->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->delete();
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'unread_count' => $admin->unreadNotifications()->count(),
            ]);
        }

        return back()->with('success', 'Notification deleted.');
    }

    /**
     * Delete all read notifications.
     */
    public function clearAllRead(): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();
        $admin->readNotifications()->delete();

        return back()->with('success', 'All read notifications have been cleared.');
    }
}
