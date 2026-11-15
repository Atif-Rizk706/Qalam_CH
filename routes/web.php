<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// React Admin Panel Host Route
Route::get('/admin/{any?}', function () {
    return view('admin');
})->where('any', '.*');
