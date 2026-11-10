<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Article::with(['author', 'type'])->withTrashed()->latest();

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(fn($q) => $q->where('title', 'like', "%{$term}%")
                ->orWhere('short_description', 'like', "%{$term}%"));
        }

        if ($request->filled('type_id')) {
            $query->where('type_id', $request->type_id);
        }

        if ($request->filled('is_published')) {
            $query->where('is_published', $request->boolean('is_published'));
        }

        if ($request->filled('author_id')) {
            $query->where('author_id', $request->author_id);
        }

        // Filter: only archived
        if ($request->boolean('archived')) {
            $query->onlyTrashed();
        } elseif (!$request->boolean('with_archived')) {
            $query->withoutTrashed();
        }

        $articles = $query->paginate((int) $request->input('per_page', 15));

        return $this->successResponse(
            ArticleResource::collection($articles)->response()->getData(true),
            'Articles retrieved successfully'
        );
    }

    public function show($id)
    {
        $article = Article::with(['author', 'type'])->withTrashed()->findOrFail($id);
        return $this->successResponse(new ArticleResource($article), 'Article retrieved successfully');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:articles,slug|max:255',
            'short_description' => 'nullable|string|max:500',
            'body' => 'required|string',
            'excerpt' => 'nullable|string|max:1000',
            'author_id' => 'required|exists:authors,id',
            'type_id' => 'nullable|exists:article_types,id',
            'read_time' => 'nullable|integer|min:1',
            'is_published' => 'nullable|boolean',
            'published_at' => 'nullable|date',
            'cover_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'file' => 'nullable|file|mimes:pdf,epub,doc,docx|max:51200',
        ]);

        // Auto-generate slug if not provided
        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['title']) . '-' . Str::random(5);

        // Handle cover image upload
        if ($request->hasFile('cover_image')) {
            $validated['cover_image_path'] = $request->file('cover_image')->store('articles/covers', 'public');
        }
        unset($validated['cover_image']);

        // Handle file upload
        if ($request->hasFile('file')) {
            $validated['file_path'] = $request->file('file')->store('articles/files', 'public');
        }
        unset($validated['file']);

        // Set published_at if publishing now
        if (!empty($validated['is_published']) && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $article = Article::create($validated);
        $article->load(['author', 'type']);

        return $this->successResponse(new ArticleResource($article), 'Article created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $article = Article::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:articles,slug,' . $article->id . '|max:255',
            'short_description' => 'nullable|string|max:500',
            'body' => 'sometimes|string',
            'excerpt' => 'nullable|string|max:1000',
            'author_id' => 'sometimes|exists:authors,id',
            'type_id' => 'nullable|exists:article_types,id',
            'read_time' => 'nullable|integer|min:1',
            'is_published' => 'nullable|boolean',
            'published_at' => 'nullable|date',
            'cover_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'file' => 'nullable|file|mimes:pdf,epub,doc,docx|max:51200',
        ]);

        // Handle cover image upload (replace old one)
        if ($request->hasFile('cover_image')) {
            if ($article->cover_image_path) {
                Storage::disk('public')->delete($article->cover_image_path);
            }
            $validated['cover_image_path'] = $request->file('cover_image')->store('articles/covers', 'public');
        }
        unset($validated['cover_image']);

        // Handle file upload (replace old one)
        if ($request->hasFile('file')) {
            if ($article->file_path) {
                Storage::disk('public')->delete($article->file_path);
            }
            $validated['file_path'] = $request->file('file')->store('articles/files', 'public');
        }
        unset($validated['file']);

        // Set published_at if publishing for the first time
        if (!empty($validated['is_published']) && !$article->published_at) {
            $validated['published_at'] = now();
        }

        $article->update($validated);
        $article->load(['author', 'type']);

        return $this->successResponse(new ArticleResource($article), 'Article updated successfully');
    }

    public function destroy($id)
    {
        $article = Article::findOrFail($id);
        $article->delete(); // SoftDelete

        return $this->successResponse(null, 'Article archived successfully');
    }

    public function restore($id)
    {
        $article = Article::onlyTrashed()->findOrFail($id);
        $article->restore();
        $article->load(['author', 'type']);

        return $this->successResponse(new ArticleResource($article), 'Article restored successfully');
    }

    public function forceDelete($id)
    {
        $article = Article::onlyTrashed()->findOrFail($id);

        // Delete files from storage
        if ($article->cover_image_path) {
            Storage::disk('public')->delete($article->cover_image_path);
        }
        if ($article->file_path) {
            Storage::disk('public')->delete($article->file_path);
        }

        $article->forceDelete();

        return $this->successResponse(null, 'Article permanently deleted');
    }

    public function archived()
    {
        $articles = Article::with(['author', 'type'])
            ->onlyTrashed()
            ->latest()
            ->paginate(15);

        return $this->successResponse(
            ArticleResource::collection($articles)->response()->getData(true),
            'Archived articles retrieved successfully'
        );
    }

    public function togglePublish($id)
    {
        $article = Article::withTrashed()->findOrFail($id);
        $article->is_published = !$article->is_published;

        if ($article->is_published && !$article->published_at) {
            $article->published_at = now();
        }

        $article->save();
        $article->load(['author', 'type']);

        $status = $article->is_published ? 'published' : 'unpublished';

        return $this->successResponse(new ArticleResource($article), "Article {$status} successfully");
    }
}

