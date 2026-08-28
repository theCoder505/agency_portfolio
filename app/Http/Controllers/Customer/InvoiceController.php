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
        $status = $request->query('status', 'all');

        $query = SubscriptionInvoice::with('subscription.product')
            ->where('user_id', $user->id);

        if ($status !== 'all' && !empty($status)) {
            $query->where('status', $status);
        }

        $invoices = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();
        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('customer/invoices/index', [
            'invoices' => $invoices,
            'filters' => [
                'status' => $status,
            ],
            'brandSettings' => [
                'brand_name' => $appSettings['brand_name'] ?? 'CodeVenture Tech',
                'contact_email' => $appSettings['contact_email'] ?? 'hello@codeventure.tech',
                'contact_phone' => $appSettings['contact_phone'] ?? '',
                'address_line1' => $appSettings['address_line1'] ?? '',
                'address_line2' => $appSettings['address_line2'] ?? '',
                'currency_symbol' => $appSettings['currency_symbol'] ?? '৳',
            ],
        ]);
    }
}
