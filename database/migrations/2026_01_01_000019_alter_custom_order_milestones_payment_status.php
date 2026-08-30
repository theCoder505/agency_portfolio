<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modify payment_status column to VARCHAR(50) or expanded ENUM to support 'refunded'
        try {
            DB::statement("ALTER TABLE `custom_order_milestones` MODIFY COLUMN `payment_status` VARCHAR(50) NOT NULL DEFAULT 'waiting-client-to-pay'");
        } catch (\Throwable $e) {
            Schema::table('custom_order_milestones', function (Blueprint $table) {
                $table->string('payment_status', 50)->default('waiting-client-to-pay')->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            DB::statement("ALTER TABLE `custom_order_milestones` MODIFY COLUMN `payment_status` ENUM('waiting-client-to-pay', 'paid-and-bank-processing', 'collected', 'refunded') NOT NULL DEFAULT 'waiting-client-to-pay'");
        } catch (\Throwable $e) {
            //
        }
    }
};
