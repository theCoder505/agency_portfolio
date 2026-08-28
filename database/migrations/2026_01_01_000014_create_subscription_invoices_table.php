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
        Schema::create('subscription_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique(); // e.g. INV-2026-0012
            $table->foreignId('subscription_id')->constrained('saas_subscriptions')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('billing_cycle', ['monthly', 'half_yearly', 'yearly'])->default('monthly');
            $table->decimal('amount', 10, 2)->default(0);
            $table->string('currency', 10)->default('BDT');
            $table->string('payment_method')->default('bkash');
            $table->string('sender_number')->nullable();
            $table->string('transaction_id')->nullable();
            $table->enum('type', ['initial', 'renewal'])->default('initial');
            $table->enum('status', ['pending', 'paid', 'rejected'])->default('pending');
            $table->date('period_start')->nullable();
            $table->date('period_end')->nullable();
            $table->dateTime('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_invoices');
    }
};
