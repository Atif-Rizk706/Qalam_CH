<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        // Add production specific seeders here, e.g., essential roles, initial admin, etc.
        $this->call([
            AdminAndAdSeeder::class,
        ]);
    }
}
