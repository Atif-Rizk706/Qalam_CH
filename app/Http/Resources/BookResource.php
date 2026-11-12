<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookResource extends JsonResource
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
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'views_count' => $this->views_count,
            'is_book_of_the_day' => (bool) $this->is_book_of_the_day,
            'is_suggested' => (bool) $this->is_suggested,
            'is_archived' => $this->trashed(),
            'cover_image_url' => $this->formatUrl($this->cover_image_path),
            'file_url' => $this->formatUrl($this->file_path),
            'author' => $this->whenLoaded('author', fn() => new AuthorResource($this->author)),
            'category' => $this->whenLoaded('category', fn() => new CategoryResource($this->category)),
            'ratings_count' => $this->whenCounted('ratings'),
            'ratings' => RatingResource::collection($this->whenLoaded('ratings')),
        ];
    }

    /**
     * Format file or image path to absolute public URL.
     */
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
