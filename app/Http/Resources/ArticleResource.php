<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArticleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'body' => $this->when(
                $request->routeIs('articles.show') || $request->routeIs('admin.articles.show'),
                $this->body
            ),
            'excerpt' => $this->excerpt,
            'cover_image_url' => $this->cover_image_path ? asset($this->cover_image_path) : null,
            'file_url' => $this->file_path ? asset($this->file_path) : null,
            'read_time' => $this->read_time,
            'views_count' => $this->views_count,
            'is_published' => $this->is_published,
            'published_at' => $this->published_at?->format('d M Y'),
            'is_archived' => $this->trashed(),
            'author' => new AuthorResource($this->whenLoaded('author')),
            'type' => new ArticleTypeResource($this->whenLoaded('type')),
            'related_articles' => ArticleResource::collection($this->whenLoaded('related_articles')),
        ];
    }
}

