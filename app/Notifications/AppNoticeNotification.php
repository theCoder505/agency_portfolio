<?php

namespace App\Notifications;

use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AppNoticeNotification extends Notification
{
    use Queueable;

    public string $title;
    public string $message;
    public string $link;
    public string $type;
    public string $icon;
    public ?string $badge;
    public array $metadata;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        string $title,
        string $message,
        string $link = '#',
        string $type = 'system',
        string $icon = 'bell',
        ?string $badge = null,
        array $metadata = []
    ) {
        $this->title = $title;
        $this->message = $message;
        $this->link = $link;
        $this->type = $type;
        $this->icon = $icon;
        $this->badge = $badge;
        $this->metadata = $metadata;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'link' => $this->link,
            'type' => $this->type,
            'icon' => $this->icon,
            'badge' => $this->badge,
            'metadata' => $this->metadata,
            'timestamp' => Carbon::now()->toISOString(),
        ];
    }
}
