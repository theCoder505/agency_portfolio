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
        Schema::table('saas_products', function (Blueprint $table) {
            if (!Schema::hasColumn('saas_products', 'primary_domain')) {
                $table->string('primary_domain')->nullable()->default('codeventure.app')->after('slug');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('saas_products', function (Blueprint $table) {
            $table->dropColumn('primary_domain');
        });
    }
};
