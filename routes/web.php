<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any}', function () {
    return view('welcome'); // this Blade file loads the React app
})->where('any', '.*');