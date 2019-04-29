<?php

Route::get('/verify', 'API\ApiController@verify');
Route::get('/register', 'API\ApiController@register');

/*
 * TODO : For Production set throttle on ':10,1' - 10 request per 1 min.
 */

Route::post('/register', 'API\ApiController@register')->middleware('throttle');
Route::post('/login', 'API\ApiController@login')->middleware('throttle');

Route::middleware('auth:api')->group(function(){

     //

});
