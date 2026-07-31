<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use App\Traits\ApiResponse;
use App\Http\Resources\AdvertisementResource;
use Illuminate\Http\Request;

class AdvertisementController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Advertisement::latest();

        if ($request->has('search') && $request->search != '') {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('url', 'like', "%{$searchTerm}%");
            });
        }

        $advertisements = $query->paginate(15);

        return $this->successResponse(
            AdvertisementResource::collection($advertisements)->response()->getData(true),
            'Advertisements retrieved successfully',
            200
        );
    }

    public function show($id)
    {
        $advertisement = Advertisement::findOrFail($id);

        return $this->successResponse(
            new AdvertisementResource($advertisement),
            'Advertisement retrieved successfully',
            200
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'image_path' => 'required|string',
            'url' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after_or_equal:start_time',
            'is_active' => 'boolean',
        ]);

        $advertisement = Advertisement::create($validated);

        return $this->successResponse(new AdvertisementResource($advertisement), 'Advertisement created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $advertisement = Advertisement::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'image_path' => 'sometimes|string',
            'url' => 'nullable|string',
            'start_time' => 'sometimes|date',
            'end_time' => 'sometimes|date|after_or_equal:start_time',
            'is_active' => 'boolean',
        ]);

        $advertisement->update($validated);

        return $this->successResponse(new AdvertisementResource($advertisement), 'Advertisement updated successfully', 200);
    }

    public function destroy($id)
    {
        $advertisement = Advertisement::findOrFail($id);
        $advertisement->delete();

        return $this->successResponse(null, 'Advertisement deleted successfully', 200);
    }
}
