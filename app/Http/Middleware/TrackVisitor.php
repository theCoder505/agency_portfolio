<?php

namespace App\Http\Middleware;

use App\Models\Portfolio;
use App\Models\VisitorLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackVisitor
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log GET requests to frontend pages (exclude admin routes, api, debugbar, assets, storage)
        if ($request->isMethod('GET') && !$request->is('admin*') && !$request->is('api*') && !$request->is('_*') && !$request->ajax()) {
            try {
                $userAgent = $request->userAgent() ?? '';
                $ip = $request->ip();
                $url = $request->fullUrl();

                // Device detection
                $deviceType = 'Desktop';
                if (preg_match('/(tablet|ipad|playbook)|(android(?!.*(mobi|opera mini)))/i', $userAgent)) {
                    $deviceType = 'Tablet';
                } elseif (preg_match('/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i', $userAgent)) {
                    $deviceType = 'Mobile';
                }

                // Browser detection
                $browser = 'Other';
                if (preg_match('/Edg/i', $userAgent)) {
                    $browser = 'Edge';
                } elseif (preg_match('/Chrome/i', $userAgent)) {
                    $browser = 'Chrome';
                } elseif (preg_match('/Safari/i', $userAgent) && !preg_match('/Chrome/i', $userAgent)) {
                    $browser = 'Safari';
                } elseif (preg_match('/Firefox/i', $userAgent)) {
                    $browser = 'Firefox';
                } elseif (preg_match('/Opera|OPR/i', $userAgent)) {
                    $browser = 'Opera';
                }

                // Platform detection
                $platform = 'Other';
                if (preg_match('/windows|win32/i', $userAgent)) {
                    $platform = 'Windows';
                } elseif (preg_match('/macintosh|mac os x/i', $userAgent)) {
                    $platform = 'macOS';
                } elseif (preg_match('/linux/i', $userAgent)) {
                    $platform = 'Linux';
                } elseif (preg_match('/android/i', $userAgent)) {
                    $platform = 'Android';
                } elseif (preg_match('/iphone|ipad|ipod/i', $userAgent)) {
                    $platform = 'iOS';
                }

                // Check if visiting a portfolio item directly
                $portfolioId = null;
                if ($request->routeIs('works.show')) {
                    $slug = $request->route('slug');
                    if ($slug) {
                        $portfolio = Portfolio::where('slug', $slug)->first();
                        if ($portfolio) {
                            $portfolioId = $portfolio->id;
                            $portfolio->increment('views_count');
                        }
                    }
                }

                VisitorLog::create([
                    'ip_address' => $ip,
                    'url' => $url,
                    'method' => $request->method(),
                    'user_agent' => substr($userAgent, 0, 500),
                    'device_type' => $deviceType,
                    'browser' => $browser,
                    'platform' => $platform,
                    'referer' => $request->header('referer'),
                    'portfolio_id' => $portfolioId,
                ]);
            } catch (\Exception $e) {
                // Fail silently to avoid breaking visitor request
                \Log::warning('Visitor tracking error: ' . $e->getMessage());
            }
        }

        return $response;
    }
}
