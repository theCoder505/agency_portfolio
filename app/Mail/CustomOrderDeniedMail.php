<?php

namespace App\Mail;

use App\Models\CustomOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomOrderDeniedMail extends Mailable
{
    use Queueable, SerializesModels;

    public CustomOrder $order;
    public string $reason;

    public function __construct(CustomOrder $order, string $reason = '')
    {
        $this->order = $order;
        $this->reason = $reason;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Update regarding your custom project request (#{$this->order->order_number})",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.custom_order_denied',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
