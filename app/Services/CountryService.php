<?php

namespace App\Services;

use App\Models\Country;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CountryService
{
    /**
     * Fallback countries list in case external API is unreachable.
     */
    protected array $fallbackCountries = [
        ['code' => 'EG', 'name_en' => 'Egypt', 'name_ar' => 'مصر', 'flag_emoji' => '🇪🇬', 'flag_url' => 'https://flagcdn.com/w320/eg.png'],
        ['code' => 'SA', 'name_en' => 'Saudi Arabia', 'name_ar' => 'المملكة العربية السعودية', 'flag_emoji' => '🇸🇦', 'flag_url' => 'https://flagcdn.com/w320/sa.png'],
        ['code' => 'AE', 'name_en' => 'United Arab Emirates', 'name_ar' => 'الإمارات العربية المتحدة', 'flag_emoji' => '🇦🇪', 'flag_url' => 'https://flagcdn.com/w320/ae.png'],
        ['code' => 'KW', 'name_en' => 'Kuwait', 'name_ar' => 'الكويت', 'flag_emoji' => '🇰🇼', 'flag_url' => 'https://flagcdn.com/w320/kw.png'],
        ['code' => 'QA', 'name_en' => 'Qatar', 'name_ar' => 'قطر', 'flag_emoji' => '🇶🇦', 'flag_url' => 'https://flagcdn.com/w320/qa.png'],
        ['code' => 'BH', 'name_en' => 'Bahrain', 'name_ar' => 'البحرين', 'flag_emoji' => '🇧🇭', 'flag_url' => 'https://flagcdn.com/w320/bh.png'],
        ['code' => 'OM', 'name_en' => 'Oman', 'name_ar' => 'عمان', 'flag_emoji' => '🇴🇲', 'flag_url' => 'https://flagcdn.com/w320/om.png'],
        ['code' => 'JO', 'name_en' => 'Jordan', 'name_ar' => 'الأردن', 'flag_emoji' => '🇯🇴', 'flag_url' => 'https://flagcdn.com/w320/jo.png'],
        ['code' => 'PS', 'name_en' => 'Palestine', 'name_ar' => 'فلسطين', 'flag_emoji' => '🇵🇸', 'flag_url' => 'https://flagcdn.com/w320/ps.png'],
        ['code' => 'IQ', 'name_en' => 'Iraq', 'name_ar' => 'العراق', 'flag_emoji' => '🇮🇶', 'flag_url' => 'https://flagcdn.com/w320/iq.png'],
        ['code' => 'SY', 'name_en' => 'Syria', 'name_ar' => 'سوريا', 'flag_emoji' => '🇸🇾', 'flag_url' => 'https://flagcdn.com/w320/sy.png'],
        ['code' => 'LB', 'name_en' => 'Lebanon', 'name_ar' => 'لبنان', 'flag_emoji' => '🇱🇧', 'flag_url' => 'https://flagcdn.com/w320/lb.png'],
        ['code' => 'YE', 'name_en' => 'Yemen', 'name_ar' => 'اليمن', 'flag_emoji' => '🇾🇪', 'flag_url' => 'https://flagcdn.com/w320/ye.png'],
        ['code' => 'SD', 'name_en' => 'Sudan', 'name_ar' => 'السودان', 'flag_emoji' => '🇸🇩', 'flag_url' => 'https://flagcdn.com/w320/sd.png'],
        ['code' => 'LY', 'name_en' => 'Libya', 'name_ar' => 'ليبيا', 'flag_emoji' => '🇱🇾', 'flag_url' => 'https://flagcdn.com/w320/ly.png'],
        ['code' => 'TN', 'name_en' => 'Tunisia', 'name_ar' => 'تونس', 'flag_emoji' => '🇹🇳', 'flag_url' => 'https://flagcdn.com/w320/tn.png'],
        ['code' => 'DZ', 'name_en' => 'Algeria', 'name_ar' => 'الجزائر', 'flag_emoji' => '🇩🇿', 'flag_url' => 'https://flagcdn.com/w320/dz.png'],
        ['code' => 'MA', 'name_en' => 'Morocco', 'name_ar' => 'المغرب', 'flag_emoji' => '🇲🇦', 'flag_url' => 'https://flagcdn.com/w320/ma.png'],
        ['code' => 'US', 'name_en' => 'United States', 'name_ar' => 'الولايات المتحدة', 'flag_emoji' => '🇺🇸', 'flag_url' => 'https://flagcdn.com/w320/us.png'],
        ['code' => 'GB', 'name_en' => 'United Kingdom', 'name_ar' => 'المملكة المتحدة', 'flag_emoji' => '🇬🇧', 'flag_url' => 'https://flagcdn.com/w320/gb.png'],
        ['code' => 'DE', 'name_en' => 'Germany', 'name_ar' => 'ألمانيا', 'flag_emoji' => '🇩🇪', 'flag_url' => 'https://flagcdn.com/w320/de.png'],
        ['code' => 'FR', 'name_en' => 'France', 'name_ar' => 'فرنسا', 'flag_emoji' => '🇫🇷', 'flag_url' => 'https://flagcdn.com/w320/fr.png'],
        ['code' => 'TR', 'name_en' => 'Turkey', 'name_ar' => 'تركيا', 'flag_emoji' => '🇹🇷', 'flag_url' => 'https://flagcdn.com/w320/tr.png'],
        ['code' => 'CA', 'name_en' => 'Canada', 'name_ar' => 'كندا', 'flag_emoji' => '🇨🇦', 'flag_url' => 'https://flagcdn.com/w320/ca.png'],
    ];

    /**
     * Convert 2-letter ISO country code into Unicode flag emoji.
     */
    public static function codeToEmoji(string $code): string
    {
        $code = strtoupper(trim($code));
        if (strlen($code) !== 2) {
            return '🌐';
        }
        $first = 127397 + ord($code[0]);
        $second = 127397 + ord($code[1]);
        return mb_chr($first, 'UTF-8') . mb_chr($second, 'UTF-8');
    }

    /**
     * Fetch countries and sync to local DB.
     * Checks comprehensive local dataset first, or REST Countries API.
     */
    public function syncCountries(): int
    {
        $count = 0;

        // 1. Check comprehensive local dataset (over 200 world countries)
        $localDataPath = database_path('data/countries.json');
        if (file_exists($localDataPath)) {
            $json = json_decode(file_get_contents($localDataPath), true);
            if (is_array($json) && count($json) > 0) {
                foreach ($json as $item) {
                    $code = strtoupper($item['code'] ?? '');
                    if (!$code) {
                        continue;
                    }

                    Country::updateOrCreate(
                        ['code' => $code],
                        [
                            'name_en' => $item['name_en'] ?? $code,
                            'name_ar' => $item['name_ar'] ?? $item['name_en'] ?? $code,
                            'flag_emoji' => $item['flag_emoji'] ?? self::codeToEmoji($code),
                            'flag_url' => $item['flag_url'] ?? "https://flagcdn.com/w320/" . strtolower($code) . ".png",
                        ]
                    );
                    $count++;
                }

                return $count;
            }
        }

        try {
            $response = Http::timeout(10)->get('https://restcountries.com/v3.1/all?fields=name,cca2,flag,flags,translations');

            if ($response->successful()) {
                $countries = $response->json();

                foreach ($countries as $item) {
                    $code = strtoupper($item['cca2'] ?? '');
                    if (!$code) {
                        continue;
                    }

                    $nameEn = $item['name']['common'] ?? $code;
                    $nameAr = $item['translations']['ara']['common'] ?? $nameEn;
                    $flagEmoji = $item['flag'] ?? null;
                    $flagUrl = $item['flags']['svg'] ?? $item['flags']['png'] ?? "https://flagcdn.com/w320/" . strtolower($code) . ".png";

                    Country::updateOrCreate(
                        ['code' => $code],
                        [
                            'name_en' => $nameEn,
                            'name_ar' => $nameAr,
                            'flag_emoji' => $flagEmoji,
                            'flag_url' => $flagUrl,
                        ]
                    );

                    $count++;
                }

                return $count;
            }
        } catch (\Throwable $e) {
            Log::warning('REST Countries API sync failed, using fallback list: ' . $e->getMessage());
        }

        // Fallback sync
        foreach ($this->fallbackCountries as $item) {
            Country::updateOrCreate(
                ['code' => $item['code']],
                [
                    'name_en' => $item['name_en'],
                    'name_ar' => $item['name_ar'],
                    'flag_emoji' => $item['flag_emoji'],
                    'flag_url' => $item['flag_url'],
                ]
            );
            $count++;
        }

        return $count;
    }

    /**
     * Resolve IP address (or request headers) to Country model.
     */
    public function resolveIpCountry(?string $ip, ?\Illuminate\Http\Request $request = null): ?Country
    {
        // 1. Check Cloudflare / CDN headers if available (0ms latency, 100% accurate in production)
        if ($request) {
            $headerCountry = $request->header('CF-IPCountry') 
                ?? $request->header('X-Country-Code') 
                ?? $request->header('CloudFront-Viewer-Country');

            if ($headerCountry && strlen($headerCountry) === 2 && strtoupper($headerCountry) !== 'XX') {
                $country = Country::where('code', strtoupper($headerCountry))->first();
                if ($country) {
                    return $country;
                }
            }

            // Also check if frontend explicitly passed country_code
            if ($request->filled('country_code')) {
                $country = Country::where('code', strtoupper($request->input('country_code')))->first();
                if ($country) {
                    return $country;
                }
            }
        }

        // 2. In local/development or for private/loopback IPs, default to Egypt (EG) for seamless testing
        if (empty($ip) || in_array($ip, ['127.0.0.1', '::1', 'localhost']) || filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
            return Country::where('code', 'EG')->first();
        }

        // 3. Try external free IP Geolocation API with short timeout
        try {
            $response = Http::withoutVerifying()->timeout(2)->get("http://ip-api.com/json/{$ip}?fields=status,countryCode");

            if ($response->successful()) {
                $data = $response->json();
                if (($data['status'] ?? '') === 'success' && !empty($data['countryCode'])) {
                    $code = strtoupper($data['countryCode']);
                    $country = Country::where('code', $code)->first();
                    if ($country) {
                        return $country;
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::info('External IP resolution skipped/timed out: ' . $e->getMessage());
        }

        // 4. Default fallback if in local development
        if (app()->environment('local')) {
            return Country::where('code', 'EG')->first();
        }

        return null;
    }
}
