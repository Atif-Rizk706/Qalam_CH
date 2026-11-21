<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $value = $this->value;
        if ($this->type === 'image' || in_array($this->key, ['hero_image', 'logo', 'favicon'])) {
            $value = $this->formatUrl($value);
        }

        return [
            'id'           => $this->id,
            'key'          => $this->key,
            'value'        => $value,
            'raw_value'    => $this->value,
            'display_name' => $this->display_name,
            'group'        => $this->group,
            'type'         => $this->type,
        ];
    }

    protected function formatUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        if (file_exists(public_path($path))) {
            return asset($path);
        }

        if (str_starts_with($path, 'storage/')) {
            return asset($path);
        }

        return asset('storage/' . ltrim($path, '/'));
    }
}

