<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        // Add production specific seeders here, e.g., essential roles, initial admin, etc.
        $this->call([
            CountrySeeder::class,
            AdminAndAdSeeder::class,
            ArticleTypeSeeder::class,
            ArticleSeeder::class,
            SettingSeeder::class,
            VisitorSeeder::class,
        ]);
    }
}
