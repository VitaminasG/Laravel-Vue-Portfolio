<?php

/*
 * TODO : Make Registration route with Validation...
 */


Route::get('/{Vue?}', 'IndexController@index')->where('Vue', '^([\w]+)');
Route::post('/ContactMe', 'IndexController@store');