<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Advertisement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminAndAdSeeder extends Seeder
{
    public function run(): void
    {
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
    }
}
