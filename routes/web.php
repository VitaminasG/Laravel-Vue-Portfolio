<?php


Route::get('/{Vue?}', 'IndexController@index')->where('Vue', '^([\w]+)');
Route::post('/ContactMe', 'IndexController@store');

//testing

Route::get('/admin/test', 'IndexController@test');