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
        // 1. Custom Orders table
        Schema::table('custom_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('custom_orders', 'exchange_rate_to_bdt')) {
                $table->decimal('exchange_rate_to_bdt', 10, 2)->nullable()->default(120.00)->after('currency');
            }
        });

        // 2. Custom Order Milestones table
        Schema::table('custom_order_milestones', function (Blueprint $table) {
            if (!Schema::hasColumn('custom_order_milestones', 'exchange_rate_to_bdt')) {
                $table->decimal('exchange_rate_to_bdt', 10, 2)->nullable()->after('amount');
            }
        });

        // 3. SaaS Subscriptions table
        Schema::table('saas_subscriptions', function (Blueprint $table) {
            if (!Schema::hasColumn('saas_subscriptions', 'exchange_rate_to_bdt')) {
                $table->decimal('exchange_rate_to_bdt', 10, 2)->nullable()->default(120.00)->after('currency');
            }
        });

        // 4. Subscription Invoices table
        Schema::table('subscription_invoices', function (Blueprint $table) {
            if (!Schema::hasColumn('subscription_invoices', 'exchange_rate_to_bdt')) {
                $table->decimal('exchange_rate_to_bdt', 10, 2)->nullable()->after('currency');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('custom_orders', function (Blueprint $table) {
            if (Schema::hasColumn('custom_orders', 'exchange_rate_to_bdt')) {
                $table->dropColumn('exchange_rate_to_bdt');
            }
        });

        Schema::table('custom_order_milestones', function (Blueprint $table) {
            if (Schema::hasColumn('custom_order_milestones', 'exchange_rate_to_bdt')) {
                $table->dropColumn('exchange_rate_to_bdt');
            }
        });

        Schema::table('saas_subscriptions', function (Blueprint $table) {
            if (Schema::hasColumn('saas_subscriptions', 'exchange_rate_to_bdt')) {
                $table->dropColumn('exchange_rate_to_bdt');
            }
        });

        Schema::table('subscription_invoices', function (Blueprint $table) {
            if (Schema::hasColumn('subscription_invoices', 'exchange_rate_to_bdt')) {
                $table->dropColumn('exchange_rate_to_bdt');
            }
        });
    }
};
