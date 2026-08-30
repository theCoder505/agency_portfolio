<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display a listing of registered customers.
     */
    public function index(Request $request): Response
    {
        $customers = User::withCount(['subscriptions', 'invoices'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/customers/index', [
            'customers' => $customers,
        ]);
    }

    /**
     * Show the form for creating a new customer.
     */
    public function create(): Response
    {
        return Inertia::render('admin/customers/form', [
            'customer' => null,
            'isEdit' => false,
        ]);
    }

    /**
     * Store a newly created customer.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:30',
            'company_name' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'status' => 'required|in:active,suspended',
            'password' => ['required', Password::defaults()],
            'admin_notes' => 'nullable|string',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $customer = User::create($validated);

        return redirect()->route('admin.customers.index')
            ->with('success', 'Customer account for ' . $customer->name . ' created successfully!');
    }

    /**
     * Display customer details, active packages, and invoice history.
     */
    public function show($customer): Response
    {
        $user = $customer instanceof User ? $customer : User::findOrFail($customer);
        $user->load([
            'subscriptions.product',
            'invoices.subscription.product',
        ]);

        return Inertia::render('admin/customers/show', [
            'customer' => $user,
            'subscriptions' => $user->subscriptions ?? [],
            'invoices' => $user->invoices ?? [],
            'currencySymbol' => AppSetting::get('currency_symbol', '৳'),
        ]);
    }

    /**
     * Show form for editing customer profile.
     */
    public function edit($customer): Response
    {
        $user = $customer instanceof User ? $customer : User::findOrFail($customer);
        return Inertia::render('admin/customers/form', [
            'customer' => $user,
            'isEdit' => true,
        ]);
    }

    /**
     * Update customer profile.
     */
    public function update(Request $request, $customer): RedirectResponse
    {
        $user = $customer instanceof User ? $customer : User::findOrFail($customer);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:30',
            'company_name' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'status' => 'required|in:active,suspended',
            'password' => ['nullable', Password::defaults()],
            'admin_notes' => 'nullable|string',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->route('admin.customers.index')
            ->with('success', 'Customer details updated successfully!');
    }

    /**
     * Remove customer account.
     */
    public function destroy($customer): RedirectResponse
    {
        $user = $customer instanceof User ? $customer : User::findOrFail($customer);
        $user->delete();

        return redirect()->route('admin.customers.index')
            ->with('success', 'Customer account deleted successfully!');
    }
}
