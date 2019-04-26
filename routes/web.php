<?php

/*
 * TODO : Make Login route to check if admin and if loging for first time...
 */


Route::get('/{Vue?}', 'IndexController@index')->where('Vue', '^([\w]+)');
Route::post('/ContactMe', 'IndexController@store');