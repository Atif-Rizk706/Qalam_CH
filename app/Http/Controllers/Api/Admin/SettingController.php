<?php

namespace App\Http\Controllers\Api\Admin;

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
     * Get all settings grouped by category for Admin Panel.
     */
    public function index(Request $request)
    {
        $settings = Setting::all();

        $grouped = $settings->groupBy('group')->map(function ($items) {
            return SettingResource::collection($items);
        });

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
            'grouped' => $grouped,
            'map' => $map,
            'settings' => SettingResource::collection($settings),
        ], 'Settings retrieved successfully.');
    }

    /**
     * Bulk update settings.
     * Supports:
     * 1. multipart/form-data with file upload ('hero_image') and text fields
     * 2. {"settings": {"phone": "...", "whatsapp": "..."}}
     * 3. {"settings": [{"key": "phone", "value": "..."}, ...]}
     */
    public function update(Request $request)
    {
        // 1. Handle hero_image file upload if present
        if ($request->hasFile('hero_image')) {
            $oldSetting = Setting::where('key', 'hero_image')->first();
            if ($oldSetting && $oldSetting->value) {
                $this->deleteFile($oldSetting->value);
            }

            $path = $this->uploadFile($request->file('hero_image'), 'images');
            Setting::updateOrCreate(
                ['key' => 'hero_image'],
                [
                    'value' => $path,
                    'display_name' => 'صورة الواجهة الرئيسية (Hero Image)',
                    'group' => 'hero',
                    'type' => 'image',
                ]
            );
        } elseif ($request->boolean('remove_hero_image') || $request->input('remove_hero_image') === '1') {
            $oldSetting = Setting::where('key', 'hero_image')->first();
            if ($oldSetting && $oldSetting->value) {
                $this->deleteFile($oldSetting->value);
                $oldSetting->update(['value' => null]);
            }
        }

        // 2. Handle text settings
        $data = $request->input('settings', $request->all());

        if (is_array($data) && !empty($data)) {
            // Check if data is array of objects: [{"key": "...", "value": "..."}, ...]
            if (isset($data[0]) && is_array($data[0])) {
                foreach ($data as $item) {
                    if (isset($item['key'])) {
                        Setting::updateOrCreate(
                            ['key' => $item['key']],
                            ['value' => $item['value'] ?? null]
                        );
                    }
                }
            } else {
                // Associative map: {"phone": "...", "title": "...", "title_descr": "..."}
                foreach ($data as $key => $value) {
                    if (in_array($key, ['settings', '_method', 'hero_image', 'remove_hero_image']) || is_array($value)) {
                        continue;
                    }

                    // Determine group and type for new keys
                    $group = 'general';
                    $type = 'text';
                    $displayName = $key;

                    if (in_array($key, ['title', 'title_descr', 'hero_title', 'hero_description', 'hero_badge'])) {
                        $group = 'hero';
                        if (in_array($key, ['title_descr', 'hero_description'])) {
                            $type = 'textarea';
                        }
                    }

                    $setting = Setting::where('key', $key)->first();
                    if ($setting) {
                        $setting->update([
                            'value' => is_scalar($value) ? (string) $value : json_encode($value),
                        ]);
                    } else {
                        Setting::create([
                            'key' => $key,
                            'value' => is_scalar($value) ? (string) $value : json_encode($value),
                            'display_name' => $displayName,
                            'group' => $group,
                            'type' => $type,
                        ]);
                    }
                }
            }
        }

        // 3. Keep hero aliases in sync
        $titleVal = Setting::where('key', 'title')->value('value');
        if ($titleVal !== null) {
            Setting::updateOrCreate(
                ['key' => 'hero_title'],
                [
                    'value' => $titleVal,
                    'display_name' => 'عنوان الواجهة (Hero Title)',
                    'group' => 'hero',
                    'type' => 'text',
                ]
            );
        }

        $descrVal = Setting::where('key', 'title_descr')->value('value');
        if ($descrVal !== null) {
            Setting::updateOrCreate(
                ['key' => 'hero_description'],
                [
                    'value' => $descrVal,
                    'display_name' => 'وصف الواجهة (Hero Description)',
                    'group' => 'hero',
                    'type' => 'textarea',
                ]
            );
        }

        $allSettings = Setting::all();
        $map = [];
        foreach ($allSettings as $setting) {
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
            'settings' => SettingResource::collection($allSettings),
        ], 'Settings updated successfully.');
    }

    /**
     * Get settings specifically for the hero / landing section.
     */
    public function hero()
    {
        return $this->getByGroup('hero');
    }

    /**
     * Get settings by group (e.g. hero, contact, social, general).
     */
    public function getByGroup(string $group)
    {
        $settings = Setting::where('group', $group)->get();

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

        $response = array_merge($map, [
            'group'    => $group,
            'map'      => $map,
            'settings' => SettingResource::collection($settings),
        ]);

        return $this->successResponse($response, ucfirst($group) . ' settings retrieved successfully.');
    }

    /**
     * Update a single setting by key.
     */
    public function updateSingle(Request $request, string $key)
    {
        $setting = Setting::where('key', $key)->firstOrFail();

        $validated = $request->validate([
            'value' => 'nullable',
            'display_name' => 'sometimes|string|max:255',
            'group' => 'sometimes|string|max:50',
            'type' => 'sometimes|string|max:50',
        ]);

        $setting->update($validated);

        return $this->successResponse(
            new SettingResource($setting),
            "Setting '{$key}' updated successfully."
        );
    }
}

