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
        Schema::create('saas_products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('tagline')->nullable();
            $table->text('description')->nullable();
            $table->string('icon')->nullable(); // Lucide icon name or image path
            $table->string('badge')->nullable(); // e.g. "Most Popular", "Enterprise", "Starter"
            $table->decimal('monthly_price', 10, 2)->default(0);
            $table->decimal('half_yearly_price', 10, 2)->default(0);
            $table->decimal('yearly_price', 10, 2)->default(0);
            $table->boolean('has_monthly')->default(true);
            $table->boolean('has_half_yearly')->default(true);
            $table->boolean('has_yearly')->default(true);
            $table->json('features')->nullable(); // Array of features
            $table->integer('order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saas_products');
    }
};
