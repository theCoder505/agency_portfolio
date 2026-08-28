<?php

namespace Database\Seeders;

use App\Models\AppSetting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // Branding
            ['key' => 'brand_name', 'value' => 'CodeVenture Tech', 'group' => 'branding'],
            ['key' => 'tagline', 'value' => 'Engineering High-Performance Web Applications & Scalable SaaS Platforms', 'group' => 'branding'],
            ['key' => 'logo', 'value' => '', 'group' => 'branding'],
            ['key' => 'logo_dark', 'value' => '', 'group' => 'branding'],
            ['key' => 'favicon', 'value' => '', 'group' => 'branding'],
            ['key' => 'footer_text', 'value' => 'CodeVenture Tech is a premier digital engineering and web development agency crafting resilient SaaS applications, high-converting platforms, and interactive digital experiences for industry leaders worldwide.', 'group' => 'branding'],
            ['key' => 'copyright_text', 'value' => '© 2026 CodeVenture Technology. All rights reserved.', 'group' => 'branding'],

            // Contact Info
            ['key' => 'contact_email', 'value' => 'hello@codeventure.tech', 'group' => 'contact'],
            ['key' => 'contact_phone', 'value' => '+1 (555) 234-5678', 'group' => 'contact'],
            ['key' => 'address_line1', 'value' => '100 Silicon Vista Way, Suite 400', 'group' => 'contact'],
            ['key' => 'address_line2', 'value' => 'San Francisco, CA 94107, USA', 'group' => 'contact'],
            ['key' => 'google_map_embed_url', 'value' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.086884617192!2d-122.39568368468205!3d37.78779997975765!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085807c4b18f8e7%3A0x6b4c10a12e3e7845!2sMarket%20St%2C%20San%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1650000000000!5m2!1sen!2sus', 'group' => 'contact'],

            // WhatsApp Settings
            ['key' => 'whatsapp_number', 'value' => '+15552345678', 'group' => 'whatsapp'],
            ['key' => 'whatsapp_message_prompt', 'value' => 'Hi CodeVenture Tech team! I would like to discuss building our upcoming web project.', 'group' => 'whatsapp'],
            ['key' => 'whatsapp_enabled', 'value' => '1', 'group' => 'whatsapp'],

            // Social Media
            ['key' => 'social_facebook', 'value' => 'https://facebook.com/codeventure.tech', 'group' => 'social'],
            ['key' => 'social_twitter', 'value' => 'https://x.com/codeventure_tech', 'group' => 'social'],
            ['key' => 'social_linkedin', 'value' => 'https://linkedin.com/company/codeventure-tech', 'group' => 'social'],
            ['key' => 'social_github', 'value' => 'https://github.com/codeventure-tech', 'group' => 'social'],
            ['key' => 'social_instagram', 'value' => 'https://instagram.com/codeventure.tech', 'group' => 'social'],
            ['key' => 'social_youtube', 'value' => 'https://youtube.com/@codeventuretech', 'group' => 'social'],

            // Trustpilot Integration
            ['key' => 'trustpilot_enabled', 'value' => '1', 'group' => 'trustpilot'],
            ['key' => 'trustpilot_url', 'value' => 'https://www.trustpilot.com/review/codeventure.tech', 'group' => 'trustpilot'],
            ['key' => 'trustpilot_score', 'value' => '4.9', 'group' => 'trustpilot'],
            ['key' => 'trustpilot_reviews_count', 'value' => '142', 'group' => 'trustpilot'],

            // Media
            ['key' => 'featured_youtube_video', 'value' => 'https://www.youtube.com/watch?v=LXb3EKWsInQ', 'group' => 'media'],

            // Payment Gateways & Manual Instructions
            ['key' => 'currency_symbol', 'value' => '৳', 'group' => 'payment'],
            ['key' => 'currency_code', 'value' => 'BDT', 'group' => 'payment'],
            ['key' => 'bkash_number', 'value' => '01712-345678 (Personal / Send Money)', 'group' => 'payment'],
            ['key' => 'bkash_instructions', 'value' => '1. Open bKash App or dial *247#.\n2. Select "Send Money" to the number above.\n3. Enter the exact package amount.\n4. Save the Transaction ID (TrxID) and submit here along with your bKash phone number.', 'group' => 'payment'],
            ['key' => 'bkash_enabled', 'value' => '1', 'group' => 'payment'],
            ['key' => 'nagad_number', 'value' => '01812-345678 (Personal / Send Money)', 'group' => 'payment'],
            ['key' => 'nagad_instructions', 'value' => '1. Open Nagad App or dial *167#.\n2. Select "Send Money" to the number above.\n3. Enter the exact package amount.\n4. Copy the Transaction ID (TrxID) and enter it below with your Nagad number.', 'group' => 'payment'],
            ['key' => 'nagad_enabled', 'value' => '1', 'group' => 'payment'],

            // Legal Pages
            [
                'key' => 'terms_and_conditions',
                'value' => '<h2>1. Acceptance of Terms</h2><p>By accessing or using CodeVenture Tech services, website, and deliverables, you agree to be bound by these Terms and Conditions.</p><h2>2. Intellectual Property</h2><p>All custom source code and architectural assets developed specifically for clients are transferred upon final contract fulfillment, while proprietary starter foundations remain protected.</p><h2>3. Service Level Agreements</h2><p>We guarantee 99.9% deployment availability and proactive security patch monitoring for all enterprise retainer engagements.</p><h2>4. Modifications</h2><p>CodeVenture Tech reserves the right to revise terms with standard written notice to clients.</p>',
                'group' => 'legal',
            ],
            [
                'key' => 'privacy_policy',
                'value' => '<h2>1. Information We Collect</h2><p>We collect contact information, inquiry metadata, and anonymous telemetry strictly to optimize website performance and communicate with prospective partners.</p><h2>2. Zero-Sell Data Commitment</h2><p>We never sell, rent, or trade your personal or business data to any third-party marketing entities.</p><h2>3. Data Protection & Security</h2><p>All communication channels, OTP verifications, and databases employ AES-256 encryption at rest and TLS 1.3 encryption in transit.</p><h2>4. Your Rights</h2><p>You may request deletion or export of your inquiry history at any time by emailing privacy@codeventure.tech.</p>',
                'group' => 'legal',
            ],
        ];

        foreach ($settings as $setting) {
            AppSetting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
