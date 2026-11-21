<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthorResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'bio' => $this->bio,
            'country_id' => $this->country_id,
            'is_contemporary' => (bool) $this->is_contemporary,
            'death_year' => $this->death_year,
            'birth_year' => $this->birth_year,
            'life_status' => $this->life_status,
            'image_url' => $this->formatUrl($this->image_path),
            'country' => $this->whenLoaded('country', function () {
                $country = $this->resource->getRelation('country');
                return $country instanceof \App\Models\Country ? new CountryResource($country) : null;
            }),
        ];
    }

    /**
     * Format image path to full public URL — supports both public_direct and legacy storage.
     */
    protected function formatUrl(?string $path): ?string
    {
        if (!$path)
            return null;
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://'))
            return $path;
        if (file_exists(public_path($path)))
            return asset($path);
        if (str_starts_with($path, 'storage/'))
            return asset($path);
        return asset('storage/' . ltrim($path, '/'));
    }
}

