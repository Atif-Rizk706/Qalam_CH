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
            'body' => $this->body,    // نص المقالة الكامل
            'content' => $this->body,    // اسم مرادف بديل للـ Frontend
            'excerpt' => $this->excerpt, // اقتباس أو مقتطف من المقالة
            'cover_image_url' => $this->formatUrl($this->cover_image_path),
            'read_time' => (int) $this->read_time,
            'views_count' => (int) $this->views_count,
            'is_published' => (bool) $this->is_published,
            'published_at' => $this->published_at?->format('d M Y'),
            'is_archived' => $this->trashed(),
            'author' => $this->whenLoaded('author', fn() => new AuthorResource($this->author)),
            'type' => $this->whenLoaded('type', fn() => new ArticleTypeResource($this->type)),
            'related_articles' => ArticleResource::collection($this->whenLoaded('related_articles')),
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
