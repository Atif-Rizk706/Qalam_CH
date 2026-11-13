<?php

namespace Database\Seeders;

use App\Models\Country;
use App\Models\SiteVisitor;
use Illuminate\Database\Seeder;

class VisitorSeeder extends Seeder
{
    public function run(): void
    {
        $userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:129.0) Gecko/20100101 Firefox/129.0',
            'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/127.0.6533.77 Mobile/15E148 Safari/604.1',
        ];

        // Country distribution config: [country_code => [visitor_count, min_visits, max_visits, ip_prefix]]
        $countryDistribution = [
            'EG' => ['visitors' => 35, 'min_visits' => 8,  'max_visits' => 45, 'subnet' => '156.192'], // Egypt
            'SA' => ['visitors' => 20, 'min_visits' => 5,  'max_visits' => 30, 'subnet' => '212.118'], // Saudi Arabia
            'US' => ['visitors' => 18, 'min_visits' => 4,  'max_visits' => 28, 'subnet' => '104.28'],  // USA
            'LB' => ['visitors' => 14, 'min_visits' => 5,  'max_visits' => 25, 'subnet' => '185.112'], // Lebanon
            'SY' => ['visitors' => 12, 'min_visits' => 3,  'max_visits' => 20, 'subnet' => '195.138'], // Syria
            'JO' => ['visitors' => 10, 'min_visits' => 4,  'max_visits' => 22, 'subnet' => '213.139'], // Jordan
            'GB' => ['visitors' => 10, 'min_visits' => 3,  'max_visits' => 18, 'subnet' => '82.165'],  // United Kingdom
            'AE' => ['visitors' => 9,  'min_visits' => 4,  'max_visits' => 20, 'subnet' => '94.200'],  // UAE
            'CA' => ['visitors' => 8,  'min_visits' => 3,  'max_visits' => 16, 'subnet' => '142.250'], // Canada
            'DE' => ['visitors' => 8,  'min_visits' => 3,  'max_visits' => 15, 'subnet' => '85.214'],  // Germany
            'AU' => ['visitors' => 7,  'min_visits' => 2,  'max_visits' => 14, 'subnet' => '139.130'], // Australia
            'IQ' => ['visitors' => 7,  'min_visits' => 2,  'max_visits' => 12, 'subnet' => '185.23'],  // Iraq
            'FR' => ['visitors' => 6,  'min_visits' => 2,  'max_visits' => 10, 'subnet' => '163.172'], // France
            'KW' => ['visitors' => 5,  'min_visits' => 3,  'max_visits' => 15, 'subnet' => '188.70'],  // Kuwait
            'IT' => ['visitors' => 4,  'min_visits' => 2,  'max_visits' => 8,  'subnet' => '151.100'], // Italy
            'SD' => ['visitors' => 4,  'min_visits' => 1,  'max_visits' => 6,  'subnet' => '41.130'],  // Sudan
        ];

        $totalSeeded = 0;

        foreach ($countryDistribution as $code => $cfg) {
            $country = Country::where('code', $code)->first();

            for ($i = 1; $i <= $cfg['visitors']; $i++) {
                $ip = sprintf('%s.%d.%d', $cfg['subnet'], rand(1, 254), rand(1, 254));
                $visits = rand($cfg['min_visits'], $cfg['max_visits']);
                $agent = $userAgents[array_rand($userAgents)];
                $lastVisited = now()->subMinutes(rand(5, 43200)); // Within the last 30 days

                SiteVisitor::updateOrCreate(
                    ['ip_address' => $ip],
                    [
                        'country_id'      => $country?->id,
                        'visits_count'    => $visits,
                        'user_agent'      => $agent,
                        'last_visited_at' => $lastVisited,
                    ]
                );

                $totalSeeded++;
            }
        }

        $this->command?->info("Visitor analytics seeded successfully: {$totalSeeded} visitors across " . count($countryDistribution) . " countries.");
    }
}

