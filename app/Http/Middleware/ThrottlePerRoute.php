<?php

namespace App\Http\Middleware;

use Illuminate\Routing\Middleware\ThrottleRequests;
use RuntimeException;

/**
 * Same as the framework's ThrottleRequests, except the rate-limiter key for
 * unauthenticated requests also folds in the route, not just the domain and
 * IP. Laravel 5.7's default resolveRequestSignature() returns
 * sha1($route->getDomain().'|'.$request->ip()) for anonymous requests, and
 * since none of our routes declare a domain, every unauthenticated route on
 * the same IP shares one counter. That let traffic on one route (e.g. GET
 * /api/verify, limit 60/min) exhaust the budget of another route with a
 * smaller limit (e.g. POST /api/login, limit 10/min), locking out login
 * after ten page loads.
 */
class ThrottlePerRoute extends ThrottleRequests
{
    /**
     * Resolve request signature, keying anonymous requests per route so
     * different routes on the same IP get independent buckets.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string
     *
     * @throws \RuntimeException
     */
    protected function resolveRequestSignature($request)
    {
        if ($user = $request->user()) {
            return sha1($user->getAuthIdentifier());
        }

        if ($route = $request->route()) {
            return sha1(
                $route->getDomain() . '|' . ($route->getName() ?: $request->path()) . '|' . $request->ip()
            );
        }

        throw new RuntimeException('Unable to generate the request signature. Route unavailable.');
    }
}
