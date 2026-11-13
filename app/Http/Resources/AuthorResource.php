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
            'image_url' => $this->image_path ? asset($this->image_path) : null,
            'country' => $this->whenLoaded('country', function () {
                $country = $this->resource->getRelation('country');
                return $country instanceof \App\Models\Country ? new CountryResource($country) : null;
            }),
        ];
    }
}

