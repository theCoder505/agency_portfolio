<?php

namespace Database\Seeders;

use App\Models\SaasProduct;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SaasProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'CloudERP Suite Enterprise',
                'slug' => 'clouderp-suite-enterprise',
                'tagline' => 'All-in-one business management, telemetry, and automated workflow platform',
                'description' => 'Complete enterprise cloud solution featuring multi-branch inventory tracking, automated accounting, payroll, CRM pipelines, and real-time executive dashboard telemetry.',
                'icon' => 'Database',
                'badge' => 'Most Popular',
                'monthly_price' => 4999.00,
                'half_yearly_price' => 26999.00,
                'yearly_price' => 49999.00,
                'has_monthly' => true,
                'has_half_yearly' => true,
                'has_yearly' => true,
                'features' => [
                    'Unlimited User Accounts & Role-Based Access Control',
                    'Automated Multi-Currency Invoicing & Tax Filing',
                    'Real-Time Inventory Synchronization & Stock Alerts',
                    'Custom Domain & Subdomain SSL Deployment',
                    'Daily Automated Cloud Backups with 99.99% SLA',
                    'Priority 24/7 Dedicated Account Engineer',
                ],
                'order' => 1,
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'name' => 'OmniStore E-Commerce Engine',
                'slug' => 'omnistore-ecommerce-engine',
                'tagline' => 'High-converting headless digital storefront with sub-second checkout',
                'description' => 'Scalable e-commerce SaaS architecture equipped with bKash/Nagad automated checkout, order fulfillment tracking, customer loyalty points, and flash sale acceleration.',
                'icon' => 'Globe',
                'badge' => 'High Growth',
                'monthly_price' => 3499.00,
                'half_yearly_price' => 18999.00,
                'yearly_price' => 34999.00,
                'has_monthly' => true,
                'has_half_yearly' => true,
                'has_yearly' => true,
                'features' => [
                    'Sub-second Global Page Load Speed (Core Web Vitals 99+)',
                    'Integrated bKash, Nagad, Card & Courier Gateway APIs',
                    'Abandoned Cart Recovery Automation & SMS Marketing',
                    'Custom Branded Domain with Free Managed CDN',
                    'Product Variant Matrix & Bulk Inventory Importer',
                    'Full Telemetry & Google Analytics 4 Ecommerce Tracking',
                ],
                'order' => 2,
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Agentic AI Knowledge & Support Workspace',
                'slug' => 'agentic-ai-support-workspace',
                'tagline' => 'Autonomous customer support agent trained directly on your business documents',
                'description' => 'Deploy custom AI support bots that resolve 80%+ of incoming inquiries instantly on your website, WhatsApp, and social media channels using private RAG neural vectors.',
                'icon' => 'Cpu',
                'badge' => 'AI Powered',
                'monthly_price' => 2999.00,
                'half_yearly_price' => 15999.00,
                'yearly_price' => 29999.00,
                'has_monthly' => true,
                'has_half_yearly' => true,
                'has_yearly' => true,
                'features' => [
                    'Unlimited Knowledge Base Vector Document Embeddings',
                    'Multi-Channel Bot Widget (Web, WhatsApp, Messenger)',
                    'Smart Fallback to Human Agents with Ticket Escalation',
                    'Custom LLM Prompt Fine-Tuning & Brand Voice Matching',
                    'Analytics on Popular Inquiries & Customer Sentiment',
                    'Zero Data Leakage Guarantee (Enterprise Isolated DB)',
                ],
                'order' => 3,
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'name' => 'SmartBookings & Client Portal',
                'slug' => 'smartbookings-client-portal',
                'tagline' => 'Frictionless appointment scheduling, service invoicing, and client management',
                'description' => 'Designed for agencies, clinics, consultants, and service providers. Automate client onboarding, video call link generation, upfront deposit collection, and calendar sync.',
                'icon' => 'Calendar',
                'badge' => 'Starter Choice',
                'monthly_price' => 1999.00,
                'half_yearly_price' => 10999.00,
                'yearly_price' => 19999.00,
                'has_monthly' => true,
                'has_half_yearly' => true,
                'has_yearly' => true,
                'features' => [
                    'Google Calendar & Outlook Two-Way Synchronization',
                    'Automated WhatsApp & SMS Reminder Notifications',
                    'Advance Deposit Collection via bKash / Nagad',
                    'Client Self-Service Rescheduling & Cancellation Window',
                    'Custom Form Builder for Pre-Appointment Questionnaires',
                    'Staff Calendar Management & Shift Scheduling',
                ],
                'order' => 4,
                'is_featured' => false,
                'is_active' => true,
            ],
        ];

        foreach ($products as $p) {
            SaasProduct::updateOrCreate(['slug' => $p['slug']], $p);
        }
    }
}
