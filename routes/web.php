<?php


Route::get('/{Vue?}', 'IndexController@index')->where('Vue', '^([\w]+)');


	/*
		TODO Twaak and add more Content to component Desktop site
			make and redirect SEO FRIENDLY page for Search Engines

	*/