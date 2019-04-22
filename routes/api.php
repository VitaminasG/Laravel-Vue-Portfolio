<?php

Route::get('/login', 'API\ApiController@login');

Route::middleware('auth:api')->group(function(){

     //

});
