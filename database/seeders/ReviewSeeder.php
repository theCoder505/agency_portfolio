<?php

namespace Database\Seeders;

use App\Models\Review;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $reviews = [
            [
                'author_name' => 'David Thorne',
                'author_avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
                'author_role' => 'CTO',
                'company' => 'NexusCloud Inc.',
                'rating' => 5,
                'review_title' => 'Transformed our SaaS architecture beyond expectations!',
                'review_text' => 'CodeVenture Tech rebuilt our multi-tenant SaaS platform from the ground up with Laravel and React. Our response times improved by 400% and customer churn dropped dramatically. Absolute top-tier engineering talent!',
                'source' => 'trustpilot',
                'review_date' => '2026-06-14',
                'verified_purchase' => true,
                'is_featured' => true,
            ],
            [
                'author_name' => 'Claire Beauchamp',
                'author_avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
                'author_role' => 'Managing Director',
                'company' => 'Aura Maison Paris',
                'rating' => 5,
                'review_title' => 'Unbelievable attention to visual aesthetics and speed',
                'review_text' => 'The headless e-commerce store they developed for Aura exceeded our wildest expectations. The 3D interactions and smooth page loads contributed to a 38% surge in international online checkouts in the first quarter.',
                'source' => 'trustpilot',
                'review_date' => '2026-05-20',
                'verified_purchase' => true,
                'is_featured' => true,
            ],
            [
                'author_name' => 'Julian Hayes',
                'author_avatar' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
                'author_role' => 'VP of Engineering',
                'company' => 'Synthetix AI Labs',
                'rating' => 5,
                'review_title' => 'The finest full-stack team we have ever partnered with',
                'review_text' => 'Deploying streaming LLM tools with sub-second latency required deep systems expertise. CodeVenture delivered the entire CognitiveAI portal ahead of schedule with spotless code hygiene and pristine documentation.',
                'source' => 'trustpilot',
                'review_date' => '2026-07-02',
                'verified_purchase' => true,
                'is_featured' => true,
            ],
            [
                'author_name' => 'Samantha Miller',
                'author_avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                'author_role' => 'Head of Digital Strategy',
                'company' => 'OmniCare Global',
                'rating' => 5,
                'review_title' => 'Flawless HIPAA-compliant platform delivery',
                'review_text' => 'Their deep understanding of enterprise healthcare security standards combined with an ultra-smooth patient UI made our telehealth portal launch an enormous success.',
                'source' => 'trustpilot',
                'review_date' => '2026-04-18',
                'verified_purchase' => true,
                'is_featured' => true,
            ],
            [
                'author_name' => 'Liam Gallagher',
                'author_avatar' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
                'author_role' => 'Co-Founder',
                'company' => 'QuantumX Technologies',
                'rating' => 5,
                'review_title' => 'World-class WebGL animations and responsiveness',
                'review_text' => 'Our interactive landing page blew our investors away during our Series A round. Smooth 60fps animations on both mobile and desktop. CodeVenture Tech is in a league of their own.',
                'source' => 'trustpilot',
                'review_date' => '2026-03-30',
                'verified_purchase' => true,
                'is_featured' => true,
            ],
        ];

        foreach ($reviews as $review) {
            Review::updateOrCreate(['review_title' => $review['review_title']], $review);
        }
    }
}
