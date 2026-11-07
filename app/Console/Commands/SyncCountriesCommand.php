<?php

namespace App\Console\Commands;

use App\Services\CountryService;
use Illuminate\Console\Command;

class SyncCountriesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'countries:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync countries, flags, and names from REST Countries API';

    /**
     * Execute the console command.
     */
    public function handle(CountryService $service): int
    {
        $this->info('Starting countries synchronization...');

        $count = $service->syncCountries();

        $this->info("Countries synchronization complete! Total countries: {$count}");

        return Command::SUCCESS;
    }
}

