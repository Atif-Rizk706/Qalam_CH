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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique()->index();
            $table->longText('value')->nullable();
            $table->string('display_name')->nullable(); // الاسم المعروض بالعربية
            $table->string('group')->default('general'); // التصنيف: contact, social, general
            $table->string('type')->default('text'); // نوع الحقل: text, textarea, email, url
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};

