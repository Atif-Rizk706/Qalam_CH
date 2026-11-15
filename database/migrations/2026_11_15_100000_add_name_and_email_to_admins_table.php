<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            if (!Schema::hasColumn('admins', 'name')) {
                $table->string('name')->nullable()->after('id');
            }
            if (!Schema::hasColumn('admins', 'email')) {
                $table->string('email')->unique()->nullable()->after('name');
            }
            if (Schema::hasColumn('admins', 'username')) {
                $table->string('username')->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            if (Schema::hasColumn('admins', 'email')) {
                $table->dropColumn('email');
            }
            if (Schema::hasColumn('admins', 'name')) {
                $table->dropColumn('name');
            }
        });
    }
};

