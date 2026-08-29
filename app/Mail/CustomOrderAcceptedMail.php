<?php

namespace App\Mail;

use App\Models\CustomOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomOrderAcceptedMail extends Mailable
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
            subject: "🎉 Great news! Your custom project proposal was accepted! (#{$this->order->order_number})",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.custom_order_accepted',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
