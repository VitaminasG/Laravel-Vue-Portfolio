<?php

// Convention: every route below declares its own throttle; there is no
// group-level safety net. Each uses 'throttle.route' (see
// App\Http\Middleware\ThrottlePerRoute) so buckets are keyed per route and
// cannot spend each other's budget.

Route::get('/verify', 'API\ApiController@verify')->middleware('throttle.route:60,1');

Route::post('/register', 'API\ApiController@register')->middleware('throttle.route:10,1');
Route::post('/login', 'API\ApiController@login')->middleware('throttle.route:10,1');

Route::middleware('throttle.route:60,1', 'auth:api')->group(function () {
    Route::get('/stats', 'API\ApiController@stats');
    Route::post('/logout', 'API\ApiController@logout');
});
