<?php

namespace App\Mail;

use App\Models\CustomOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomOrderRequestedMail extends Mailable
{
    use Queueable, SerializesModels;

    public CustomOrder $order;

    public function __construct(CustomOrder $order)
    {
        $this->order = $order;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "🚀 New Custom Project Request: {$this->order->title} (#{$this->order->order_number})",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.custom_order_requested',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
