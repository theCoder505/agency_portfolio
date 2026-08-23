<?php

namespace Database\Seeders;

use App\Models\Blog;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = Category::pluck('id', 'slug')->toArray();

        $blogs = [
            [
                'category_id' => $categories['saas-cloud-apps'] ?? null,
                'title' => 'Architecting High-Throughput Micro-Frontends with React 19 and Inertia',
                'slug' => 'architecting-high-throughput-micro-frontends-react-19',
                'short_description' => 'A deep dive into building modular, lightning-fast enterprise web architectures combining server-driven routing with modern React 19 capabilities.',
                'content' => '<h2>The Evolution of Modern Web Applications</h2><p>Modern enterprise web applications require a delicate balance between engineering speed, runtime performance, and maintainable modular architecture. In recent years, monolithic frontends have increasingly caused build bottlenecks, while excessive micro-frontend fragmentation has introduced runtime overhead.</p><h3>Why Inertia.js with React 19 Changes the Paradigm</h3><p>By pairing <strong>Laravel on the backend with React 19 on the client</strong>, we eliminate the traditional dual-API maintenance burden while preserving the fluid, instant user experience of a Single Page Application (SPA).</p><blockquote><p>“Speed and clarity are not trade-offs; with modern compiler optimizations, they reinforce each other.”</p></blockquote><ul><li><strong>Zero-latency SPA Transitions:</strong> Inertia handles client-side routing with automatic JSON payload diffs.</li><li><strong>React 19 Actions & Concurrent Mode:</strong> Seamless background state transitions without UI freezing.</li><li><strong>Tailwind CSS v4 Engine:</strong> Ultra-fast compilation and custom CSS variable tokens.</li></ul><h3>Real-world Benchmarks</h3><p>In our client implementations, transitioning to this architecture resulted in an <strong>82% reduction in initial payload size</strong> and improved Core Web Vitals to a sustained 99+ score across mobile and desktop viewports.</p>',
                'thumbnail' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
                'author_name' => 'Alexander Vance',
                'author_role' => 'Principal Software Architect',
                'author_avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
                'tags' => ['React 19', 'Architecture', 'Inertia.js', 'Performance', 'Laravel'],
                'reads_count' => 1420,
                'is_featured' => true,
                'is_published' => true,
                'published_at' => now()->subDays(2),
                'order' => 1,
            ],
            [
                'category_id' => $categories['ai-intelligent-systems'] ?? null,
                'title' => 'Engineering Autonomous AI Agents with Streaming Workflows and Vector DBs',
                'slug' => 'engineering-autonomous-ai-agents-vector-dbs',
                'short_description' => 'How to design deterministic, low-latency AI tool orchestration with semantic vector memory and real-time Server-Sent Events (SSE).',
                'content' => '<h2>Bridging LLM Intelligence with Enterprise Determinism</h2><p>Large Language Models alone are not sufficient for mission-critical enterprise workflows. To build resilient AI agents, software architects must build robust guardrails, token stream parsers, and semantic caching layers.</p><h3>Key Architectural Pillars</h3><ol><li><strong>Vector Indexing with Hybrid Search:</strong> Combining dense semantic vectors with BM25 sparse keyword queries ensures maximum recall accuracy.</li><li><strong>Streaming Token Pipelines:</strong> Delivering immediate perceptual response times via SSE streaming.</li><li><strong>Fault-tolerant Tool Calling:</strong> Schema validation with strict JSON schemas prevents hallucinations.</li></ol><blockquote><p>“An AI agent is only as good as its underlying deterministic fallback systems.”</p></blockquote><h3>Observability and Telemetry</h3><p>We implement end-to-end token auditing and latency tracing at every prompt generation step to guarantee SLAs under heavy enterprise loads.</p>',
                'thumbnail' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
                'author_name' => 'Dr. Elena Rostova',
                'author_role' => 'Head of AI Engineering',
                'author_avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
                'tags' => ['AI', 'LLM', 'Vector DB', 'Machine Learning', 'Python'],
                'reads_count' => 980,
                'is_featured' => true,
                'is_published' => true,
                'published_at' => now()->subDays(5),
                'order' => 2,
            ],
            [
                'category_id' => $categories['e-commerce-platforms'] ?? null,
                'title' => 'Next-Generation Headless E-Commerce: Sub-Second Checkout at Scale',
                'slug' => 'next-gen-headless-ecommerce-sub-second-checkout',
                'short_description' => 'Scaling global multi-currency checkout funnels with edge caching, atomic inventory locks, and distributed payment orchestration.',
                'content' => '<h2>The Cost of Millisecond Latency in Digital Commerce</h2><p>Every 100ms of latency during checkout translates directly to an 8% drop in final order conversion rates. In this technical breakdown, we explore how edge caching and distributed transactional locks guarantee instantaneous cart reconciliation.</p><h3>Techniques for High-Volume Flash Sales</h3><ul><li><strong>Optimistic Inventory Reservation:</strong> Redis Lua scripts handle 50,000+ checkout operations per second without database lock contention.</li><li><strong>Edge Compute Middleware:</strong> Geo-routing shoppers to the nearest CDN edge node for instant cart calculations.</li><li><strong>Stripe & PayPal Webhook Orchestration:</strong> Idempotent background queues with automatic exponential backoff retry policies.</li></ul><p>By decoupling frontend catalog presentation from backend transaction processing, high-volume merchants ensure zero downtime during global product launches.</p>',
                'thumbnail' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
                'author_name' => 'Marcus Sterling',
                'author_role' => 'Senior Solutions Architect',
                'author_avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
                'tags' => ['E-Commerce', 'Redis', 'Checkout', 'Stripe', 'High Performance'],
                'reads_count' => 645,
                'is_featured' => false,
                'is_published' => true,
                'published_at' => now()->subDays(9),
                'order' => 3,
            ],
            [
                'category_id' => $categories['modern-landing-pages'] ?? null,
                'title' => 'Mastering Glassmorphism, Micro-Interactions, and AOS Scroll Choreography',
                'slug' => 'mastering-glassmorphism-micro-interactions-aos',
                'short_description' => 'Transforming static web interfaces into dynamic, immersive digital brand experiences using hardware-accelerated CSS and viewport scroll triggers.',
                'content' => '<h2>Elevating Modern UI Design into an Immersive Experience</h2><p>Great web design communicates brand authority within the first 3 seconds of a visitor landing on the page. Combining translucent backdrop blurs, organic glowing gradients, and choreographed scroll entrances creates an undeniable feeling of quality.</p><h3>Key Animation Principles</h3><ul><li><strong>GPU-Accelerated Transforms:</strong> Use <code>transform: translate3d()</code> and <code>opacity</code> to maintain a rock-solid 60fps frame rate.</li><li><strong>Staggered Scroll Triggers:</strong> Employing AOS delay chains (e.g. 100ms, 200ms, 300ms) leads the user’s eye naturally through the information hierarchy.</li><li><strong>Adaptive Dark/Light Contrast:</strong> Ensure all translucent glass surfaces adjust their border and shadow intensities dynamically based on the current theme token.</li></ul><p>When micro-animations respond intuitively to user intent, user engagement metrics and session duration increase significantly.</p>',
                'thumbnail' => 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop',
                'author_name' => 'Sophia Lin',
                'author_role' => 'Lead UI/UX Designer',
                'author_avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
                'tags' => ['UI/UX', 'AOS', 'Animations', 'Tailwind CSS', 'Design System'],
                'reads_count' => 1890,
                'is_featured' => true,
                'is_published' => true,
                'published_at' => now()->subDays(12),
                'order' => 4,
            ],
        ];

        foreach ($blogs as $blog) {
            Blog::updateOrCreate(
                ['slug' => $blog['slug']],
                $blog
            );
        }
    }
}
