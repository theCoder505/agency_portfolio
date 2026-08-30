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
        Schema::table('saas_subscriptions', function (Blueprint $table) {
            if (!Schema::hasColumn('saas_subscriptions', 'requested_domain')) {
                $table->string('requested_domain')->nullable()->after('payment_notes');
            }
            if (!Schema::hasColumn('saas_subscriptions', 'requested_subdomain')) {
                $table->string('requested_subdomain')->nullable()->after('requested_domain');
            }
        });

        // Initialize requested_domain and requested_subdomain for existing records
        DB::table('saas_subscriptions')
            ->whereNull('requested_domain')
            ->whereNotNull('domain')
            ->update(['requested_domain' => DB::raw('`domain`')]);

        DB::table('saas_subscriptions')
            ->whereNull('requested_subdomain')
            ->whereNotNull('subdomain')
            ->update(['requested_subdomain' => DB::raw('`subdomain`')]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('saas_subscriptions', function (Blueprint $table) {
            $table->dropColumn(['requested_domain', 'requested_subdomain']);
        });
    }
};
