<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\SaasProduct;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SaasProductController extends Controller
{
    /**
     * Display a listing of SaaS products.
     */
    public function index(Request $request): Response
    {
        $products = SaasProduct::withCount('subscriptions')
            ->orderBy('order')
            ->orderBy('created_at', 'desc')
            ->get();

        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('admin/saas-products/index', [
            'products' => $products,
            'currencySymbol' => $appSettings['currency_symbol'] ?? '৳',
        ]);
    }

    /**
     * Show form for creating a new SaaS product.
     */
    public function create(): Response
    {
        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('admin/saas-products/form', [
            'product' => null,
            'isEdit' => false,
            'currencySymbol' => $appSettings['currency_symbol'] ?? '৳',
        ]);
    }

    /**
     * Store a newly created SaaS product.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:saas_products,slug',
            'tagline' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:100',
            'badge' => 'nullable|string|max:100',
            'monthly_price' => 'nullable|numeric|min:0',
            'half_yearly_price' => 'nullable|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|in:BDT,USD,EUR',
            'has_monthly' => 'boolean',
            'has_half_yearly' => 'boolean',
            'has_yearly' => 'boolean',
            'features' => 'nullable|array',
            'features.*' => 'string',
            'packages' => 'nullable|array',
            'order' => 'integer|min:0',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'thumbnail' => 'nullable', // File or string URL
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'nullable',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Handle single thumbnail image file upload
        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('saas-products/thumbnails', 'public');
            $validated['thumbnail'] = '/storage/' . $path;
        } elseif (is_string($request->input('thumbnail'))) {
            $validated['thumbnail'] = $request->input('thumbnail');
        }

        // Handle gallery images multi-upload
        $galleryPaths = [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $image) {
                if ($image) {
                    $path = $image->store('saas-products/galleries', 'public');
                    $galleryPaths[] = '/storage/' . $path;
                }
            }
        }
        $validated['gallery_images'] = $galleryPaths;

        SaasProduct::create($validated);

        return redirect()->route('admin.saas-products.index')
            ->with('success', 'SaaS Product created successfully!');
    }

    /**
     * Show the form for editing the specified SaaS product.
     */
    public function edit(SaasProduct $saasProduct): Response
    {
        $appSettings = AppSetting::getAllGrouped();

        return Inertia::render('admin/saas-products/form', [
            'product' => $saasProduct,
            'isEdit' => true,
            'currencySymbol' => $appSettings['currency_symbol'] ?? '৳',
        ]);
    }

    /**
     * Update the specified SaaS product.
     */
    public function update(Request $request, SaasProduct $saasProduct): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:saas_products,slug,' . $saasProduct->id,
            'tagline' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:100',
            'badge' => 'nullable|string|max:100',
            'monthly_price' => 'nullable|numeric|min:0',
            'half_yearly_price' => 'nullable|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|in:BDT,USD,EUR',
            'has_monthly' => 'boolean',
            'has_half_yearly' => 'boolean',
            'has_yearly' => 'boolean',
            'features' => 'nullable|array',
            'features.*' => 'string',
            'packages' => 'nullable|array',
            'order' => 'integer|min:0',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'thumbnail' => 'nullable', // File or string URL
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'nullable',
            'existing_gallery' => 'nullable|array',
        ]);

        // Handle thumbnail replacement if new file uploaded
        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('saas-products/thumbnails', 'public');
            $validated['thumbnail'] = '/storage/' . $path;
        } elseif ($request->has('thumbnail') && is_string($request->input('thumbnail'))) {
            $validated['thumbnail'] = $request->input('thumbnail');
        } elseif ($request->has('thumbnail') && $request->input('thumbnail') === null) {
            $validated['thumbnail'] = null;
        }

        // Handle gallery images: keep existing + append newly uploaded
        $galleryImages = $request->input('existing_gallery', []);
        if (!is_array($galleryImages)) {
            $galleryImages = [];
        }

        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $image) {
                if ($image) {
                    $path = $image->store('saas-products/galleries', 'public');
                    $galleryImages[] = '/storage/' . $path;
                }
            }
        }
        $validated['gallery_images'] = array_values($galleryImages);
        unset($validated['existing_gallery']);

        $saasProduct->update($validated);

        return redirect()->route('admin.saas-products.index')
            ->with('success', 'SaaS Product updated successfully!');
    }

    /**
     * Remove the specified SaaS product.
     */
    public function destroy(SaasProduct $saasProduct): RedirectResponse
    {
        $saasProduct->delete();

        return redirect()->route('admin.saas-products.index')
            ->with('success', 'SaaS Product deleted successfully!');
    }

    /**
     * Bulk delete SaaS products.
     */
    public function bulkDelete(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:saas_products,id',
        ]);

        SaasProduct::whereIn('id', $request->ids)->delete();

        return redirect()->route('admin.saas-products.index')
            ->with('success', count($request->ids) . ' SaaS Products deleted successfully!');
    }
}
