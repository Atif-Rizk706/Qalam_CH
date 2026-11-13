<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SettingResource;
use App\Models\Setting;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    use ApiResponse;

    /**
     * Get all settings grouped by category for Admin Panel.
     */
    public function index(Request $request)
    {
        $settings = Setting::all();

        $grouped = $settings->groupBy('group')->map(function ($items) {
            return SettingResource::collection($items);
        });

        return $this->successResponse([
            'grouped'  => $grouped,
            'map'      => $settings->pluck('value', 'key'),
            'settings' => SettingResource::collection($settings),
        ], 'Settings retrieved successfully.');
    }

    /**
     * Bulk update settings.
     * Supports either:
     * 1. {"settings": {"phone": "...", "whatsapp": "..."}}
     * 2. {"settings": [{"key": "phone", "value": "..."}, ...]}
     */
    public function update(Request $request)
    {
        $data = $request->input('settings', $request->all());

        if (empty($data) || !is_array($data)) {
            return $this->errorResponse('Settings data is required.', 422);
        }

        $updatedKeys = [];

        // Check if data is array of objects: [{"key": "...", "value": "..."}, ...]
        if (isset($data[0]) && is_array($data[0])) {
            foreach ($data as $item) {
                if (isset($item['key'])) {
                    Setting::where('key', $item['key'])->update([
                        'value' => $item['value'] ?? null,
                    ]);
                    $updatedKeys[] = $item['key'];
                }
            }
        } else {
            // Associative map: {"phone": "...", "whatsapp": "..."}
            foreach ($data as $key => $value) {
                if ($key === 'settings' && is_array($value)) {
                    continue; // Skip wrapper if present
                }
                Setting::where('key', $key)->update([
                    'value' => is_scalar($value) ? (string) $value : json_encode($value),
                ]);
                $updatedKeys[] = $key;
            }
        }

        $allSettings = Setting::all();

        return $this->successResponse([
            'updated_keys' => $updatedKeys,
            'map'          => $allSettings->pluck('value', 'key'),
            'settings'     => SettingResource::collection($allSettings),
        ], 'Settings updated successfully.');
    }

    /**
     * Update a single setting by key.
     */
    public function updateSingle(Request $request, string $key)
    {
        $setting = Setting::where('key', $key)->firstOrFail();

        $validated = $request->validate([
            'value'        => 'nullable',
            'display_name' => 'sometimes|string|max:255',
            'group'        => 'sometimes|string|max:50',
            'type'         => 'sometimes|string|max:50',
        ]);

        $setting->update($validated);

        return $this->successResponse(
            new SettingResource($setting),
            "Setting '{$key}' updated successfully."
        );
    }
}

