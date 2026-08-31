<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\TrackVisitor;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            TrackVisitor::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
        
        $middleware->redirectGuestsTo(fn ($request) => $request->is('admin*') ? route('admin.login') : route('login'));
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Render HTTP errors as Inertia responses using our custom React error page across all panels
        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response, ?\Throwable $exception = null, ?\Illuminate\Http\Request $request = null) {
            $req = $request ?? request();
            $status = $response->getStatusCode();

            // Skip for API or JSON requests, and in testing environment
            if (app()->environment('testing') || $req->expectsJson() || $req->is('api/*')) {
                return $response;
            }

            if (in_array($status, [400, 401, 403, 404, 419, 429, 500, 502, 503, 504, 505])) {
                $panel = 'surface';
                if ($req->is('admin*')) {
                    $panel = 'admin';
                } elseif ($req->is('customer*')) {
                    $panel = 'customer';
                }

                $message = null;
                if ($exception && (!app()->environment('production') || config('app.debug'))) {
                    $message = $exception->getMessage();
                }

                return Inertia::render('error', [
                    'status' => $status,
                    'panel' => $panel,
                    'message' => $message,
                ])
                ->toResponse($req)
                ->setStatusCode($status);
            }

            return $response;
        });
    })->create();
