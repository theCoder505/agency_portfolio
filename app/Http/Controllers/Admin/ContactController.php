<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\ContactReplyMail;
use App\Models\Contact;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    /**
     * Display listing of contact inquiries.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search', '');
        $status = $request->query('status', 'all'); // all, unread, read, replied
        $fromDate = $request->query('from_date');
        $toDate = $request->query('to_date');

        $query = Contact::query();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        if ($status === 'unread') {
            $query->where('is_read', false);
        } elseif ($status === 'read') {
            $query->where('is_read', true)->whereNull('replied_at');
        } elseif ($status === 'replied') {
            $query->whereNotNull('replied_at');
        }

        if ($fromDate && $toDate) {
            $query->whereBetween('created_at', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59']);
        }

        $contacts = $query->orderBy('is_read', 'asc')
            ->orderBy('created_at', 'desc')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('admin/contacts/index', [
            'contacts' => $contacts,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'from_date' => $fromDate,
                'to_date' => $toDate,
            ],
        ]);
    }

    /**
     * Mark inquiry as read.
     */
    public function markAsRead(Contact $contact): RedirectResponse
    {
        $contact->update(['is_read' => true]);

        return back()->with('success', 'Message marked as read.');
    }

    /**
     * Send email reply to the contact from the website.
     */
    public function reply(Request $request, Contact $contact): RedirectResponse
    {
        $validated = $request->validate([
            'reply_subject' => 'required|string|max:255',
            'reply_message' => 'required|string|min:5',
        ]);

        try {
            Mail::to($contact->email)->send(new ContactReplyMail(
                $contact->name,
                $validated['reply_subject'],
                $validated['reply_message'],
                $contact->message
            ));

            $contact->update([
                'is_read' => true,
                'replied_at' => Carbon::now(),
                'reply_subject' => $validated['reply_subject'],
                'reply_message' => $validated['reply_message'],
            ]);

            return back()->with('success', 'Reply email sent successfully to ' . $contact->email);
        } catch (\Exception $e) {
            Log::error('Failed to send reply email: ' . $e->getMessage());

            // Still save reply record even if mailer logs in development
            $contact->update([
                'is_read' => true,
                'replied_at' => Carbon::now(),
                'reply_subject' => $validated['reply_subject'],
                'reply_message' => $validated['reply_message'],
            ]);

            return back()->with('warning', 'Reply saved. (Note: Check email server configuration)');
        }
    }

    /**
     * Remove the specified contact inquiry.
     */
    public function destroy(Contact $contact): RedirectResponse
    {
        $contact->delete();

        return back()->with('success', 'Message deleted successfully.');
    }

    /**
     * Bulk delete contact messages.
     */
    public function bulkDelete(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:contacts,id',
        ]);

        Contact::whereIn('id', $request->ids)->delete();

        return back()->with('success', count($request->ids) . ' messages deleted successfully.');
    }
}
