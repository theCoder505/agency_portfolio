<?php

namespace Database\Seeders;

use App\Models\Contact;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ContactSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $inquiries = [
            [
                'name' => 'Jonathan Sterling',
                'email' => 'j.sterling@novapayments.com',
                'phone' => '+1 (415) 890-1234',
                'service_interested' => 'FinTech & Web3 Platforms',
                'subject' => 'Inquiry for Next-Gen B2B Payment Portal Development',
                'message' => 'Hello CodeVenture team, we are preparing to build an institutional payment aggregation portal with real-time settlement rails and need an experienced engineering partner for an end-to-end build over Q3-Q4.',
                'ip_address' => '192.168.1.45',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                'is_read' => false,
                'replied_at' => null,
                'created_at' => Carbon::now()->subHours(3),
            ],
            [
                'name' => 'Emma Watson-Kemp',
                'email' => 'emma@luminaboutique.co.uk',
                'phone' => '+44 20 7946 0912',
                'service_interested' => 'E-Commerce Platforms',
                'subject' => 'Headless Shopify + React Store Redesign',
                'message' => 'Hi there! We loved the Aura Luxury Store project in your portfolio. We are looking to redesign our luxury cosmetics store to achieve similar performance benchmarks.',
                'ip_address' => '192.168.2.112',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'is_read' => true,
                'replied_at' => Carbon::now()->subDay(),
                'reply_subject' => 'Re: Headless Shopify + React Store Redesign - CodeVenture Tech',
                'reply_message' => 'Hi Emma, thank you for reaching out! We would love to collaborate on your luxury cosmetics store. I have shared our case studies and calendar link to schedule an introductory strategy call.',
                'created_at' => Carbon::now()->subDays(2),
            ],
            [
                'name' => 'Michael Chang',
                'email' => 'm.chang@vertexai.io',
                'phone' => '+1 (650) 432-9876',
                'service_interested' => 'AI & Intelligent Systems',
                'subject' => 'LLM Workflow Canvas & Agent Interface',
                'message' => 'Looking to construct an interactive split-view workspace similar to CognitiveAI with low-latency streaming responses and custom canvas nodes. What is your current availability?',
                'ip_address' => '192.168.3.78',
                'user_agent' => 'Mozilla/5.0 (X11; Linux x86_64)',
                'is_read' => false,
                'replied_at' => null,
                'created_at' => Carbon::now()->subDays(4),
            ],
        ];

        foreach ($inquiries as $inquiry) {
            Contact::create($inquiry);
        }
    }
}
