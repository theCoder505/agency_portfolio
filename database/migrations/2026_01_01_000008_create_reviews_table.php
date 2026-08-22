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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->string('author_name');
            $table->string('author_avatar')->nullable();
            $table->string('author_role')->nullable();
            $table->string('company')->nullable();
            $table->unsignedTinyInteger('rating')->default(5); // 1 to 5
            $table->string('review_title');
            $table->text('review_text');
            $table->string('source')->default('trustpilot'); // trustpilot, clutch, direct
            $table->date('review_date')->nullable();
            $table->boolean('verified_purchase')->default(true);
            $table->boolean('is_featured')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
