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
            'cover_image_url' => $this->cover_image_path ? asset($this->cover_image_path) : null,
            'author' => new AuthorResource($this->whenLoaded('author')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'ratings_count' => $this->whenCounted('ratings'),
            'ratings' => $this->whenLoaded('ratings'), // You could make a RatingResource for this if needed
        ];
    }
}
