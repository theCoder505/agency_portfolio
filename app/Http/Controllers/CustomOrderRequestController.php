<?php

namespace App\Http\Controllers;

use App\Mail\CustomOrderReceivedMail;
use App\Mail\CustomOrderRequestedMail;
use App\Models\Admin;
use App\Models\AppSetting;
use App\Models\CustomOrder;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\FacadesLog;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class CustomOrderRequestController extends Controller
{
    /**
     * Show the public Custom Product / Project Request Page.
     */
    public function create(Request $request): Response
    {
        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('surface/custom-order-request', [
            'appSettings' => $appSettings,
            'defaultCurrency' => $appSettings['currency_code'] ?? 'BDT',
            'currencySymbol' => $appSettings['currency_symbol'] ?? '৳',
        ]);
    }

    /**
     * Store and process a new Custom Order / Project Request.
     */
    public function store(Request $request): RedirectResponse
    {
        $rules = [
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'estimated_budget' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|in:BDT,USD,EUR',
            'client_whatsapp' => 'nullable|string|max:40',
            'client_email' => 'nullable|email|max:255',
            'target_deadline' => 'nullable|date',
            'requirements' => 'required|string|min:20|max:10000',
            'reference_links' => 'nullable|string|max:2000',
            'attachments.*' => 'nullable|file|max:20480|mimes:pdf,doc,docx,zip,rar,png,jpg,jpeg,webp,txt,fig,csv,xlsx',
        ];

        $user = Auth::user();

        // If user is guest, validate registration details
        if (!$user) {
            $rules = array_merge($rules, [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255',
                'phone' => 'required|string|max:40',
                'whatsapp_number' => 'nullable|string|max:40',
                'password' => ['required', Password::defaults()],
                'company_name' => 'nullable|string|max:255',
            ]);
        }

        $validated = $request->validate($rules);

        $whatsapp = $request->client_whatsapp ?: ($request->whatsapp_number ?: null);

        // Handle user authentication or creation if guest
        if (!$user) {
            $existingUser = User::where('email', $request->email)->first();
            if ($existingUser) {
                if (Hash::check($request->password, $existingUser->password)) {
                    if ($whatsapp && empty($existingUser->whatsapp_number)) {
                        $existingUser->update(['whatsapp_number' => $whatsapp]);
                    }
                    Auth::login($existingUser);
                    $user = $existingUser;
                } else {
                    return back()->withErrors([
                        'email' => 'An account with this email address already exists. Please log in or use your correct password.',
                    ])->withInput();
                }
            } else {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'whatsapp_number' => $whatsapp ?: $request->phone,
                    'company_name' => $request->company_name,
                    'password' => Hash::make($request->password),
                    'status' => 'active',
                ]);
                Auth::login($user);
            }
        } elseif ($whatsapp && empty($user->whatsapp_number)) {
            $user->update(['whatsapp_number' => $whatsapp]);
        }

        // Handle attachment uploads
        $uploadedAttachments = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $originalName = $file->getClientOriginalName();
                $path = $file->store('custom_orders/attachments', 'public');
                $uploadedAttachments[] = [
                    'name' => $originalName,
                    'path' => '/storage/' . $path,
                    'size' => $file->getSize(),
                    'extension' => $file->getClientOriginalExtension(),
                ];
            }
        }

        $appSettings = AppSetting::getAllGrouped();
        $currency = $validated['currency'] ?? ($appSettings['currency_code'] ?? 'BDT');
        $clientWhatsapp = $whatsapp ?: ($user->whatsapp_number ?: $user->phone);
        $clientEmail = $validated['client_email'] ?? $user->email;

        $order = CustomOrder::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'category' => $validated['category'] ?? 'Custom Software',
            'estimated_budget' => $validated['estimated_budget'] ?? null,
            'currency' => $currency,
            'client_whatsapp' => $clientWhatsapp,
            'client_email' => $clientEmail,
            'target_deadline' => $validated['target_deadline'] ?? null,
            'requirements' => $validated['requirements'],
            'reference_links' => $validated['reference_links'] ?? null,
            'attachments' => $uploadedAttachments,
            'status' => 'pending',
        ]);

        // Send Email notification to Admin
        try {
            $adminEmail = $appSettings['contact_email'] ?? config('mail.from.address');
            $admins = Admin::all();
            if ($admins->isNotEmpty()) {
                foreach ($admins as $admin) {
                    if (!empty($admin->email)) {
                        Mail::to($admin->email)->send(new CustomOrderRequestedMail($order));
                    }
                }
            } elseif (!empty($adminEmail)) {
                Mail::to($adminEmail)->send(new CustomOrderRequestedMail($order));
            }
        } catch (\Throwable $e) {
            Log::error('Failed sending CustomOrderRequestedMail to admin: ' . $e->getMessage());
        }

        // Send confirmation email to Customer
        try {
            if (!empty($user->email)) {
                Mail::to($user->email)->send(new CustomOrderReceivedMail($order));
            }
        } catch (\Throwable $e) {
            Log::error('Failed sending CustomOrderReceivedMail to user: ' . $e->getMessage());
        }

        return redirect()->route('customer.custom-orders.show', $order->id)
            ->with('success', "Your custom project request (#{$order->order_number}) has been submitted successfully! Our engineering team will review it and get back to you shortly.");
    }
}
