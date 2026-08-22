<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'SaaS & Cloud Apps',
                'slug' => 'saas-cloud-apps',
                'description' => 'Multi-tenant high performance scalable software-as-a-service web platforms.',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'E-Commerce Platforms',
                'slug' => 'e-commerce-platforms',
                'description' => 'Next-generation digital storefronts, headless checkout, and real-time inventory systems.',
                'order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'AI & Intelligent Systems',
                'slug' => 'ai-intelligent-systems',
                'description' => 'GenAI interfaces, LLM automation tools, and predictive business intelligence dashboards.',
                'order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'FinTech & Web3',
                'slug' => 'fintech-web3',
                'description' => 'Secure payment gateways, institutional crypto tracking, and algorithmic financial tools.',
                'order' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'Custom Web Portals',
                'slug' => 'custom-web-portals',
                'description' => 'Enterprise internal software, CRM, ERP, and bespoke workflow automation platforms.',
                'order' => 5,
                'is_active' => true,
            ],
            [
                'name' => 'Modern Landing Pages',
                'slug' => 'modern-landing-pages',
                'description' => 'High-converting interactive marketing websites with 3D interactions and glassmorphic micro-animations.',
                'order' => 6,
                'is_active' => true,
            ],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}
