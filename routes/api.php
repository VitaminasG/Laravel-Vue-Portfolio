<?php

use App\Http\Controllers\API\ApiController;
use Illuminate\Support\Facades\Route;

// Convention: every route below declares its own throttle; there is no
// group-level safety net. Each uses 'throttle.route' (see
// App\Http\Middleware\ThrottlePerRoute) so buckets are keyed per route and
// cannot spend each other's budget.

Route::get('/verify', [ApiController::class, 'verify'])->middleware('throttle.route:60,1');

Route::post('/register', [ApiController::class, 'register'])->middleware('throttle.route:10,1');
Route::post('/login', [ApiController::class, 'login'])->middleware('throttle.route:10,1');

Route::middleware('throttle.route:60,1', 'auth:api')->group(function () {
    Route::get('/stats', [ApiController::class, 'stats']);
    Route::post('/logout', [ApiController::class, 'logout']);
});
