<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'throttle.route' => \App\Http\Middleware\ThrottlePerRoute::class,
        ]);

        // Throttling is listed ahead of Authenticate so anonymous traffic to a
        // guarded route is counted before it is rejected. Declaring the order
        // in routes/api.php is not enough: this list outranks it, and without
        // the entry Laravel hoists Authenticate above the throttle, leaving
        // /api/stats and /api/logout free to be hammered.
        $middleware->priority([
            \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\ThrottlePerRoute::class,
            \Illuminate\Routing\Middleware\ThrottleRequests::class,
            \Illuminate\Auth\Middleware\Authenticate::class,
            \Illuminate\Session\Middleware\AuthenticateSession::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            \Illuminate\Auth\Middleware\Authorize::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Every guarded route in this project is an API endpoint, so there is
        // no login page to redirect to.
        $exceptions->render(function (AuthenticationException $e, $request) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        });
    })->create();
