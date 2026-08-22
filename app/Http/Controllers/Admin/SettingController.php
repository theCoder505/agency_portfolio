<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Display the App Settings page.
     */
    public function index(): Response
    {
        $settings = AppSetting::getAllGrouped();

        return Inertia::render('admin/settings/index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update application settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $data = $request->except(['_token', 'logo', 'logo_dark', 'favicon']);

        // Handle Logo Upload (Light Mode)
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('settings', 'public');
            AppSetting::set('logo', '/storage/' . $path, 'branding');
        }

        // Handle Dark Logo Upload
        if ($request->hasFile('logo_dark')) {
            $path = $request->file('logo_dark')->store('settings', 'public');
            AppSetting::set('logo_dark', '/storage/' . $path, 'branding');
        }

        // Handle Favicon Upload
        if ($request->hasFile('favicon')) {
            $path = $request->file('favicon')->store('settings', 'public');
            AppSetting::set('favicon', '/storage/' . $path, 'branding');
        }

        // Save all other string/boolean settings
        foreach ($data as $key => $value) {
            $group = 'general';
            if (str_starts_with($key, 'social_')) {
                $group = 'social';
            } elseif (str_starts_with($key, 'whatsapp_')) {
                $group = 'whatsapp';
            } elseif (str_starts_with($key, 'trustpilot_')) {
                $group = 'trustpilot';
            } elseif (in_array($key, ['terms_and_conditions', 'privacy_policy'])) {
                $group = 'legal';
            } elseif (in_array($key, ['contact_email', 'contact_phone', 'address_line1', 'address_line2', 'google_map_embed_url'])) {
                $group = 'contact';
            }

            AppSetting::set($key, is_null($value) ? '' : (string)$value, $group);
        }

        return back()->with('success', 'Application settings updated successfully.');
    }
}
