<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Admin;
use App\Models\Advertisement;
use Illuminate\Support\Facades\Hash;

if (!Admin::where('username', 'admin')->exists()) {
    Admin::create([
        'username' => 'admin',
        'password' => Hash::make('password')
    ]);
}

if (Advertisement::count() == 0) {
    Advertisement::create([
        'title' => 'Sale on Islamic Books!',
        'image_path' => 'images/cat_spiritual.png',
        'url' => 'https://example.com/sale',
        'start_time' => now(),
        'end_time' => now()->addDays(7),
        'is_active' => true,
    ]);
}
echo "Database seeded with default Admin and Advertisement.\n";
