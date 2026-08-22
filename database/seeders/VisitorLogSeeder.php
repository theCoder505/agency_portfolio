<?php

namespace Database\Seeders;

use App\Models\Portfolio;
use App\Models\VisitorLog;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class VisitorLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $portfolios = Portfolio::all();
        $devices = ['Desktop', 'Desktop', 'Desktop', 'Mobile', 'Mobile', 'Tablet'];
        $browsers = ['Chrome', 'Chrome', 'Safari', 'Firefox', 'Edge'];
        $platforms = ['Windows', 'macOS', 'iOS', 'Android', 'Linux'];
        $referers = [
            'https://google.com',
            'https://github.com',
            'https://twitter.com',
            'https://linkedin.com',
            'https://trustpilot.com',
            null,
        ];

        $urls = [
            'http://127.0.0.1:8000/',
            'http://127.0.0.1:8000/works',
            'http://127.0.0.1:8000/about',
            'http://127.0.0.1:8000/contact',
        ];

        $now = Carbon::now();

        // Seed realistic traffic for past 30 days
        for ($i = 29; $i >= 0; $i--) {
            $day = $now->copy()->subDays($i);
            $dailyHits = rand(15, 60);

            for ($j = 0; $j < $dailyHits; $j++) {
                $portfolio = rand(0, 1) && $portfolios->isNotEmpty() ? $portfolios->random() : null;
                $url = $portfolio 
                    ? "http://127.0.0.1:8000/works/{$portfolio->slug}" 
                    : $urls[array_rand($urls)];

                $createdAt = $day->copy()->addHours(rand(0, 23))->addMinutes(rand(0, 59));

                VisitorLog::create([
                    'ip_address' => '192.168.' . rand(1, 20) . '.' . rand(1, 254),
                    'url' => $url,
                    'method' => 'GET',
                    'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'device_type' => $devices[array_rand($devices)],
                    'browser' => $browsers[array_rand($browsers)],
                    'platform' => $platforms[array_rand($platforms)],
                    'referer' => $referers[array_rand($referers)],
                    'portfolio_id' => $portfolio?->id,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);
            }
        }
    }
}
