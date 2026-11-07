<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CountryResource;
use App\Models\Country;
use App\Models\SiteVisitor;
use App\Services\CountryService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VisitorController extends Controller
{
    use ApiResponse;

    /**
     * Track a site visit (anonymous or logged in).
     */
    public function track(Request $request, CountryService $countryService)
    {
        $ip = $request->ip();
        $userAgent = $request->userAgent();

        // Find existing visitor by IP
        $visitor = SiteVisitor::where('ip_address', $ip)->first();

        if ($visitor) {
            // Update existing visitor
            $visitor->increment('visits_count');
            $visitor->update([
                'last_visited_at' => now(),
                'user_agent' => $userAgent,
            ]);

            // If country was not set previously, try resolving it
            if (!$visitor->country_id) {
                $country = $countryService->resolveIpCountry($ip, $request);
                if ($country) {
                    $visitor->update(['country_id' => $country->id]);
                }
            } else {
                $country = $visitor->country;
            }
        } else {
            // New visitor: resolve IP to country
            $country = $countryService->resolveIpCountry($ip, $request);

            $visitor = SiteVisitor::create([
                'ip_address' => $ip,
                'country_id' => $country?->id,
                'user_agent' => $userAgent,
                'visits_count' => 1,
                'last_visited_at' => now(),
            ]);
        }

        return $this->successResponse([
            'ip' => $ip,
            'visits_count' => $visitor->visits_count,
            'country' => $country ? new CountryResource($country) : null,
        ], 'Visit tracked successfully');
    }

    /**
     * Get visitor counts aggregated by country.
     */
    public function stats()
    {
        // Aggregate unique visitors and total visits grouped by country
        $stats = DB::table('site_visitors')
            ->leftJoin('countries', 'site_visitors.country_id', '=', 'countries.id')
            ->select(
                DB::raw('COALESCE(countries.id, 0) as country_id'),
                DB::raw('COALESCE(countries.code, "UNKNOWN") as code'),
                DB::raw('COALESCE(countries.name_ar, "غير معروف") as country_name_ar'),
                DB::raw('COALESCE(countries.name_en, "Unknown") as country_name_en'),
                DB::raw('COALESCE(countries.flag_emoji, "🌐") as flag'),
                DB::raw('COALESCE(countries.flag_url, "") as flag_url'),
                DB::raw('COUNT(site_visitors.id) as unique_visitors'),
                DB::raw('SUM(site_visitors.visits_count) as total_visits')
            )
            ->groupBy('countries.id', 'countries.code', 'countries.name_ar', 'countries.name_en', 'countries.flag_emoji', 'countries.flag_url')
            ->orderByDesc('unique_visitors')
            ->get();

        $totalUniqueVisitors = SiteVisitor::count();
        $totalPageViews = SiteVisitor::sum('visits_count');

        return $this->successResponse([
            'summary' => [
                'total_unique_visitors' => $totalUniqueVisitors,
                'total_page_views' => (int) $totalPageViews,
            ],
            'by_country' => $stats,
        ], 'Visitor statistics retrieved successfully');
    }
}
