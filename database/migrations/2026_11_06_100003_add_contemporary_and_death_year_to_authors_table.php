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
        Schema::table('authors', function (Blueprint $table) {
            $table->boolean('is_contemporary')->default(false)->after('bio');
            $table->string('death_year', 50)->nullable()->after('is_contemporary');
            $table->string('birth_year', 50)->nullable()->after('death_year');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('authors', function (Blueprint $table) {
            $table->dropColumn(['is_contemporary', 'death_year', 'birth_year']);
        });
    }
};

