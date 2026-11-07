<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CountryResource;
use App\Models\Country;
use App\Services\CountryService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class CountryController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of all countries.
     */
    public function index(Request $request)
    {
        $query = Country::query();

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where('name_ar', 'like', "%{$search}%")
                ->orWhere('name_en', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%");
        }

        $countries = $query->orderBy('name_ar', 'asc')->get();

        return $this->successResponse(
            CountryResource::collection($countries),
            'Countries retrieved successfully'
        );
    }

    /**
     * Display a single country.
     */
    public function show($id)
    {
        $country = Country::with('authors')->findOrFail($id);

        return $this->successResponse(
            new CountryResource($country),
            'Country retrieved successfully'
        );
    }

    /**
     * Sync countries from REST Countries API.
     */
    public function sync(CountryService $service)
    {
        $count = $service->syncCountries();

        return $this->successResponse(
            ['synced_countries_count' => $count],
            'Countries synced successfully from REST Countries API'
        );
    }
}

