<?php

Route::get('/verify', 'API\ApiController@verify');

Route::post('/register', 'API\ApiController@register')->middleware('throttle:10,1');
Route::post('/login', 'API\ApiController@login')->middleware('throttle:10,1');

Route::middleware('auth:api')->group(function () {
    Route::get('/stats', 'API\ApiController@stats');
    Route::post('/logout', 'API\ApiController@logout');
});
