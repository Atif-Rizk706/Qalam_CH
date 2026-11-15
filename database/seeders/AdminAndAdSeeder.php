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
        $existingAdmin = Admin::where('email', 'admin@admin.com')
            ->orWhere('username', 'admin')
            ->first();

        if ($existingAdmin) {
            $existingAdmin->update([
                'name' => $existingAdmin->name ?? 'مدير النظام',
                'email' => 'admin@admin.com',
                'username' => 'admin',
                'password' => Hash::make('password'),
            ]);
        } else {
            Admin::create([
                'name' => 'مدير النظام',
                'email' => 'admin@admin.com',
                'username' => 'admin',
                'password' => Hash::make('password'),
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
