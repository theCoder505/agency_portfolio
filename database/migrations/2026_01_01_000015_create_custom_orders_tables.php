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
        Schema::create('custom_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique()->index();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->string('category')->nullable();
            $table->decimal('estimated_budget', 12, 2)->nullable();
            $table->decimal('agreed_price', 12, 2)->nullable();
            $table->string('currency', 10)->default('USD');
            $table->date('target_deadline')->nullable();
            $table->longText('requirements');
            $table->text('reference_links')->nullable();
            $table->json('attachments')->nullable();
            $table->enum('status', [
                'pending',
                'accepted',
                'in_progress',
                'completed',
                'denied',
                'cancelled',
            ])->default('pending')->index();
            $table->text('admin_notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->string('github_repo_url')->nullable();
            $table->string('drive_link')->nullable();
            $table->string('live_demo_url')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('custom_order_milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('custom_order_id')->constrained('custom_orders')->onDelete('cascade');
            $table->integer('order')->default(1);
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('amount', 12, 2);
            $table->date('due_date')->nullable();
            $table->enum('payment_status', [
                'waiting-client-to-pay',
                'paid-and-bank-processing',
                'collected',
            ])->default('waiting-client-to-pay')->index();
            
            // Payment settlement info set by Admin
            $table->string('payment_method')->nullable(); // e.g., Payoneer, PayPal, Bank Transfer, bKash, etc.
            $table->text('payment_details')->nullable(); // Account number, email, PayPal link, Payoneer link, IBAN, SWIFT
            $table->text('payment_instructions')->nullable();
            
            // Payment submission info filled by Client
            $table->string('client_payment_method')->nullable();
            $table->string('client_trx_id')->nullable();
            $table->string('client_sender_info')->nullable();
            $table->string('client_payment_proof')->nullable(); // File path
            $table->text('client_payment_notes')->nullable();
            $table->timestamp('client_paid_at')->nullable();
            $table->timestamp('collected_at')->nullable();
            
            // Deliverables released for this milestone
            $table->string('github_repo_url')->nullable();
            $table->string('drive_link')->nullable();
            $table->string('live_demo_url')->nullable();
            $table->text('deliverable_notes')->nullable();
            $table->boolean('is_deliverable_unlocked')->default(true);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('custom_order_milestones');
        Schema::dropIfExists('custom_orders');
    }
};
