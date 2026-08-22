<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactReplyMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $recipientName;
    public string $replySubject;
    public string $replyMessage;
    public string $originalMessage;

    /**
     * Create a new message instance.
     */
    public function __construct(string $recipientName, string $replySubject, string $replyMessage, string $originalMessage = '')
    {
        $this->recipientName = $recipientName;
        $this->replySubject = $replySubject;
        $this->replyMessage = $replyMessage;
        $this->originalMessage = $originalMessage;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->replySubject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.contact_reply',
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
