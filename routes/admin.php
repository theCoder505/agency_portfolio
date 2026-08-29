<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\BlogController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ContactController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\CustomOrderController;
use App\Http\Controllers\Admin\CustomOrderMilestoneController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\PortfolioController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\SaasProductController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\SubscriptionController;
use App\Http\Controllers\Admin\TeamController;
use App\Http\Controllers\Admin\VisitorLogController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->group(function () {
    // Admin Guest Routes
    Route::middleware('guest:admin')->group(function () {
        Route::get('login', [AuthController::class, 'showLogin'])->name('login');
        Route::post('login', [AuthController::class, 'login'])->name('login.submit');
    });

    // Admin Authenticated Routes
    Route::middleware('auth:admin')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('index');
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::post('logout', [AuthController::class, 'logout'])->name('logout');

        // Custom Orders & Milestone Deliverables Management
        Route::get('custom-orders', [CustomOrderController::class, 'index'])->name('custom-orders.index');
        Route::get('custom-orders/create', [CustomOrderController::class, 'create'])->name('custom-orders.create');
        Route::post('custom-orders', [CustomOrderController::class, 'store'])->name('custom-orders.store');
        Route::get('custom-orders/{id}', [CustomOrderController::class, 'show'])->name('custom-orders.show');
        Route::put('custom-orders/{id}', [CustomOrderController::class, 'update'])->name('custom-orders.update');
        Route::post('custom-orders/{id}/accept', [CustomOrderController::class, 'accept'])->name('custom-orders.accept');
        Route::post('custom-orders/{id}/deny', [CustomOrderController::class, 'deny'])->name('custom-orders.deny');
        Route::delete('custom-orders/{id}', [CustomOrderController::class, 'destroy'])->name('custom-orders.destroy');

        // Milestone management inside custom order
        Route::post('custom-orders/{id}/milestones', [CustomOrderMilestoneController::class, 'store'])->name('custom-orders.milestones.store');
        Route::put('custom-orders/{id}/milestones/{milestoneId}', [CustomOrderMilestoneController::class, 'update'])->name('custom-orders.milestones.update');
        Route::post('custom-orders/{id}/milestones/{milestoneId}/status', [CustomOrderMilestoneController::class, 'updateStatus'])->name('custom-orders.milestones.status');
        Route::delete('custom-orders/{id}/milestones/{milestoneId}', [CustomOrderMilestoneController::class, 'destroy'])->name('custom-orders.milestones.destroy');

        // SaaS Products Management
        Route::post('saas-products/bulk-delete', [SaasProductController::class, 'bulkDelete'])->name('saas-products.bulk-delete');
        Route::resource('saas-products', SaasProductController::class)->except(['show']);

        // Orders & Subscriptions Management
        Route::get('subscriptions', [SubscriptionController::class, 'index'])->name('subscriptions.index');
        Route::get('subscriptions/create', [SubscriptionController::class, 'create'])->name('subscriptions.create');
        Route::post('subscriptions', [SubscriptionController::class, 'store'])->name('subscriptions.store');
        Route::get('subscriptions/{id}', [SubscriptionController::class, 'show'])->name('subscriptions.show');
        Route::get('subscriptions/{id}/edit', [SubscriptionController::class, 'edit'])->name('subscriptions.edit');
        Route::put('subscriptions/{id}', [SubscriptionController::class, 'update'])->name('subscriptions.update');
        Route::post('subscriptions/{id}/approve', [SubscriptionController::class, 'approve'])->name('subscriptions.approve');
        Route::post('subscriptions/{id}/reject', [SubscriptionController::class, 'reject'])->name('subscriptions.reject');
        Route::delete('subscriptions/{id}', [SubscriptionController::class, 'destroy'])->name('subscriptions.destroy');

        // Registered Customers Management
        Route::resource('customers', CustomerController::class);

        // Blogs & Articles Management
        Route::post('blogs/bulk-delete', [BlogController::class, 'bulkDelete'])->name('blogs.bulk-delete');
        Route::resource('blogs', BlogController::class);

        // Portfolios / Products Management
        Route::post('portfolios/bulk-delete', [PortfolioController::class, 'bulkDelete'])->name('portfolios.bulk-delete');
        Route::resource('portfolios', PortfolioController::class);

        // Categories Management
        Route::resource('categories', CategoryController::class)->except(['create', 'show', 'edit']);

        // Contacts & Inquiries Management
        Route::get('contacts', [ContactController::class, 'index'])->name('contacts.index');
        Route::patch('contacts/{contact}/read', [ContactController::class, 'markAsRead'])->name('contacts.mark-read');
        Route::post('contacts/{contact}/reply', [ContactController::class, 'reply'])->name('contacts.reply');
        Route::delete('contacts/{contact}', [ContactController::class, 'destroy'])->name('contacts.destroy');
        Route::post('contacts/bulk-delete', [ContactController::class, 'bulkDelete'])->name('contacts.bulk-delete');

        // Visitor Logs Management
        Route::get('visitor-logs', [VisitorLogController::class, 'index'])->name('visitor-logs.index');
        Route::delete('visitor-logs/{visitorLog}', [VisitorLogController::class, 'destroy'])->name('visitor-logs.destroy');
        Route::post('visitor-logs/bulk-delete', [VisitorLogController::class, 'bulkDelete'])->name('visitor-logs.bulk-delete');
        Route::post('visitor-logs/clear-all', [VisitorLogController::class, 'clearAll'])->name('visitor-logs.clear-all');

        // App Settings Management
        Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
        Route::post('settings', [SettingController::class, 'update'])->name('settings.update');

        // Team Members Management
        Route::resource('team', TeamController::class)->except(['show']);

        // Reviews Management (Trustpilot & Direct)
        Route::resource('reviews', ReviewController::class)->except(['show']);

        // Admin Profile & OTP Security
        Route::get('profile', [ProfileController::class, 'index'])->name('profile.index');
        Route::post('profile/basic', [ProfileController::class, 'updateBasic'])->name('profile.basic');
        Route::post('profile/email/request-otp', [ProfileController::class, 'requestEmailOtp'])->name('profile.email.request-otp');
        Route::post('profile/email/confirm', [ProfileController::class, 'confirmEmailChange'])->name('profile.email.confirm');
        Route::post('profile/password/request-otp', [ProfileController::class, 'requestPasswordOtp'])->name('profile.password.request-otp');
        Route::post('profile/password/confirm', [ProfileController::class, 'confirmPasswordChange'])->name('profile.password.confirm');
    });
});
