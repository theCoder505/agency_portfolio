<?php

namespace Database\Seeders;

use App\Models\TeamMember;
use Illuminate\Database\Seeder;

class TeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $members = [
            [
                'name' => 'Alex Rivera',
                'role' => 'Founder & Principal Architect',
                'bio' => '12+ years designing distributed cloud applications and ultra-scalable web platforms across Silicon Valley.',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
                'social_linkedin' => 'https://linkedin.com',
                'social_github' => 'https://github.com',
                'social_twitter' => 'https://x.com',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Sarah Chen',
                'role' => 'Head of Frontend Engineering',
                'bio' => 'Specializes in React 19, Inertia.js architectures, Three.js 3D web graphics, and micro-interaction design.',
                'avatar' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
                'social_linkedin' => 'https://linkedin.com',
                'social_github' => 'https://github.com',
                'social_twitter' => 'https://x.com',
                'order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Marcus Vance',
                'role' => 'Lead Backend & Cloud Engineer',
                'bio' => 'Laravel core contributor and cloud infrastructure specialist with expertise in Kubernetes, Redis, and high-throughput systems.',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
                'social_linkedin' => 'https://linkedin.com',
                'social_github' => 'https://github.com',
                'social_twitter' => 'https://x.com',
                'order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Elena Rostova',
                'role' => 'Director of UI/UX & Brand Design',
                'bio' => 'Award-winning product designer focused on creating intuitive, aesthetic, and high-converting digital design systems.',
                'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
                'social_linkedin' => 'https://linkedin.com',
                'social_github' => 'https://github.com',
                'social_twitter' => 'https://x.com',
                'order' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($members as $member) {
            TeamMember::updateOrCreate(['name' => $member['name']], $member);
        }
    }
}
