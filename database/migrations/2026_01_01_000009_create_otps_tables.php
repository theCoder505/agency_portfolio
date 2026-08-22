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
        Schema::create('admin_otps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('admins')->cascadeOnDelete();
            $table->string('type'); // 'email_change' or 'password_change'
            $table->string('new_value')->nullable(); // new email or temporary placeholder
            $table->string('otp_code', 10);
            $table->timestamp('expires_at');
            $table->timestamps();
        });

        Schema::create('contact_otps', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('otp_code', 10);
            $table->timestamp('expires_at');
            $table->boolean('verified')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contact_otps');
        Schema::dropIfExists('admin_otps');
    }
};
