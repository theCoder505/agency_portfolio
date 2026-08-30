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
        if (Schema::hasTable('saas_products') && !Schema::hasColumn('saas_products', 'currency')) {
            Schema::table('saas_products', function (Blueprint $table) {
                $table->string('currency', 10)->default('BDT')->after('yearly_price');
            });
        }

        if (Schema::hasTable('custom_orders')) {
            Schema::table('custom_orders', function (Blueprint $table) {
                $table->string('currency', 10)->default('BDT')->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('saas_products') && Schema::hasColumn('saas_products', 'currency')) {
            Schema::table('saas_products', function (Blueprint $table) {
                $table->dropColumn('currency');
            });
        }
    }
};
