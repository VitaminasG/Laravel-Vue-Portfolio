<?php

use App\Http\Controllers\IndexController;
use Illuminate\Support\Facades\Route;

Route::get('/{Vue?}', [IndexController::class, 'index'])->where('Vue', '^([\w]+)');
Route::post('/ContactMe', [IndexController::class, 'store'])->middleware('throttle:5,1');
