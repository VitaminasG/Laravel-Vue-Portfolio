<?php

Route::post('/login', 'API\ApiController@login');

Route::middleware('auth:api')->group(function(){

     //

});
