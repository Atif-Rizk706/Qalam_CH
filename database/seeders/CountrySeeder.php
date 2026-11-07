<?php

namespace Database\Seeders;

use App\Services\CountryService;
use Illuminate\Database\Seeder;

class CountrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $service = app(CountryService::class);
        $count = $service->syncCountries();

        $this->command->info("Successfully synced {$count} countries.");
    }
}

