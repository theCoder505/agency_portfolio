<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\SubscriptionInvoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    /**
     * Display a listing of customer invoices.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $invoices = SubscriptionInvoice::with(['subscription.product', 'user'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('customer/invoices/index', [
            'invoices' => $invoices,
            'brandSettings' => [
                'brand_name' => $appSettings['brand_name'] ?? 'CodeVenture Tech',
                'logo' => $appSettings['logo'] ?? null,
                'contact_email' => $appSettings['contact_email'] ?? 'hello@codeventure.tech',
                'contact_phone' => $appSettings['contact_phone'] ?? '+880 1700-000000',
                'address_line1' => $appSettings['address_line1'] ?? 'Dhaka, Bangladesh',
                'address_line2' => $appSettings['address_line2'] ?? 'Engineering Division',
                'currency_symbol' => $appSettings['currency_symbol'] ?? '৳',
            ],
        ]);
    }
}
