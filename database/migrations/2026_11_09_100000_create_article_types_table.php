<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('article_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');           // e.g. "مقال", "دراسة", "تأمل"
            $table->string('slug')->unique(); // e.g. "article", "study", "meditation"
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('article_types');
    }
};

