<?php


Route::get('/{Vue?}', 'IndexController@index')->where('Vue', '^([\w]+)');
Route::post('/ContactMe', 'IndexController@store');

	/*
		TODO make and redirect SEO FRIENDLY page for Search Engines

	*/