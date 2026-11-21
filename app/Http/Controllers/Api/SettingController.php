<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SettingResource;
use App\Models\Setting;
use App\Traits\ApiResponse;
use App\Traits\FileUpload;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    use ApiResponse, FileUpload;

    /**
     * Get public settings.
     * Returns a key-value map for quick frontend access and a list of items.
     */
    public function index(Request $request)
    {
        $query = Setting::query();

        if ($request->filled('group')) {
            $query->where('group', $request->group);
        }

        $settings = $query->get();

        // Convert to key-value dictionary for easy access in frontend:
        $map = [];
        foreach ($settings as $setting) {
            $val = $setting->value;
            if ($setting->type === 'image' || in_array($setting->key, ['hero_image', 'logo', 'favicon'])) {
                $val = $this->formatUrl($val);
            }
            $map[$setting->key] = $val;
        }

        if (isset($map['hero_image'])) {
            $map['hero_image_url'] = $map['hero_image'];
        }

        return $this->successResponse([
            'map' => $map,
            'settings' => SettingResource::collection($settings),
        ], 'Settings retrieved successfully.');
    }

    /**
     * Get a single setting by key.
     */
    public function show(string $key)
    {
        $setting = Setting::where('key', $key)->firstOrFail();

        return $this->successResponse(
            new SettingResource($setting),
            'Setting retrieved successfully.'
        );
    }
}

