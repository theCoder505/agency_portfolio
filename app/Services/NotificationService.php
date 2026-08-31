<?php

namespace App\Services;

use App\Models\Admin;
use App\Models\User;
use App\Notifications\AppNoticeNotification;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send a database notification to all administrators.
     */
    public static function sendToAdmin(
        string $title,
        string $message,
        string $link = '#',
        string $type = 'system',
        string $icon = 'bell',
        ?string $badge = null,
        array $metadata = []
    ): void {
        try {
            $admins = Admin::all();
            if ($admins->isNotEmpty()) {
                foreach ($admins as $admin) {
                    $admin->notify(new AppNoticeNotification(
                        $title,
                        $message,
                        $link,
                        $type,
                        $icon,
                        $badge,
                        $metadata
                    ));
                }
            }
        } catch (\Throwable $e) {
            Log::error('NotificationService::sendToAdmin error: ' . $e->getMessage());
        }
    }

    /**
     * Send a database notification to a specific user/customer.
     */
    public static function sendToUser(
        User|int|string|null $user,
        string $title,
        string $message,
        string $link = '#',
        string $type = 'system',
        string $icon = 'bell',
        ?string $badge = null,
        array $metadata = []
    ): void {
        if (!$user) {
            return;
        }

        try {
            $targetUser = null;
            if ($user instanceof User) {
                $targetUser = $user;
            } elseif (is_numeric($user)) {
                $targetUser = User::find((int) $user);
            } elseif (is_string($user)) {
                $targetUser = User::where('email', $user)->first();
            }

            if ($targetUser) {
                $targetUser->notify(new AppNoticeNotification(
                    $title,
                    $message,
                    $link,
                    $type,
                    $icon,
                    $badge,
                    $metadata
                ));
            }
        } catch (\Throwable $e) {
            Log::error('NotificationService::sendToUser error: ' . $e->getMessage());
        }
    }

    /**
     * Send corresponding notifications to both Admin and User in one call.
     */
    public static function sendBoth(
        User|int|string|null $user,
        string $adminTitle,
        string $adminMessage,
        string $adminLink,
        string $userTitle,
        string $userMessage,
        string $userLink,
        string $type = 'system',
        string $icon = 'bell',
        ?string $badge = null,
        array $metadata = []
    ): void {
        self::sendToAdmin($adminTitle, $adminMessage, $adminLink, $type, $icon, $badge, $metadata);
        if ($user) {
            self::sendToUser($user, $userTitle, $userMessage, $userLink, $type, $icon, $badge, $metadata);
        }
    }
}
