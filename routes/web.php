<?php

/*
 * TODO: For Production remove PhpStorm FileIgnore for public/js/app.js & public/chunks
 */


Route::get('/{Vue?}', 'IndexController@index')->where('Vue', '^([\w]+)');
Route::post('/ContactMe', 'IndexController@store');