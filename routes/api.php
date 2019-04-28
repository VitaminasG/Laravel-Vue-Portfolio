<?php

Route::get('/verify', 'API\ApiController@verify');
Route::post('/login', 'API\ApiController@login');
Route::post('/register', 'API\ApiController@register');
Route::get('/register', 'API\ApiController@register');

Route::middleware('auth:api')->group(function(){

     //

});
