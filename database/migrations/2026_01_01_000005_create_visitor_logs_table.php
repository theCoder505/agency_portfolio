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
        Schema::create('visitor_logs', function (Blueprint $table) {
            $table->id();
            $table->string('ip_address')->nullable();
            $table->string('url')->nullable();
            $table->string('method', 10)->default('GET');
            $table->text('user_agent')->nullable();
            $table->string('device_type')->default('Desktop'); // Desktop, Mobile, Tablet
            $table->string('browser')->default('Chrome');      // Chrome, Firefox, Safari, Edge, etc.
            $table->string('platform')->default('Windows');    // Windows, macOS, Linux, Android, iOS
            $table->string('referer')->nullable();
            $table->foreignId('portfolio_id')->nullable()->constrained('portfolios')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visitor_logs');
    }
};
