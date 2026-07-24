<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use Illuminate\Http\Request;

class AdvertisementController extends Controller
{
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

        return response()->json(['message' => 'Advertisement created successfully', 'data' => $advertisement], 201);
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

        return response()->json(['message' => 'Advertisement updated successfully', 'data' => $advertisement]);
    }

    public function destroy($id)
    {
        $advertisement = Advertisement::findOrFail($id);
        $advertisement->delete();

        return response()->json(['message' => 'Advertisement deleted successfully']);
    }
}
