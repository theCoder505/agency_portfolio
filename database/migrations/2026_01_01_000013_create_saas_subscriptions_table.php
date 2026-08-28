<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('saas_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique(); // e.g. ORD-2026-8921
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('saas_product_id')->constrained('saas_products')->onDelete('cascade');
            $table->enum('billing_cycle', ['monthly', 'half_yearly', 'yearly'])->default('monthly');
            $table->decimal('amount', 10, 2)->default(0);
            $table->string('currency', 10)->default('BDT');
            $table->enum('status', ['pending', 'active', 'expired', 'rejected', 'cancelled'])->default('pending');
            
            // Payment Submission Data
            $table->string('payment_method')->default('bkash'); // bkash, nagad, rocket, manual_bank, etc.
            $table->string('sender_number')->nullable(); // Customer's bKash/Nagad sender phone number
            $table->string('transaction_id')->nullable(); // TrxID provided by customer
            $table->text('payment_notes')->nullable(); // Customer notes at checkout
            
            // Service & Deployment Details
            $table->string('domain')->nullable(); // e.g. custom client domain
            $table->string('subdomain')->nullable(); // e.g. app.codeventure.tech
            $table->text('admin_notes')->nullable(); // Credentials, login info, setup notes for customer
            
            // Dates & Duration
            $table->dateTime('starts_at')->nullable(); // Start of active subscription
            $table->dateTime('expires_at')->nullable(); // Deadline / Expiry date of subscription
            $table->dateTime('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('admins')->onDelete('set null');
            $table->text('rejection_reason')->nullable();
            $table->dateTime('last_renewed_at')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saas_subscriptions');
    }
};
