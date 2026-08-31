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
        // Render HTTP errors as Inertia responses using our custom React error page
        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response, ?\Throwable $exception = null, ?\Illuminate\Http\Request $request = null) {
            $status = $response->getStatusCode();
            if (!app()->environment(['local', 'testing']) && in_array($status, [400, 403, 404, 419, 429, 500, 503])) {
                return Inertia::render('error', ['status' => $status])
                    ->toResponse($request ?? request())
                    ->setStatusCode($status);
            }
            return $response;
        });
    })->create();
