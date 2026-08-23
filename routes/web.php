<?php

use App\Http\Controllers\AboutController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LegalController;
use App\Http\Controllers\WorksController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Surface / Client-Facing Routes
|--------------------------------------------------------------------------
*/
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/works', [WorksController::class, 'index'])->name('works.index');
Route::get('/works/{slug}', [WorksController::class, 'show'])->name('works.show');
Route::get('/blogs', [BlogController::class, 'index'])->name('blogs.index');
Route::get('/blogs/{slug}', [BlogController::class, 'show'])->name('blogs.show');
Route::get('/about', [AboutController::class, 'index'])->name('about');
Route::get('/contact', [ContactController::class, 'index'])->name('contact');

// Contact verification & submission
Route::get('/contact/captcha', [ContactController::class, 'getCaptcha'])->name('contact.captcha');
Route::post('/contact/send-otp', [ContactController::class, 'sendOtp'])->name('contact.send-otp');
Route::post('/contact/verify-otp', [ContactController::class, 'verifyOtp'])->name('contact.verify-otp');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');

// Legal Pages
Route::get('/terms-and-conditions', [LegalController::class, 'terms'])->name('legal.terms');
Route::get('/privacy-policy', [LegalController::class, 'privacy'])->name('legal.privacy');

/*
|--------------------------------------------------------------------------
| Admin Management Routes
|--------------------------------------------------------------------------
*/
require __DIR__.'/admin.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
