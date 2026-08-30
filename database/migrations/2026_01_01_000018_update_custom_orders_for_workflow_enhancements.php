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
        Schema::table('custom_orders', function (Blueprint $table) {
            $table->decimal('proposed_budget', 12, 2)->nullable()->after('agreed_price');
            $table->string('proposed_currency', 10)->nullable()->after('proposed_budget');
            $table->text('proposed_budget_notes')->nullable()->after('proposed_currency');
            $table->timestamp('proposed_budget_at')->nullable()->after('proposed_budget_notes');
            $table->enum('budget_update_status', ['none', 'pending', 'approved', 'rejected'])->default('none')->after('proposed_budget_at');
        });

        Schema::table('custom_order_milestones', function (Blueprint $table) {
            $table->decimal('refund_amount', 12, 2)->nullable()->after('client_paid_at');
            $table->string('refund_trx_id')->nullable()->after('refund_amount');
            $table->text('refund_reason')->nullable()->after('refund_trx_id');
            $table->timestamp('refunded_at')->nullable()->after('refund_reason');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->onDelete('set null');
            $table->foreignId('custom_order_id')->nullable()->after('user_id')->constrained('custom_orders')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['custom_order_id']);
            $table->dropColumn(['user_id', 'custom_order_id']);
        });

        Schema::table('custom_order_milestones', function (Blueprint $table) {
            $table->dropColumn([
                'refund_amount',
                'refund_trx_id',
                'refund_reason',
                'refunded_at',
            ]);
        });

        Schema::table('custom_orders', function (Blueprint $table) {
            $table->dropColumn([
                'proposed_budget',
                'proposed_currency',
                'proposed_budget_notes',
                'proposed_budget_at',
                'budget_update_status',
            ]);
        });
    }
};
