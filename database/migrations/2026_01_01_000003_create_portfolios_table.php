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
        Schema::create('portfolios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('short_description', 500)->nullable();
            $table->longText('description')->nullable();
            $table->string('thumbnail')->nullable();
            $table->json('gallery_images')->nullable(); // Array of image paths for masonry gallery
            $table->enum('item_type', ['direct_link', 'in_app_link'])->default('in_app_link');
            $table->string('direct_url')->nullable();
            $table->string('youtube_video_url')->nullable();
            $table->string('client_name')->nullable();
            $table->string('completion_date')->nullable();
            $table->json('tech_stacks')->nullable(); // Array of technologies e.g. ['React', 'Laravel', 'Tailwind']
            $table->unsignedBigInteger('views_count')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('portfolios');
    }
};
