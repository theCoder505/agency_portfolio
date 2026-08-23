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
        Schema::create('blogs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('short_description')->nullable();
            $table->longText('content')->nullable(); // Rich Text description / content
            $table->string('thumbnail')->nullable();
            $table->string('author_name')->default('CodeVenture Editorial Team');
            $table->string('author_role')->default('Lead Architect');
            $table->string('author_avatar')->nullable();
            $table->json('tags')->nullable();
            $table->unsignedBigInteger('reads_count')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index(['is_published', 'published_at']);
            $table->index(['is_featured', 'order']);
            $table->index('reads_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blogs');
    }
};
