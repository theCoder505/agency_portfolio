<?php

namespace App\Mail;

use App\Models\CustomOrder;
use App\Models\CustomOrderMilestone;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MilestoneCollectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public CustomOrder $order;
    public CustomOrderMilestone $milestone;

    public function __construct(CustomOrder $order, CustomOrderMilestone $milestone)
    {
        $this->order = $order;
        $this->milestone = $milestone;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "✅ Milestone Payment Collected & Confirmed: {$this->milestone->title} (#{$this->order->order_number})",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.milestone_collected',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
