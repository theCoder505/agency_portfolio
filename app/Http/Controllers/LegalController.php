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
        $defaultTerms = '<h2>1. Acceptance of Terms</h2>
<p>By accessing or utilizing any software, custom development, SaaS products, or digital consulting services provided by CodeVenture Tech, you agree to be bound by these Terms & Conditions.</p>

<h2>2. Scope of Services & Custom Milestones</h2>
<p>CodeVenture Tech engineers high-performance web applications, enterprise SaaS platforms, AI systems, and bespoke digital infrastructure. Custom client projects are structured according to defined project milestones with agreed deliverable scopes, budgets, and testing review windows.</p>

<h2>3. Intellectual Property & Code Ownership</h2>
<p>Upon final payment and formal release of project milestones, the client receives full ownership rights and access to the deliverables and custom source code developed specifically for their order, excluding pre-existing agency libraries and open-source frameworks.</p>

<h2>4. Subscription Billing & SaaS Cancellation</h2>
<p>Subscriptions for ready-to-deploy enterprise SaaS platforms are billed on a recurring monthly or yearly cycle. Instant payment verification via bKash and Nagad with Transaction ID validation facilitates automated instance provisioning. Subscriptions may be modified or cancelled from your client dashboard prior to the next renewal date.</p>

<h2>5. Service Level Agreement (SLA) & Reliability</h2>
<p>We strive to maintain a 99.9% uptime SLA on our managed cloud instances and cloud SaaS offerings, backed by automated backups, encrypted telemetry, and priority technical support.</p>

<h2>6. Contact & Legal Inquiries</h2>
<p>For questions regarding these Terms & Conditions, contact our legal and support team at <a href="mailto:hello@codeventure.tech">hello@codeventure.tech</a>.</p>';

        $content = AppSetting::get('terms_and_conditions');
        if (empty($content)) {
            $content = $defaultTerms;
        }

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
        $defaultPrivacy = '<h2>1. Information We Collect</h2>
<p>CodeVenture Tech collects information required to deliver high-performance software and client portal services. This includes account contact details (name, business email, phone/WhatsApp number), billing transaction references (bKash/Nagad Transaction IDs), and project requirements submitted via our order brief portals.</p>

<h2>2. How We Use Your Data</h2>
<p>Your information is utilized solely to provide customized software development, verify billing transactions, provision SaaS infrastructure, communicate milestone progress, and provide SLA technical support. We never sell, rent, or trade your personal or business data to third parties.</p>

<h2>3. Data Protection & Security Architecture</h2>
<p>We employ enterprise-grade security standards including SSL/TLS encryption for all in-transit communications, Argon2/Bcrypt password hashing, OTP verification for sensitive account actions, and strict role-based access controls across all databases.</p>

<h2>4. Cookies & Analytical Telemetry</h2>
<p>We use essential cookies to maintain secure authentication sessions and lightweight telemetry logs to monitor application performance and protect against malicious cyber attacks.</p>

<h2>5. Your Rights & Data Portability</h2>
<p>You have the right to review, update, or request the deletion of your account data stored on our systems at any time by contacting our engineering team or visiting your profile settings.</p>

<h2>6. Privacy Contact & Inquiries</h2>
<p>If you have any questions or concerns regarding our privacy practices, please contact us at <a href="mailto:hello@codeventure.tech">hello@codeventure.tech</a>.</p>';

        $content = AppSetting::get('privacy_policy');
        if (empty($content)) {
            $content = $defaultPrivacy;
        }

        return Inertia::render('surface/legal', [
            'title' => 'Privacy Policy',
            'content' => $content,
        ]);
    }
}
