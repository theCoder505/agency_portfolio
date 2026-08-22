<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use Inertia\Inertia;
use Inertia\Response;

class LegalController extends Controller
{
    /**
     * Display Terms and Conditions Page.
     */
    public function terms(): Response
    {
        $content = AppSetting::get('terms_and_conditions', '<h1>Terms & Conditions</h1><p>Welcome to CodeVenture Tech.</p>');

        return Inertia::render('surface/legal', [
            'title' => 'Terms & Conditions',
            'content' => $content,
        ]);
    }

    /**
     * Display Privacy Policy Page.
     */
    public function privacy(): Response
    {
        $content = AppSetting::get('privacy_policy', '<h1>Privacy Policy</h1><p>Your privacy is important to CodeVenture Tech.</p>');

        return Inertia::render('surface/legal', [
            'title' => 'Privacy Policy',
            'content' => $content,
        ]);
    }
}
