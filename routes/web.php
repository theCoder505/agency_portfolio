<?php

use App\Http\Controllers\AboutController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LegalController;
use App\Http\Controllers\WorksController;
use Illuminate\Support\Facades\Artisan;
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

// SaaS Products & Ordering Flow
Route::get('/saas-products', [\App\Http\Controllers\SaasProductController::class, 'index'])->name('saas.index');
Route::get('/saas-products/{slug}', [\App\Http\Controllers\SaasProductController::class, 'show'])->name('saas.show');
Route::get('/pricing', function () {
    return redirect()->route('saas.index');
})->name('pricing');
Route::get('/checkout/{slug}', [\App\Http\Controllers\SaasProductController::class, 'checkout'])->name('checkout.show');
Route::post('/checkout', [\App\Http\Controllers\SaasProductController::class, 'processCheckout'])->name('checkout.process');

// Custom Products & Bespoke Projects Request Flow
Route::get('/custom-order', [\App\Http\Controllers\CustomOrderRequestController::class, 'create'])->name('custom-order.create');
Route::get('/custom-orders/request', [\App\Http\Controllers\CustomOrderRequestController::class, 'create'])->name('custom-order.request');
Route::post('/custom-orders/request', [\App\Http\Controllers\CustomOrderRequestController::class, 'store'])->name('custom-order.store');

// Customer Portal (Guarded by web auth)
Route::middleware('auth:web')->prefix('customer')->name('customer.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Customer\DashboardController::class, 'index'])->name('dashboard');
    Route::get('/subscriptions', [\App\Http\Controllers\Customer\SubscriptionController::class, 'index'])->name('subscriptions.index');
    Route::get('/subscriptions/{id}', [\App\Http\Controllers\Customer\SubscriptionController::class, 'show'])->name('subscriptions.show');
    Route::post('/subscriptions/{id}/renew', [\App\Http\Controllers\Customer\SubscriptionController::class, 'renew'])->name('subscriptions.renew');
    
    // Custom Orders & Milestones
    Route::get('/custom-orders', [\App\Http\Controllers\Customer\CustomOrderController::class, 'index'])->name('custom-orders.index');
    Route::get('/custom-orders/{id}', [\App\Http\Controllers\Customer\CustomOrderController::class, 'show'])->name('custom-orders.show');
    Route::post('/custom-orders/{id}/update-budget', [\App\Http\Controllers\Customer\CustomOrderController::class, 'updateBudget'])->name('custom-orders.update-budget');
    Route::post('/custom-orders/{id}/milestones/{milestoneId}/submit-payment', [\App\Http\Controllers\Customer\CustomOrderController::class, 'submitMilestonePayment'])->name('custom-orders.milestones.submit-payment');
    Route::post('/custom-orders/{id}/complete', [\App\Http\Controllers\Customer\CustomOrderController::class, 'complete'])->name('custom-orders.complete');
    Route::post('/custom-orders/{id}/review', [\App\Http\Controllers\Customer\CustomOrderController::class, 'storeReview'])->name('custom-orders.review');
    Route::get('/custom-orders/{id}/report', [\App\Http\Controllers\Customer\CustomOrderController::class, 'showReport'])->name('custom-orders.report');
    Route::post('/custom-orders/{id}/cancel', [\App\Http\Controllers\Customer\CustomOrderController::class, 'cancel'])->name('custom-orders.cancel');

    Route::get('/invoices', [\App\Http\Controllers\Customer\InvoiceController::class, 'index'])->name('invoices.index');
    Route::get('/profile', [\App\Http\Controllers\Customer\ProfileController::class, 'index'])->name('profile.index');
    Route::put('/profile', [\App\Http\Controllers\Customer\ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [\App\Http\Controllers\Customer\ProfileController::class, 'updatePassword'])->name('profile.password');
});

// Standard dashboard redirect
Route::get('/dashboard', function () {
    return redirect()->route('customer.dashboard');
})->middleware('auth:web')->name('dashboard');

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


Route::get('/clear', function () {
    Artisan::call('cache:clear');
    Artisan::call('config:clear');
    Artisan::call('config:cache');
    Artisan::call('view:clear');
    Artisan::call('storage:link');
    return "Cleared!";
});

Route::get('/migrate', function () {
    Artisan::call('migrate', ['--force' => true]);
    Artisan::call('db:seed', ['--force' => true]);
    return "Migrations & Seeds Executed Successfully!";
});
