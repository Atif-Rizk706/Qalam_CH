<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

if (!Schema::hasTable('admins')) {
    Schema::create('admins', function (Blueprint $table) {
        $table->id();
        $table->string('username')->unique();
        $table->string('password');
        $table->rememberToken();
        $table->timestamps();
    });
}

if (!Schema::hasTable('advertisements')) {
    Schema::create('advertisements', function (Blueprint $table) {
        $table->id();
        $table->string('title');
        $table->string('image_path');
        $table->string('url')->nullable();
        $table->timestamp('start_time')->nullable();
        $table->timestamp('end_time')->nullable();
        $table->boolean('is_active')->default(true);
        $table->timestamps();
    });
}

echo "Tables created successfully.\n";
