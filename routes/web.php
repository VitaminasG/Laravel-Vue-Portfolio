<?php

Route::get('/{Vue?}', 'IndexController@index')->where('Vue', '^([\w]+)');
Route::post('/ContactMe', 'IndexController@store')->middleware('throttle:5,1');
