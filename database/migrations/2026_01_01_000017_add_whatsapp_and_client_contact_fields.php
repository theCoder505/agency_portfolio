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
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'whatsapp_number')) {
                    $table->string('whatsapp_number', 40)->nullable()->after('phone');
                }
            });
        }

        if (Schema::hasTable('custom_orders')) {
            Schema::table('custom_orders', function (Blueprint $table) {
                if (!Schema::hasColumn('custom_orders', 'client_whatsapp')) {
                    $table->string('client_whatsapp', 40)->nullable()->after('currency');
                }
                if (!Schema::hasColumn('custom_orders', 'client_email')) {
                    $table->string('client_email', 255)->nullable()->after('client_whatsapp');
                }
            });
        }

        if (Schema::hasTable('saas_subscriptions')) {
            Schema::table('saas_subscriptions', function (Blueprint $table) {
                if (!Schema::hasColumn('saas_subscriptions', 'client_whatsapp')) {
                    $table->string('client_whatsapp', 40)->nullable()->after('sender_number');
                }
                if (!Schema::hasColumn('saas_subscriptions', 'client_email')) {
                    $table->string('client_email', 255)->nullable()->after('client_whatsapp');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (Schema::hasColumn('users', 'whatsapp_number')) {
                    $table->dropColumn('whatsapp_number');
                }
            });
        }

        if (Schema::hasTable('custom_orders')) {
            Schema::table('custom_orders', function (Blueprint $table) {
                if (Schema::hasColumn('custom_orders', 'client_whatsapp')) {
                    $table->dropColumn('client_whatsapp');
                }
                if (Schema::hasColumn('custom_orders', 'client_email')) {
                    $table->dropColumn('client_email');
                }
            });
        }

        if (Schema::hasTable('saas_subscriptions')) {
            Schema::table('saas_subscriptions', function (Blueprint $table) {
                if (Schema::hasColumn('saas_subscriptions', 'client_whatsapp')) {
                    $table->dropColumn('client_whatsapp');
                }
                if (Schema::hasColumn('saas_subscriptions', 'client_email')) {
                    $table->dropColumn('client_email');
                }
            });
        }
    }
};
