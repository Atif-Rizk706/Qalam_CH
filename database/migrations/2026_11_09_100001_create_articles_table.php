<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('short_description')->nullable(); // الوصف القصير (البارز)
            $table->longText('body');                        // المحتوى الكامل
            $table->text('excerpt')->nullable();             // المقتطف/الاقتباس في الآخر
            $table->string('cover_image_path')->nullable();  // صورة الغلاف
            $table->string('file_path')->nullable();         // ملف مرفق (PDF)
            $table->unsignedInteger('read_time')->default(0); // وقت القراءة بالدقائق
            $table->unsignedBigInteger('views_count')->default(0); // عدد القراءات
            $table->boolean('is_published')->default(false); // هل منشور؟
            $table->timestamp('published_at')->nullable();   // تاريخ النشر

            // Relations
            $table->foreignId('author_id')->constrained('authors')->cascadeOnDelete();
            $table->foreignId('type_id')->nullable()->constrained('article_types')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};

