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
        Schema::create('site_visitors', function (Blueprint $table) {
            $table->id();
            $table->string('ip_address', 45)->index();
            $table->foreignId('country_id')->nullable()->constrained('countries')->nullOnDelete();
            $table->string('user_agent')->nullable();
            $table->unsignedBigInteger('visits_count')->default(1);
            $table->timestamp('last_visited_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_visitors');
    }
};

